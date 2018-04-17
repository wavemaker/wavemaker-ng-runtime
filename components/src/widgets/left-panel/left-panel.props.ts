import { PROP_NUMBER_NOTIFY, PROP_STRING, PROP_STRING_NOTIFY, register } from '../base/framework/widget-props';

export const registerProps = () => {
    register(
        'wm-left-panel',
        new Map(
            [
                ['class', {value: '', ...PROP_STRING}],
                ['columnwidth', PROP_NUMBER_NOTIFY],
                ['content', PROP_STRING_NOTIFY],
                ['name', PROP_STRING]
            ]
        )
    );
};
