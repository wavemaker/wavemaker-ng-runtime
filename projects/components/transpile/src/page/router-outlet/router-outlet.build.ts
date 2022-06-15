import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'router-outlet';

register('wm-router-outlet', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
