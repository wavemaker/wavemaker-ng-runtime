import { register, PROP_STRING, PROP_BOOLEAN, PROP_STRING_NOTIFY } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-spinner',
        new Map(
            [
                ['animation', PROP_STRING_NOTIFY],
                ['caption', Object.assign({value: 'Loading...'}, PROP_STRING_NOTIFY)],
                ['iconclass', Object.assign({value: 'fa fa-circle-o-notch'}, PROP_STRING)],
                ['iconsize', PROP_STRING],
                ['image', PROP_STRING_NOTIFY],
                ['imageheight', PROP_STRING],
                ['imagewidth', Object.assign({value: '20px'}, PROP_STRING)],
                ['servicevariabletotrack', PROP_STRING_NOTIFY],
                ['show', PROP_BOOLEAN],
                ['type', Object.assign({value: 'icon'}, PROP_STRING)]
            ]
        )
    );
};