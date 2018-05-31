import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const  tagName = 'div';

register('wm-tile', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTile aria-describedby="Tile" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};