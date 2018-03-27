import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const  tagName = 'div';

register('wm-tile', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTile ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};