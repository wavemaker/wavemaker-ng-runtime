import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'img';

register('wm-picture', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPicture ${getAttrMarkup(attrs)}>`
    };
});

export default () => {};
