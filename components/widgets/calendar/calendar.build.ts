import { BuildTaskDef, getAttrMarkup, register } from '@transpiler/build';

const tagName = 'div';

register('wm-calendar', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCalendar style="width:100%" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};