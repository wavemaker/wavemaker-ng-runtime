import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'input';

register('wm-text', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmText ngModel ${getAttrMarkup(attrs)}>`
    };
});

export default () => {};
