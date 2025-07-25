import IMask from "imask";
import * as momentLib from 'moment';

const moment = momentLib.default || window['moment'];

export function validateTheMaskedDate (format, locale)  {
    if(format == 'timestamp') {
        return false;
    }
    let modifiedFormat = format.toUpperCase().replace(/E/g, 'd');
    if((modifiedFormat.split('D').length - 1) === 1) {
        modifiedFormat = modifiedFormat.replace('D', 'DD');
    }
    if((modifiedFormat.split('M').length - 1) === 1 ) {
        modifiedFormat = modifiedFormat.replace('M', 'MM');
    }
    const parseFn=  str => {
        return moment(str, modifiedFormat).toDate();
    };
    const formatFn = date => {
            return moment(date, modifiedFormat).format(modifiedFormat);
        };
    return {
        mask: Date,
        pattern: modifiedFormat,
        format: formatFn,
        parse: parseFn,

        blocks: {
            YYYY: {
                mask: IMask.MaskedRange,
                    from: 1900,
                    to: 9999,
                    placeholderChar:'Y',
                maxLength: 4,
            },
            YYY: {
                mask: IMask.MaskedRange,
                from: 900,
                to: 999,
                placeholderChar:'Y',
                maxLength: 3,
            },
            YY: {
                mask: IMask.MaskedRange,
                from: 0,
                to: 99,
                placeholderChar:'Y',
                maxLength: 2,
            },
            Y: {
                mask: IMask.MaskedRange,
                from: 1900,
                to: 9999,
                placeholderChar:'Y',
                maxLength: 4,
            },
            M: {
                mask: IMask.MaskedRange,
                from: 1,
                to: 12,
                placeholderChar:'M',
                maxLength: 2,
            },
            MM: {
                mask: IMask.MaskedRange,
                from: 1,
                to: 12,
                placeholderChar:'M',
                maxLength: 2,
            },
            MMM: {
                mask: IMask.MaskedEnum,
                enum: Array.from({ length: 12 }, (_, i) =>
                    new Date(0, i).toLocaleString(locale, { month: 'short' })
                ),
                placeholderChar:'M',
                maxLength: 3,
            },
            MMMM: {
                mask: IMask.MaskedEnum,
               enum: Array.from({ length: 12 }, (_, i) =>
                    new Date(0, i).toLocaleString(locale, { month: 'long' })
                ),
                placeholderChar: "M",
                maxLength: 4
            },
            DD: {
                mask: IMask.MaskedRange,
                from: 1,
                to: 31,
                placeholderChar:'D',
                maxLength: 2,
            },
            D: {
                mask: IMask.MaskedRange,
                from: 1,
                to: 31,
                placeholderChar:'D',
                maxLength: 2,
            },
            ddd: {
                mask: IMask.MaskedEnum,
                enum: Array.from({ length: 7 }, (_, i) =>
                    new Date(0, 0, i + 1).toLocaleString(locale, { weekday: 'short' })
                ),
                placeholderChar:'E',
                maxLength: 3,
            },
            dddd: {
                mask: IMask.MaskedEnum,
                enum: Array.from({ length: 7 }, (_, i) =>
                    new Date(0, 0, i + 1).toLocaleString(locale, { weekday: 'long' })
                ),
                placeholderChar:'E',
                minLength: 6,
            },
        },
        autofix: true,
        lazy: false,
        overwrite: true,
        skipInvalid: true
    }
}
