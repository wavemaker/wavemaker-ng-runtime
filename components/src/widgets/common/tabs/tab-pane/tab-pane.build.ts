import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';


const tagName = 'div';
register('wm-tabpane', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTabPane  partialContainer ${getAttrMarkup(attrs)} role="tabpanel">`,
        post: () => `</${tagName}>`
    };
});

export default () => {};


