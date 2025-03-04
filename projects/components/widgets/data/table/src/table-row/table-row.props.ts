import { PROP_ANY, PROP_BOOLEAN, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-table-row',
        new Map(
            [
                ['class', PROP_STRING],
                ['closeothers', {value: true, ...PROP_BOOLEAN}],
                ['content', PROP_STRING],
                ['columnwidth', {value: '50px', ...PROP_STRING}],
                ['collapseicon', PROP_STRING],
                ['collapsetitle', PROP_STRING],
                ['expandtitle', PROP_STRING],
                ['expandicon', PROP_STRING],
                ['height', PROP_STRING],
                ['position', {value: '0', ...PROP_STRING}]
            ]
        )
    );
};
