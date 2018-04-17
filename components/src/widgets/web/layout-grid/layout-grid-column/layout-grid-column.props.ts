import { PROP_STRING, register, PROP_STRING_NOTIFY, PROP_BOOLEAN } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-gridcolumn',
        new Map(
            [
                ['class', PROP_STRING],
                ['name', PROP_STRING],
                ['columnwidth', PROP_STRING_NOTIFY],
                ['show', PROP_BOOLEAN],
            ]
        )
    );
};
