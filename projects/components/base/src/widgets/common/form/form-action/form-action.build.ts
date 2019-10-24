import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

const registerAction = (tmpl): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmFormAction name="${attrs.get('name') || attrs.get('key')}" ${getAttrMarkup(attrs)} ${tmpl}>`,
        post: () => `</${tagName}>`
    };
};

register('wm-form-action', registerAction.bind(this, ''));
register('wm-filter-action', registerAction.bind(this, ` update-mode="true" `));

export default () => {};
