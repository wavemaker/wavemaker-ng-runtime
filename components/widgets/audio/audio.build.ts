import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-audio', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmAudio ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};