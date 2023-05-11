import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'router-outlet';

register('wm-router-outlet', (): IBuildTaskDef => {
    return {
        pre: attrs => `<div wmRouterOutlet name="wmRouterOutlet" ${getAttrMarkup(attrs)}><${tagName} (activate)="onActivate($event)">`,
        post: () => `</${tagName}></div>`
    };
});

export default () => {};
