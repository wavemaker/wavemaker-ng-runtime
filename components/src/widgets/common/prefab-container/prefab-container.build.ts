import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-prefab-container', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPrefabContainer ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};