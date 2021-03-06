import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-table-row-action',
        new Map(
            [
                ['accessroles', PROP_STRING],
                ['action', PROP_STRING],
                ['caption', PROP_STRING],
                ['class ', {value: 'btn-secondary', ...PROP_STRING}],
                ['disabled', {value: false, ...PROP_BOOLEAN}],
                ['display-name', PROP_STRING],
                ['hyperlink', PROP_STRING],
                ['iconclass', PROP_STRING],
                ['key', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['target', PROP_STRING],
                ['title', PROP_STRING],
                ['widget-type', {value: 'button', ...PROP_STRING}]
            ]
        )
    );
};
