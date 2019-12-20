import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-calendar', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmCalendar redrawable style="width:100%" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@angular/forms',
            name: 'FormsModule',
            as: 'ngFormsModule'
        },{
            from: 'ngx-bootstrap/datepicker',
            name: 'DatepickerModule',
            as: 'ngx_DatepickerModule',
            forRoot: true
        },{
            from: '@wm/components/input/calendar',
            name: 'CalendarModule'
        }]
    };
});

export default () => {};
