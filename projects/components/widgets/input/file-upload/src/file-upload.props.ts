import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register, registerFormWidget } from '@wm/components/base';
import { FormWidgetType } from '@wm/core';

export const registerProps = () => {
    register(
        'wm-fileupload',
        new Map(
            [
                ['caption', PROP_STRING],
                ['name', PROP_STRING],
                ['tabindex', PROP_NUMBER],
                ['multiple', PROP_BOOLEAN],
                ['fileuploadmessage' , PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['disabled', PROP_BOOLEAN],
                ['contenttype', PROP_STRING],
                ['maxfilesize', PROP_NUMBER],
                ['iconclass', {value: 'wi wi-file-upload', ...PROP_STRING}],
                ['deleteiconclass', {value: '', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['uploadpath', {...PROP_STRING}],
                ['datasource', PROP_STRING],
                ['selectedFiles', PROP_STRING],
                ['destination', PROP_STRING],
                ['filelistheight', PROP_NUMBER],
            ]
        )
    );
    registerFormWidget(
        FormWidgetType.UPLOAD,
        new Map([
            ['disabled', PROP_BOOLEAN],
            ['extensions', PROP_STRING],
            ['filetype', PROP_STRING],
            ['multiple', PROP_BOOLEAN],
            ['readonly', PROP_BOOLEAN],
            ['required', PROP_BOOLEAN]
        ])
    );
};
