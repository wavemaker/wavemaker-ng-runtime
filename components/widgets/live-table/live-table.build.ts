import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-livetable', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLiveTable ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
