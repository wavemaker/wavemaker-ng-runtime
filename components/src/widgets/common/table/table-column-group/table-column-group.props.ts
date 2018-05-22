import { PROP_STRING, PROP_STRING_NOTIFY, register } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-table-column-group',
        new Map(
            [
                ['backgroundcolor', PROP_STRING],
                ['caption', PROP_STRING_NOTIFY],
                ['col-class', PROP_STRING],
                ['name', PROP_STRING],
                ['textalignment', {value: 'center', ...PROP_STRING}]
            ]
        )
    );
};
