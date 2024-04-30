import IMask from "imask";
declare const moment;


export function validateTheMaskedDate (format)  {
    if(format == 'timestamp') {
        return {};
    }
    const modifiedFormat = format.toUpperCase().replace(/E/g, 'd');
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
                overwrite: false,
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
                from: 0,
                to: 9,
                placeholderChar:'Y',
                maxLength: 1,
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
                new Date(0, i).toLocaleString(window.navigator.language, { month: 'short' })
            ),
            placeholderChar:'M',
            maxLength: 3,
        },
        MMMM: {
            mask: IMask.MaskedEnum,
            enum: Array.from({ length: 12 }, (_, i) =>
                new Date(0, i).toLocaleString(window.navigator.language, { month: 'long' })
            ),
            placeholderChar:'M',
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
            maxLength: 1,
        },
        ddd: {
            mask: IMask.MaskedEnum,
            enum: Array.from({ length: 7 }, (_, i) =>
                new Date(0, 0, i + 1).toLocaleString(window.navigator.language, { weekday: 'short' })
            ),
            placeholderChar:'E',
            maxLength: 3,
        },
        dddd: {
            mask: IMask.MaskedEnum,
            enum: Array.from({ length: 7 }, (_, i) =>
                new Date(0, 0, i + 1).toLocaleString(window.navigator.language, { weekday: 'long' })
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











