import { getFormMarkupAttr, IBuildTaskDef, register } from '@wm/transpiler';
import { getNgModelAttr } from '@wm/core';

const tagName = 'div';

register('wm-datetime', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmDateTime ${getFormMarkupAttr(attrs)} ${getNgModelAttr(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: 'ngx-bootstrap/datepicker',
            name: 'DatepickerModule'
        },{
            from: 'ngx-bootstrap/timepicker',
            name: 'TimepickerModule'
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
