import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-calendar', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            let viewType = attrs.get('view') ? attrs.get('view') + ' view' : 'month view';
            return `<${tagName} wmCalendar redrawable style="width:100%" aria-label="${viewType}" ${getAttrMarkup(attrs)}>`
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
