import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CONSTANTS_CURRENCY, isDefined } from '@wm/utils';

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
        if (!String(fracSize).match(/^(\d+)?\.((\d+)(-(\d+))?)?$/)) {
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
        const _currencySymbol = (CONSTANTS_CURRENCY[currencySymbol] || {}).symbol || currencySymbol || '',
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