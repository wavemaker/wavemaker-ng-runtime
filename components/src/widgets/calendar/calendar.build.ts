import { BuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-calendar', (): BuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCalendar redrawable style="width:100%" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};