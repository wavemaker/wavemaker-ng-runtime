import { getAttrMarkup, getDataSource, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-fileupload', (): IBuildTaskDef => {
    return {
        pre: attrs => {
            if (attrs.get('select.event')) {
                const onSelectBinding = getDataSource(attrs.get('select.event'));
                attrs.set('datasource.bind', onSelectBinding);
            }
            return `<${tagName} wmFileUpload ${getAttrMarkup(attrs)} role="input">`;
        },
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/input/file-upload',
            name: 'FileUploadModule'
        },{
            from: '@wm/mobile/components/input/file-upload',
            name: 'FileUploadModule',
            as: 'WM_MobileFileUploadModule',
            platformType: 'MOBILE'
        }]
    };
});

export default () => {};
