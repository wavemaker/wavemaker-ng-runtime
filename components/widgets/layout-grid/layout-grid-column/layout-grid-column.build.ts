import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-gridcolumn', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmLayoutGridColumn ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};