import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-pagination',
        new Map(
            [
                ['boundarylinks', {value: false, ...PROP_BOOLEAN}],
                ['class', PROP_STRING],
                ['dataset', PROP_ANY],
                ['directionlinks', {value: true, ...PROP_BOOLEAN}],
                ['forceellipses', {value: true, ...PROP_BOOLEAN}],
                ['maxResults', PROP_NUMBER],
                ['maxsize', {value: 5, ...PROP_NUMBER}],
                ['name', PROP_STRING],
                ['navigation', {value: 'Basic', ...PROP_STRING}],
                ['navigationalign', {value: 'left', ...PROP_STRING}],
                ['navigationsize', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['showrecordcount', PROP_BOOLEAN],
                ['tabindex', {value: 0, ...PROP_NUMBER}]
            ]
        )
    );
};
