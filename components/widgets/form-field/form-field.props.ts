import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-form-field',
        new Map(
            [
                ['dataset', PROP_STRING_NOTIFY],
                ['datafield', PROP_STRING_NOTIFY],
                ['disabled', PROP_BOOLEAN],
                ['displayfield', PROP_STRING_NOTIFY],
                ['displayname', PROP_STRING],
                ['hint', PROP_STRING],
                ['key', PROP_STRING],
                ['name', PROP_STRING],
                ['placeholder', PROP_STRING_NOTIFY],
                ['readonly', PROP_BOOLEAN],
                ['required', PROP_BOOLEAN_NOTIFY],
                ['show', PROP_BOOLEAN],
                ['validationmessage', PROP_STRING],
                ['widgettype', PROP_STRING]
            ]
        )
    );
};
