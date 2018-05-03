import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-label',
        new Map(
            [
                ['class', PROP_STRING],
                ['direction', PROP_STRING],
                ['name', PROP_STRING],
                ['scrollamount', PROP_NUMBER],
                ['scrolldelay', PROP_NUMBER],
                ['show', PROP_BOOLEAN],
            ]
        )
    );
};
