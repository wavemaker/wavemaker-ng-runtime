import { WmComponentsModule } from "@wm/components/base";
import {
    Attribute,
    Component,
    Injector,
    OnInit,
    TemplateRef,
    ViewChild,
    HostListener,
    Optional,
    SkipSelf,
    Inject
} from '@angular/core';

import {toBoolean} from '@wm/core';
import { provideAsDialogRef, provideAsWidgetRef } from '@wm/components/base';
import { BaseDialog, DialogBodyDirective, DialogFooterDirective, DialogHeaderComponent } from '@wm/components/dialogs';

import { registerProps } from './confirm-dialog.props';
import { ButtonComponent } from "@wm/components/input";

const DIALOG_CLS = 'app-dialog modal-dialog app-confirm-dialog';
const WIDGET_INFO = {widgetType: 'wm-confirmdialog'};

@Component({
  standalone: true,
  imports: [WmComponentsModule, DialogBodyDirective, DialogFooterDirective, DialogHeaderComponent, ButtonComponent],
    selector: 'div[wmConfirmDialog]',
    templateUrl: './confirm-dialog.component.html',
    providers: [
        provideAsWidgetRef(ConfirmDialogComponent),
        provideAsDialogRef(ConfirmDialogComponent)
    ]
})
export class ConfirmDialogComponent extends BaseDialog implements OnInit {
    static initializeProps = registerProps();
    @ViewChild('dialogTemplate', { static: true }) dialogTemplate: TemplateRef<any>;

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
        const backdrop = 'static';

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

    @HostListener('window:keydown.esc', ['$event'])
    onEscape($event: KeyboardEvent){};

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

    /**
     * Click event handler for the cancel button
     * invokes on-cancel event callback
     * @param {Event} $event
     */
    onCancel($event: Event) {
        this.invokeEventCallback('cancel', {$event});
    }

    ngOnInit() {
        super.ngOnInit();
        this.register(this.viewParent);
    }
}
