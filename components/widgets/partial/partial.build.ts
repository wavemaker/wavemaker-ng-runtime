import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'section';

register('wm-partial', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmPartial data-role="partial" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};
