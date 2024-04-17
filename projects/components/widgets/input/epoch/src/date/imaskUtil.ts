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
                overwrite: false,
            },
            YY: {
                mask: IMask.MaskedRange,
                from: 0,
                to: 99,
                placeholderChar:'Y',
                maxLength: 2,
                overwrite: false,
            },
        M: {
            mask: IMask.MaskedRange,
            from: 1,
            to: 12,
            placeholderChar:'M',
            maxLength: 2,
            overwrite: false,
        },
        MM: {
            mask: IMask.MaskedRange,
            from: 1,
            to: 12,
            placeholderChar:'M',
            maxLength: 2,
            overwrite: false,
        },
        MMM: {
            mask: IMask.MaskedEnum,
            enum: Array.from({ length: 12 }, (_, i) =>
                new Date(0, i).toLocaleString(window.navigator.language, { month: 'short' })
            ),
            placeholderChar:'M',
            maxLength: 3,
            overwrite: false,
        },
        MMMM: {
            mask: IMask.MaskedEnum,
            enum: Array.from({ length: 12 }, (_, i) =>
                new Date(0, i).toLocaleString(window.navigator.language, { month: 'long' })
            ),
            placeholderChar:'M',
            minLength: 3,
            overwrite: false,
        },
        DD: {
            mask: IMask.MaskedRange,
            from: 1,
            to: 31,
            placeholderChar:'D',
            maxLength: 2,
            overwrite: false,
        },
        D: {
            mask: IMask.MaskedRange,
            from: 1,
            to: 31,
            placeholderChar:'D',
            maxLength: 1,
            overwrite: false,
        },
        ddd: {
            mask: IMask.MaskedEnum,
            enum: Array.from({ length: 7 }, (_, i) =>
                new Date(0, 0, i + 1).toLocaleString(window.navigator.language, { weekday: 'short' })
            ),
            placeholderChar:'E',
            maxLength: 3,
            overwrite: false,
        },
        dddd: {
            mask: IMask.MaskedEnum,
            enum: Array.from({ length: 7 }, (_, i) =>
                new Date(0, 0, i + 1).toLocaleString(window.navigator.language, { weekday: 'long' })
            ),
            placeholderChar:'E',
            minLength: 6,
            overwrite: false,
        },
    },
        autofix: true,
        lazy: false,
        overwrite: false,
        skipInvalid: true

    }
}











