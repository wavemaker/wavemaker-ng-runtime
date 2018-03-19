import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const  tagName = 'div';

register('wm-tile', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmTile ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};