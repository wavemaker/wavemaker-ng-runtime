import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-progress-circle', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmProgressCircle ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});


export default () => {};
