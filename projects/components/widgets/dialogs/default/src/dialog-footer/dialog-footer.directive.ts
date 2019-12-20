import { Directive, Injector } from '@angular/core';

import { BaseComponent, IWidgetConfig, provideAsWidgetRef } from '@wm/components/base';
import { registerProps } from './dialog-footer.props';

const WIDGET_INFO: IWidgetConfig = {
    widgetType: 'wm-dialogfooter',
    hostClass: 'app-dialog-footer modal-footer'
};

@Directive({
    selector: 'div[wmDialogFooter]',
    providers: [
        provideAsWidgetRef(DialogFooterDirective)
    ]
})
export class DialogFooterDirective extends BaseComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector) {
        super(inj, WIDGET_INFO);
    }
}
