import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-datetime', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmDateTime ${getAttrMarkup(attrs)} role="input">`,
        post: () => `</${tagName}>`
    };
});

export default () => {};