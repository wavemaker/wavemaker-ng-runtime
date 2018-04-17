import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-livetable', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmLiveTable ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
