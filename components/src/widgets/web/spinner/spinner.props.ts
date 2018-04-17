import { register, PROP_STRING, PROP_BOOLEAN, PROP_STRING_NOTIFY } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-spinner',
        new Map(
            [
                ['animation', PROP_STRING_NOTIFY],
                ['caption', {value: 'Loading...', ...PROP_STRING_NOTIFY}],
                ['iconclass', {value: 'fa fa-circle-o-notch', ...PROP_STRING}],
                ['iconsize', PROP_STRING],
                ['image', PROP_STRING_NOTIFY],
                ['imageheight', PROP_STRING],
                ['imagewidth', {value: '20px', ...PROP_STRING}],
                ['servicevariabletotrack', PROP_STRING_NOTIFY],
                ['show', PROP_BOOLEAN],
                ['type', {value: 'icon', ...PROP_STRING}]
            ]
        )
    );
};