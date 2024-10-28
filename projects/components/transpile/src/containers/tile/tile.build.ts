import {getAttrMarkup, IBuildTaskDef, register} from '@wm/transpiler';

const  tagName = 'div';

register('wm-tile', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTile wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
