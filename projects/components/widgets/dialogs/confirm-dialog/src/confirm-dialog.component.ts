import {
    Attribute,
    Component,
    Injector,
    OnInit,
    TemplateRef,
    ViewChild,
    HostListener,
    Optional,
    SkipSelf
} from '@angular/core';

import {toBoolean, UserDefinedExecutionContext} from '@wm/core';
import { provideAsDialogRef, provideAsWidgetRef } from '@wm/components/base';
import { BaseDialog } from '@wm/components/dialogs';

import { registerProps } from './confirm-dialog.props';

const DIALOG_CLS = 'app-dialog modal-dialog app-confirm-dialog';
const WIDGET_INFO = {widgetType: 'wm-confirmdialog'};

@Component({
    selector: 'div[wmConfirmDialog]',
    templateUrl: './confirm-dialog.component.html',
    providers: [
        provideAsWidgetRef(ConfirmDialogComponent),
        provideAsDialogRef(ConfirmDialogComponent),
        {
            provide: UserDefinedExecutionContext,
            useExisting: ConfirmDialogComponent
        }
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
        @SkipSelf() @Optional() public _viewParent: UserDefinedExecutionContext
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
            _viewParent,
            {
                class: `${DIALOG_CLS} ${dialogClass || ''}`,
                backdrop,
                keyboard: !toBoolean(modal)
            }
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
