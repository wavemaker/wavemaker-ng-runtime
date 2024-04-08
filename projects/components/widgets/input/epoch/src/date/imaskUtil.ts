import IMask from "imask";
declare const moment;

const weekNamesShort = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun'
];

const weekNamesLong = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
];
const monthNamesShort = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
]

const monthNamesLong = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];


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
                maxLength: 4
            },
            YY: {
                mask: IMask.MaskedRange,
                from: 0,
                to: 99,
                placeholderChar:'Y',
                maxLength: 2
            },
        M: {
            mask: IMask.MaskedRange,
            from: 1,
            to: 12,
            placeholderChar:'M',
            maxLength: 2
        },
        MM: {
            mask: IMask.MaskedRange,
            from: 1,
            to: 12,
            placeholderChar:'M',
            maxLength: 2
        },
        MMM: {
            mask: IMask.MaskedEnum,
            enum: monthNamesShort,
            placeholderChar:'M',
            maxLength: 3
        },
        MMMM: {
            mask: IMask.MaskedEnum,
            enum: monthNamesLong,
            placeholderChar:'M',
            minLength: 3
        },
        DD: {
            mask: IMask.MaskedRange,
            from: 1,
            to: 31,
            placeholderChar:'D',
            maxLength: 2
        },
        D: {
            mask: IMask.MaskedRange,
            from: 1,
            to: 31,
            placeholderChar:'D',
            maxLength: 1
        },
        ddd: {
            mask: IMask.MaskedEnum,
            enum: weekNamesShort,
            placeholderChar:'E',
            maxLength: 3
        },
        dddd: {
            mask: IMask.MaskedEnum,
            enum: weekNamesLong,
            placeholderChar:'E',
            minLength: 6
        },
    },
        autofix: true,
        lazy: false,
        overwrite: true,
        skipInvalid: true
    }
}











