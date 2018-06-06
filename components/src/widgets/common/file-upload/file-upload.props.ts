import { PROP_BOOLEAN, PROP_BOOLEAN_NOTIFY, PROP_NUMBER_NOTIFY, PROP_STRING, PROP_STRING_NOTIFY, PROP_NUMBER, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-fileupload',
        new Map(
            [
                ['uploadpath', {...PROP_STRING_NOTIFY}],
                ['contenttype', PROP_STRING_NOTIFY],
                ['service', PROP_STRING_NOTIFY],
                ['operation', PROP_STRING_NOTIFY],
                ['mode', PROP_STRING_NOTIFY],
                ['multiple', PROP_BOOLEAN_NOTIFY],
                ['fileuploadmessage' , PROP_STRING],
                ['tabindex', PROP_NUMBER],
                ['selectedFiles', PROP_STRING],
                ['name', PROP_STRING],
                ['mode', PROP_STRING],
                ['destination', PROP_STRING],
                ['maxfilesize', PROP_NUMBER],
                ['caption', PROP_STRING],
                ['disabled', PROP_BOOLEAN],
                ['iconclass', PROP_STRING],
                ['filelistheight', PROP_NUMBER],
                ['class', PROP_STRING]
            ]
        )
    );
};


