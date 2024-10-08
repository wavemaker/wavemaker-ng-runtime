import {getAttrMarkup, getDataSource, IBuildTaskDef, register} from '@wm/transpiler';

const tagName = 'div';

register('wm-fileupload', (): IBuildTaskDef => {
    return {
        pre: attrs => {
            if (attrs.get('select.event')) {
                const onSelectBinding = getDataSource(attrs.get('select.event'));
                attrs.set('datasource.bind', onSelectBinding);
            }
            return `<${tagName} wmFileUpload ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
