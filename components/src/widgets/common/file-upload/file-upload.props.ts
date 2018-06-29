import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-fileupload',
        new Map(
            [
                ['uploadpath', {...PROP_STRING}],
                ['contenttype', PROP_STRING],
                ['service', PROP_STRING],
                ['operation', PROP_STRING],
                ['mode', PROP_STRING],
                ['multiple', PROP_BOOLEAN],
                ['fileuploadmessage' , PROP_STRING],
                ['tabindex', PROP_NUMBER],
                ['selectedFiles', PROP_STRING],
                ['name', PROP_STRING],
                ['mode', PROP_STRING],
                ['destination', PROP_STRING],
                ['maxfilesize', PROP_NUMBER],
                ['caption', PROP_STRING],
                ['disabled', PROP_BOOLEAN],
                ['iconclass', {value: 'wi wi-file-upload', ...PROP_STRING}],
                ['filelistheight', PROP_NUMBER],
                ['class', PROP_STRING]
            ]
        )
    );
};


