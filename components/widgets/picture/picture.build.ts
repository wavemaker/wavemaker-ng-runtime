import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'img';

register('wm-picture', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmPicture ${getAttrMarkup(attrs)}>`;
        }
    };
});

export default () => {};
