import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'section';

register('wm-partial', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmPartial data-role="partial" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
