import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';
register('wm-tabpane', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTabPane  partialContainer ${getAttrMarkup(attrs)} wm-navigable-element="true" role="tabpanel">`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
