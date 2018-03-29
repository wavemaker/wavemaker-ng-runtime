import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const  tagName = 'div';

register('wm-tile', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTile ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};