import { PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-table-column-group',
        new Map(
            [
                ['backgroundcolor', PROP_STRING],
                ['caption', PROP_STRING],
                ['col-class', PROP_STRING],
                ['name', PROP_STRING],
                ['textalignment', {value: 'center', ...PROP_STRING}]
            ]
        )
    );
};
