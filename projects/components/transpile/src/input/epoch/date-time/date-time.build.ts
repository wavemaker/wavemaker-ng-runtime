import { getFormMarkupAttr, IBuildTaskDef, register } from '@wm/transpiler';
import { getNgModelAttr } from '@wm/core';

const tagName = 'div';

register('wm-datetime', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmDateTime ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
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
            from: 'ngx-bootstrap/dropdown',
            name: 'BsDropdownModule',
            as: 'ngx_BsDropdownModule',
            forRoot: true
        },{
            from: 'ngx-bootstrap/timepicker',
            name: 'TimepickerModule',
            as: 'ngx_TimepickerModule',
            forRoot: true
        },{
            from: '@wm/components/input/epoch',
            name: 'EpochModule'
        },{
            from: '@wm/mobile/components/input/epoch',
            name: 'EpochModule',
            as: 'WM_MobileEpochModule',
            platformType: 'MOBILE'
        }]
    };
});

export default () => {};
