import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-logindialog', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmDialog wmLoginDialog ${getAttrMarkup(attrs)} eventsource.bind="Actions.loginAction"><ng-template #dialogBody>`,
        post: () => `</ng-template></${tagName}>`
    };
});

export default () => {};
