import {Attribute, Component, Inject, Injector, OnInit, Optional, TemplateRef, ViewChild} from '@angular/core';

import {toBoolean} from '@wm/core';
import {provideAsDialogRef, provideAsWidgetRef} from '@wm/components/base';
import {BaseDialog, DialogBodyDirective, DialogFooterDirective, DialogHeaderComponent} from '@wm/components/dialogs';

import {registerProps} from './iframe-dialog.props';
import {IframeComponent} from '@wm/components/basic/iframe';
import {ButtonComponent} from '@wm/components/input/button';

const DIALOG_CLS = 'app-dialog modal-dialog app-iframe-dialog';
const WIDGET_INFO = {widgetType: 'wm-iframedialog'};

@Component({
    standalone: true,
    imports: [IframeComponent, DialogBodyDirective, DialogFooterDirective, DialogHeaderComponent, ButtonComponent],
    selector: 'div[wmIframeDialog]',
    templateUrl: './iframe-dialog.component.html',
    providers: [
        provideAsWidgetRef(IframeDialogComponent),
        provideAsDialogRef(IframeDialogComponent)
    ]
})
export class IframeDialogComponent extends BaseDialog implements OnInit {
    static initializeProps = registerProps();

    @ViewChild('dialogTemplate' , { static: true }) dialogTemplate: TemplateRef<any>;

    constructor(
        inj: Injector,
        @Attribute('class') dialogClass: string,
        @Attribute('modal') modal: string | boolean,
        @Attribute('closable') closable: string | boolean,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any
    ) {
        if (modal === null || modal === undefined) {
            modal = false;
        }

        if (closable === null || closable === undefined) {
            closable = true;
        }

        // setting the backdrop to 'static' will not close the dialog on backdrop click
        const backdrop: boolean | 'static' = toBoolean(modal) ? 'static' : true;

        super(
            inj,
            WIDGET_INFO,
            {
                class: `${DIALOG_CLS} ${dialogClass || ''}`,
                backdrop,
                keyboard: !toBoolean(modal)
            },
            explicitContext
        );
    }

    protected getTemplateRef(): TemplateRef<any> {
        return this.dialogTemplate;
    }

    /**
     * Click event handler for the ok button
     * invokes on-ok event callback
     * @param {Event} $event
     */
    onOk($event: Event) {
        this.invokeEventCallback('ok', {$event});
    }

    ngOnInit() {
        super.ngOnInit();
        this.register(this.viewParent);
    }
}
