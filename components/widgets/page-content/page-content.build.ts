import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-page-content', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPageContent ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
