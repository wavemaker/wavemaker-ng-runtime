import { Pipe, PipeTransform, Injectable } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CURRENCY_INFO, isDefined, App, CustomPipeManager } from '@wm/core';


declare const moment, _, $;

const getEpochValue = data => {
    let epoch;
    // For data in form of string number ('123'), convert to number (123). And don't parse date objects.
    if (!_.isDate(data) && !isNaN(data)) {
        data = parseInt(data, 10);
    }
    // get the timestamp value. If data is time string, append date string to the time value
    epoch = moment(data).valueOf() || moment(new Date().toDateString() + ' ' + data).valueOf();
    return epoch;
};

@Pipe({
    name: 'trailingZeroDecimalPipe'
})
export class TrailingZeroDecimalPipe implements PipeTransform {
    transform(value: any, selectedLocale: string, numberfiler: string, localefilter: any, trailingzero: boolean, decimalValue: string): any {
        const number =  this.decimalPipe.transform(value, numberfiler, localefilter || selectedLocale);
        return trailingzero ? Number(number).toFixed(decimalValue.length) : number;
    }

    constructor(private decimalPipe: DecimalPipe) { }

}

@Pipe({
    name: 'toDate'
})
export class ToDatePipe implements PipeTransform {
    transform(data: any, format: any) {
        let timestamp;
        // 'null' is to be treated as a special case, If user wants to enter null value, empty string will be passed to the backend
        if (data === 'null' || data === '') {
            return '';
        }
        if (!isDefined(data)) {
            return '';
        }
        timestamp = getEpochValue(data);
        if (timestamp) {
            if (format === 'timestamp') {
                return timestamp;
            }
            return this.datePipe.transform(timestamp, format);
        }
        return '';
    }

    constructor(private datePipe: DatePipe) { }
}

@Pipe({
    name: 'toNumber'
})
export class ToNumberPipe implements PipeTransform {
    transform(data, fracSize) {
        if (fracSize && !String(fracSize).match(/^(\d+)?\.((\d+)(-(\d+))?)?$/)) {
            fracSize = '1.' + fracSize + '-' + fracSize;
        }
        if (!_.isNaN(+data)) {
            return this.decimalPipe.transform(data, fracSize);
        }
    }
    constructor(private decimalPipe: DecimalPipe) { }
}

@Pipe({
    name: 'toCurrency'
})
export class ToCurrencyPipe implements PipeTransform {
    transform(data, currencySymbol, fracSize) {
        const _currencySymbol = (CURRENCY_INFO[currencySymbol] || {}).symbol || currencySymbol || '',
            _val = new ToNumberPipe(this.decimalPipe).transform(data, fracSize);
        return _val ? _currencySymbol + _val : '';
    }

    constructor(private decimalPipe: DecimalPipe) { }
}

@Pipe({
    name: 'prefix'
})
export class PrefixPipe implements PipeTransform {
    transform(data, padding) {
        return (_.isUndefined(data) || data === null || data === '') ? data : ((padding || '') + data);
    }
}

@Pipe({
    name: 'suffix'
})
export class SuffixPipe implements PipeTransform {
    transform(data, padding) {
        return (_.isUndefined(data) || data === null || data === '') ? data : (data + (padding || ''));
    }
}


/**
 * Custom pipe: It is work as interceptor between the user custom pipe function and angular pipe
 */
@Pipe({
    name: 'custom'
})
export class CustomPipe implements PipeTransform {
    constructor(private custmeUserPipe: CustomPipeManager) {

    }
    transform(data, pipename) {
       let argumentArr = [];
       for(let i =2 ; i<arguments.length; i++ ){
        argumentArr.push(arguments[i]);
       }

        let pipeRef = this.custmeUserPipe.getCustomPipe(pipename);
        if(!pipeRef || !_.isFunction(pipeRef.formatter)){
            console.warn('formatter is not defined, please check the custom pipes documentation');
            return data;
        }

        try{
            return pipeRef.formatter(data, ...argumentArr);
        } catch(error){
            console.error('Pipe name: '+pipename, error);
            return data;
         }
    }
}

@Pipe({
    name: 'timeFromNow'
})
export class TimeFromNowPipe implements PipeTransform {
    transform(data) {
        let timestamp;
        if (!isDefined(data)) {
            return undefined;
        }
        timestamp = getEpochValue(data);
        return timestamp ? moment(timestamp).fromNow() : undefined;
    }
}

@Pipe({
    name: 'numberToString'
})
export class NumberToStringPipe extends ToNumberPipe implements PipeTransform { }

@Pipe({
    name: 'stringToNumber'
})
export class StringToNumberPipe implements PipeTransform {
    transform(data) {
        return Number(data) || undefined;
    }
}

@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {
    transform(data: any[], field: any, value: any) {
        if (!data) {
            return [];
        }
        // If object is passed as first paramter
        if (_.isObject(field)) {
            return _.filter(data, field);
        }
        // If key value pair is provided
        return _.filter(data, item => {
            return _.includes(item[field], value);
        });
    }
}

