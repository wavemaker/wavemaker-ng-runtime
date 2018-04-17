import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-page-content', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPageContent ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
