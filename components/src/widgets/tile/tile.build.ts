import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const  tagName = 'div';

register('wm-tile', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTile ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};