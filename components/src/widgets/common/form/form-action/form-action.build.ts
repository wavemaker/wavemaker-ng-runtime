import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

const registerAction = (tmpl): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmFormAction ${getAttrMarkup(attrs)} ${tmpl}>`,
        post: () => `</${tagName}>`
    };
};

register('wm-form-action', registerAction.bind(this, ''));
register('wm-filter-action', registerAction.bind(this, ` update-mode="true" `));

export default () => {};
