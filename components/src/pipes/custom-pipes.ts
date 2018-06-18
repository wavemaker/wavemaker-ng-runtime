import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CURRENCY_INFO, isDefined } from '@wm/core';

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
            return undefined;
        }
        timestamp = getEpochValue(data);
        if (timestamp) {
            if (format === 'timestamp') {
                return timestamp;
            }
            return this.datePipe.transform(timestamp, format);
        }
        return undefined;
    }

    constructor(private datePipe: DatePipe) {}
}

@Pipe({
    name: 'toNumber'
})
export class ToNumberPipe implements PipeTransform {
    transform(data, fracSize) {
        if (fracSize && !String(fracSize).match(/^(\d+)?\.((\d+)(-(\d+))?)?$/)) {
            fracSize = '1.' + fracSize + '-' + fracSize;
        }
        return this.decimalPipe.transform(data, fracSize);
    }
    constructor(private decimalPipe: DecimalPipe) {}
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

    constructor(private decimalPipe: DecimalPipe) {}
}

@Pipe({
    name: 'prefix'
})
export class PrefixPipe implements PipeTransform {
    transform(data, padding) {
        return data ? ((padding || '') + data) : padding;
    }
}

@Pipe({
    name: 'suffix'
})
export class SuffixPipe implements PipeTransform {
    transform(data, padding) {
        return data ? (data + (padding || '')) : padding;
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
export class NumberToStringPipe extends ToNumberPipe implements PipeTransform {}

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
    transform(data: any[], field: string, value: any) {
        if (!data) {
            return [];
        }
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
            'error'     : 'wi wi-cancel text-danger'
        };
        return stateClassMap[state.toLowerCase()];
    }
}