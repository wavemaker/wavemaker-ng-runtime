import { getFormMarkupAttr, IBuildTaskDef, register } from '@wm/transpiler';
import { getNgModelAttr } from '@wm/core';

const tagName = 'div';

register('wm-date', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmDate ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: 'ngx-bootstrap/datepicker',
            name: 'BsDatepickerModule',
            as: 'ngx_BsDatepickerModule'
        },{
            from: 'ngx-bootstrap/dropdown',
            name: 'BsDropdownModule',
            as: 'ngx_BsDropdownModule'
        },{
            from: 'ngx-bootstrap/timepicker',
            name: 'TimepickerModule',
            as: 'ngx_TimepickerModule'
        },{
            from: '@wm/components/input/epoch',
            name: 'EpochModule'
        }]
    };
});

export default () => {};