@Pipe({
    name: 'filesize'
})
export class FileSizePipe implements PipeTransform {
    transform(bytes: number, precision: number) {
        const units = [
            'bytes',
            'KB',
            'MB',
            'GB',
            'TB',
            'PB'
        ];

        /*Todo[shubham]
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
            return isMobile() ? '' : '?';
        }*/
        let unit = 0;
        while (bytes >= 1024) {
            bytes /= 1024;
            unit++;
        }
        return bytes.toFixed(+precision) + ' ' + units[unit];
    }
}

@Pipe({
    name: 'fileIconClass'
})
export class FileIconClassPipe implements PipeTransform {
    transform(fileExtension: any) {
        const fileClassMapping = {
            'zip'       :   'fa-file-zip-o',
            'pdf'       :   'fa-file-pdf-o',
            'rar'       :   'fa-file-archive-o',
            'txt'       :   'fa-file-text-o',
            'ppt'       :   'fa-file-powerpoint-o',
            'pot'       :   'fa-file-powerpoint-o',
            'pps'       :   'fa-file-powerpoint-o',
            'pptx'      :   'fa-file-powerpoint-o',
            'potx'      :   'fa-file-powerpoint-o',
            'ppsx'      :   'fa-file-powerpoint-o',
            'mpg'       :   'fa-file-movie-o',
            'mp4'       :   'fa-file-movie-o',
            'mov'       :   'fa-file-movie-o',
            'avi'       :   'fa-file-movie-o',
            'mp3'       :   'fa-file-audio-o',
            'docx'      :   'fa-file-word-o',
            'js'        :   'fa-file-code-o',
            'md'        :   'fa-file-code-o',
            'html'      :   'fa-file-code-o',
            'css'       :   'fa-file-code-o',
            'xlsx'      :   'fa-file-excel-o',
            'png'       :   'fa-file-image-o',
            'jpg'       :   'fa-file-image-o',
            'jpeg'      :   'fa-file-image-o',
            'file'      :   'fa-file-o',
            'default'   :   'fa-file-o'
        };

        return 'fa ' + (fileClassMapping[fileExtension] || 'fa-file-o');
    }
}

@Pipe({
    name: 'stateClass'
})
export class StateClassPipe implements PipeTransform {
    transform(state) {
        const stateClassMap = {
            'success'   : 'wi wi-done text-success',
            'error'     : 'wi wi-error text-danger'
        };
        return stateClassMap[state.toLowerCase()];
    }
}

@Pipe({
    name: 'fileExtensionFromMime'
})
export class FileExtensionFromMimePipe implements PipeTransform {
    transform(mimeType: any) {
        const typeMapping = {
            'audio/aac': '.aac',
            'application/x-abiword': '.abw',
            'application/vnd.android.package-archive': '.apk',
            'video/x-msvideo': '.avi',
            'application/vnd.amazon.ebook': '.azw',
            'application/octet-stream': '.bin',
            'image/bmp': '.bmp',
            'application/x-bzip': '.bz',
            'application/x-bzip2': '.bz2',
            'application/x-csh': '.csh',
            'text/css': '.css',
            'text/csv': '.csv',
            'application/msword': '.doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
            'application/vnd.ms-fontobject': '.eot',
            'application/epub+zip': '.epub',
            'application/ecmascript': '.es',
            'image/gif': '.gif',
            'text/html': '.html',
            'image/x-icon': '.ico',
            'text/calendar': '.ics',
            'application/java-archive': '.jar',
            'image/jpeg': ['.jpeg', '.jpg'],
            'application/javascript': '.js',
            'application/json': '.json',
            'audio/midi': '.mid',
            'audio/x-midi': '.midi',
            'video/mpeg': '.mpeg',
            'application/vnd.apple.installer+xml': 'mpkg',
            'application/vnd.oasis.opendocument.presentation': '.odp',
            'application/vnd.oasis.opendocument.spreadsheet': '.ods',
            'application/vnd.oasis.opendocument.text': '.odt',
            'audio/ogg': '.oga',
            'video/ogg': '.ogv',
            'application/ogg': '.ogx',
            'font/otf': '.otf',
            'image/png': '.png',
            'application/pdf': '.pdf',
            'application/vnd.ms-powerpoint': '.ppt',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
            'application/x-rar-compressed': '.rar',
            'application/rtf': '.rtf',
            'application/x-sh': '.sh',
            'image/svg+xml': '.svg',
            'application/x-shockwave-flash': '.swf',
            'application/x-tar': '.tar',
            'image/tiff': '.tiff',
            'application/typescript': '.ts',
            'font/ttf': '.ttf',
            'text/plain': '.txt',
            'application/vnd.visio': '.vsd',
            'audio/wav': '.wav',
            'audio/webm': '.weba',
            'video/webm': '.webm',
            'image/webp': '.webp',
            'font/woff': '.woff',
            'font/woff2': '.woff2',
            'application/xhtml+xml': '.xhtml',
            'application/vnd.ms-excel': '.xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
            'application/xml': '.xml',
            'application/vnd.mozilla.xul+xml': '.xul',
            'application/zip': '.zip',
            'video/3gpp': '.3gp',
            'audio/3gpp': '.3gp',
            'video/3gpp2': '.3g2',
            'audio/3gpp2': '.3g2',
            'application/x-7z-compressed': '.7z'
        };

        return typeMapping[mimeType];
    }
}


