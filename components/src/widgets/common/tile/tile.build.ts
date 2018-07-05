import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const  tagName = 'div';

register('wm-tile', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTile aria-describedby="Tile" wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};