import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'p';

register('wm-message', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmMessage aria-label="Notification Alerts" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};