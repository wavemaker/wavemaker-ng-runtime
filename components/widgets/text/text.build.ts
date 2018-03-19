import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'input';

register('wm-text', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmText ngModel ${getAttrMarkup(attrs)}>`;
        }
    };
});

export default () => {};
