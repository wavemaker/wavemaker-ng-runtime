import {Directive, Inject, Injector, Optional} from '@angular/core';

import { BaseComponent, IWidgetConfig, provideAsWidgetRef } from '@wm/components/base';
import { registerProps } from './dialog-footer.props';

const WIDGET_INFO: IWidgetConfig = {
    widgetType: 'wm-dialogfooter',
    hostClass: 'app-dialog-footer modal-footer'
};

@Directive({
  standalone: true,
    selector: 'div[wmDialogFooter]',
    providers: [
        provideAsWidgetRef(DialogFooterDirective)
    ]
})
export class DialogFooterDirective extends BaseComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_INFO, explicitContext);
    }
}
