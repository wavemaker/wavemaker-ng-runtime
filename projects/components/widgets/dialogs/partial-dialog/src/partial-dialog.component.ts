import { Attribute, Component, ContentChild, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { App, toBoolean } from '@wm/core';
import { provideAsDialogRef, provideAsWidgetRef } from '@wm/components/base';
import { BaseDialog } from '@wm/components/dialogs';

import { registerProps } from './partial-dialog.props';

const DIALOG_CLS = 'app-dialog modal-dialog app-page-dialog';
const WIDGET_INFO = {widgetType: 'wm-partialdialog'};

@Component({
    selector: 'div[wmPartialDialog]',
    templateUrl: './partial-dialog.component.html',
    providers: [
        provideAsWidgetRef(PartialDialogComponent),
        provideAsDialogRef(PartialDialogComponent)
    ]
})
export class PartialDialogComponent extends BaseDialog implements OnInit {
    static initializeProps = registerProps();
    @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;
    @ContentChild(TemplateRef) dialogContent: TemplateRef<any>;
    @ContentChild('partial') partialRef;

    protected app;
    protected Widgets;
    protected Variables;
    protected Actions;

    constructor(
        inj: Injector,
        app: App,
        @Attribute('class') dialogClass: string,
        @Attribute('modal') modal: string | boolean,
        @Attribute('closable') closable: string | boolean
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
            }
        );
        this.app = app;
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

    private setPartialLoadListener() {
        const cancelSubscription = this.app.subscribe('partialLoaded', () => {
            const parEle = this.partialRef.nativeElement;
            let partialScope;
            if (parEle) {
                partialScope  = parEle.widget;
                this.Widgets   = partialScope.Widgets;
                this.Variables = partialScope.Variables;
                this.Actions   = partialScope.Actions;
            }
            cancelSubscription();
        });
    }

    public open(initState?: any) {
        super.open(initState);
        // WMS-19410 - Set the partial load listener to access widgets, variables and actions of page dialog
        this.setPartialLoadListener();
    }
}
