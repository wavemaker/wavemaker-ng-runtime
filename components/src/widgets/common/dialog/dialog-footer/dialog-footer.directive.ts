import { Directive, forwardRef, Injector } from '@angular/core';

import { IWidgetConfig, WidgetRef } from '../../../framework/types';
import { BaseComponent } from '../../base/base.component';
import { registerProps } from './dialog-footer.props';

const WIDGET_INFO: IWidgetConfig = {
    widgetType: 'wm-dialogfooter',
    hostClass: 'app-dialog-footer modal-footer'
};

registerProps();

@Directive({
    selector: 'div[wmDialogFooter]',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => DialogFooterDirective)}
    ]
})
export class DialogFooterDirective extends BaseComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_INFO);
    }

    // todo:vinay migration task to handle closeDialog
}
