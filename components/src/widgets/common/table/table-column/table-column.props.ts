import { PROP_BOOLEAN, PROP_STRING, PROP_BOOLEAN_NOTIFY, register } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-table-column',
        new Map(
            [
                ['backgroundcolor', PROP_STRING],
                ['binding', PROP_STRING],
                ['caption', PROP_STRING],
                ['colClass', PROP_STRING],
                ['colNgClass', PROP_STRING],
                ['defaultvalue', PROP_STRING],
                ['disabled', PROP_BOOLEAN],
                ['editWidgetType', PROP_STRING],
                ['filterwidget', PROP_STRING],
                ['formatpattern', PROP_STRING],
                ['generator', PROP_STRING],
                ['limit', PROP_STRING],
                ['mobiledisplay', PROP_BOOLEAN],
                ['pcdisplay', PROP_BOOLEAN],
                ['primaryKey', PROP_STRING],
                ['readonly', PROP_BOOLEAN],
                ['relatedEntityName', PROP_STRING],
                ['required', PROP_BOOLEAN_NOTIFY],
                ['searchable', PROP_BOOLEAN_NOTIFY],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['sortable', PROP_BOOLEAN],
                ['textalignment', PROP_STRING],
                ['textcolor', PROP_STRING],
                ['type', PROP_STRING],
                ['width', PROP_STRING],
            ]
        )
    );
};
