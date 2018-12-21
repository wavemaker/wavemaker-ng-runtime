import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-circle-progress', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCircleProgressBar ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});


export default () => {};
