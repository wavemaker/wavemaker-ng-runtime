import {getAttrMarkup, getDataSource, IBuildTaskDef, register} from '@wm/transpiler';

const tagName = 'div';

register('wm-fileupload', (): IBuildTaskDef => {
    return {
        pre: attrs => {
            if (attrs.get('select.event')) {
                const onSelectBinding = getDataSource(attrs.get('select.event'));
                attrs.set('datasource.bind', onSelectBinding);
            }
            if (attrs.get('delete.event')) {
                const onDeleteBinding = getDataSource(attrs.get('delete.event'));
                attrs.set('deletedatasource.bind', onDeleteBinding);
            }
            return `<${tagName} wmFileUpload ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
