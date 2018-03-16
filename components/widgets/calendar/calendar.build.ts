import { getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-calendar', () => {
    return {
        pre: attrs => {
            return `<${tagName} wmCalendar style="width:100%" ${getAttrMarkup(attrs)}>`;
        },
        post: () => {
            return `</${tagName}>`;
        }
    };
});

export default () => {};