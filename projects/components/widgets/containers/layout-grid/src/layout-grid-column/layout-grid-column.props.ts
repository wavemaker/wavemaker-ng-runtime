import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-gridcolumn',
        new Map(
            [
                ['class', PROP_STRING],
                ['name', PROP_STRING],
                ['columnwidth', PROP_NUMBER],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['xscolumnwidth', PROP_NUMBER]
            ]
        )
    );
};
