import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, PROP_NUMBER_NOTIFY, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-pagination',
        new Map(
            [
                ['boundarylinks', {value: false, ...PROP_BOOLEAN}],
                ['class', PROP_STRING],
                ['dataset', PROP_STRING_NOTIFY],
                ['directionlinks', {value: true, ...PROP_BOOLEAN}],
                ['forceellipses', {value: true, ...PROP_BOOLEAN}],
                ['maxResults', PROP_NUMBER_NOTIFY],
                ['maxsize', {value: 5, ...PROP_NUMBER_NOTIFY}],
                ['name', PROP_STRING],
                ['navigation', {value: 'Basic', ...PROP_STRING_NOTIFY}],
                ['navigationalign', {value: 'left', ...PROP_STRING_NOTIFY}],
                ['navigationsize', PROP_NUMBER_NOTIFY],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['showrecordcount', PROP_BOOLEAN],
                ['tabindex', PROP_NUMBER]
            ]
        )
    );
};
