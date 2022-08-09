import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'router-outlet';

register('wm-router-outlet', (): IBuildTaskDef => {
    return {
        pre: attrs => `<div wmRouterOutlet ${getAttrMarkup(attrs)}><${tagName}>`,
        post: () => `</${tagName}></div>`
    };
});

export default () => {};
