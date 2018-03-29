import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-page-content', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPageContent ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
