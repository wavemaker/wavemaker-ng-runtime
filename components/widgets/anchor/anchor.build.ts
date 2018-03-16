import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'a';

register('wm-anchor', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmAnchor role="button" data-identifier="anchor" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};