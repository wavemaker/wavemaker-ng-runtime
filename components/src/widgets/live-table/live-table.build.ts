import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-livetable', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLiveTable ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
