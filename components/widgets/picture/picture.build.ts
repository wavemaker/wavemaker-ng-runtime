import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'img';

register('wm-picture', (): BuildTaskDef => {
    return {
        pre: attrs => {
            return `<${tagName} wmPicture ${getAttrMarkup(attrs)}>`;
        }
    };
});

export default () => {};
