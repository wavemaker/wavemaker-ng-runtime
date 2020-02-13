import { PROP_BOOLEAN, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-spinner',
        new Map(
            [
                ['animation', {value: 'spin', PROP_STRING}],
                ['caption', {value: 'Loading...', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['iconclass', {value: 'fa fa-circle-o-notch fa-spin', ...PROP_STRING}],
                ['iconsize', PROP_STRING],
                ['image', PROP_STRING],
                ['imageheight', PROP_STRING],
                ['imagewidth', {value: '20px', ...PROP_STRING}],
                ['name', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['type', {value: 'icon', ...PROP_STRING}],
                ['servicevariabletotrack', PROP_STRING]
            ]
        )
    );
};
