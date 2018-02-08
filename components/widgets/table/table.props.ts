import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, PROP_BOOLEAN_NOTIFY, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-table',
        new Map(
            [
                ['class', PROP_STRING],
                ['dataset', PROP_STRING_NOTIFY],
                ['enablecolumnselection', PROP_BOOLEAN],
                ['enablesort', PROP_BOOLEAN],
                ['filtermode', PROP_STRING_NOTIFY],
                ['gridclass', PROP_STRING],
                ['gridfirstrowselect', PROP_BOOLEAN_NOTIFY],
                ['iconclass', PROP_STRING],
                ['loadingdatamsg', PROP_STRING],
                ['multiselect', PROP_BOOLEAN_NOTIFY],
                ['name', PROP_STRING],
                ['navigation', PROP_STRING_NOTIFY],
                ['navigationalign', PROP_STRING],
                ['nodatamessage', PROP_STRING],
                ['pagesize', PROP_NUMBER],
                ['radioselect', PROP_BOOLEAN_NOTIFY],
                ['show', PROP_BOOLEAN],
                ['showheader', PROP_BOOLEAN_NOTIFY],
                ['showrecordcount', PROP_BOOLEAN_NOTIFY],
                ['showrowindex', PROP_BOOLEAN_NOTIFY],
                ['subheading', PROP_STRING],
                ['tabindex', PROP_NUMBER],
                ['title', PROP_STRING],
            ]
        )
    );
};
