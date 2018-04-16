import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'input';

register('wm-text', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmText ngModel role="input" ${getAttrMarkup(attrs)}>`
    };
});

export default () => {};
