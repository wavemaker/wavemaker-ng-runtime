import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'img';

register('wm-picture', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPicture ${getAttrMarkup(attrs)}>`
    };
});

export default () => {};
