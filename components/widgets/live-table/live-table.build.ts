import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-livetable', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmLiveTable ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
