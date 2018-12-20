import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

declare const _;

const tagName = 'div';

register('wm-circle-progress', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCircleProgressBar ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});


export default () => {};
