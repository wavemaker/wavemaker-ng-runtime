import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-page-content', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmPageContent ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
