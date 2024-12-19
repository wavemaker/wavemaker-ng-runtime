import {
    Attribute,
    Component,
    ContentChild,
    Inject,
    Injector,
    OnInit,
    Optional,
    Self, SkipSelf,
    TemplateRef,
    ViewChild
} from '@angular/core';

import {toBoolean} from '@wm/core';
import { Context, provideAsDialogRef, provideAsWidgetRef } from '@wm/components/base';
import { BaseDialog } from '@wm/components/dialogs';

import { registerProps } from './dialog.props';

const DIALOG_CLS = 'app-dialog modal-dialog';

const WIDGET_INFO = {widgetType: 'wm-dialog'};

@Component({
    selector: 'div[wmDialog]',
    standalone: false,
    templateUrl: './dialog.component.html',
    providers: [
        provideAsWidgetRef(DialogComponent),
        provideAsDialogRef(DialogComponent),
        {provide: Context, useFactory: () => { return {} }, multi: true}
    ]
})
export class DialogComponent extends BaseDialog implements OnInit {
    static initializeProps = registerProps();
    isDialogComponent: boolean = true;

    @ViewChild('dialogTemplate', { static: true, read: TemplateRef }) dialogTemplate: TemplateRef<any>;
    @ContentChild('dialogBody', /* TODO: add static flag */ { read: TemplateRef }) dialogBody: TemplateRef<any>;
    @ContentChild('dialogFooter', /* TODO: add static flag */ { read: TemplateRef }) dialogFooter: TemplateRef<any>;

    constructor(
        inj: Injector,
        @Attribute('class') dialogClass: string,
        @Attribute('modal') modal: string | boolean,
        @Attribute('closable') closable: string | boolean,
        @Self() @Inject(Context) contexts: Array<any>,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any
    ) {
        if (modal === null || modal === undefined) {
            modal = true;
        }

        if (closable === null || closable === undefined) {
            closable = true;
        }

        // contexts[0] will refer to the self context provided by this component
        contexts[0].closeDialog = () => this.close();

        // setting the backdrop to 'static' will not close the dialog on backdrop click
        const backdrop: boolean | 'static' = toBoolean(modal) ? 'static' : true;

        super(
            inj,
            WIDGET_INFO,
            {
                class: `${DIALOG_CLS} ${dialogClass || ''}`,
                backdrop,
                keyboard: toBoolean(closable) ? true : !toBoolean(modal)

            },
            explicitContext
        );
    }

    protected getTemplateRef(): TemplateRef<any> {
        return this.dialogTemplate;
    }

    ngOnInit() {
        super.ngOnInit();
        this.register(this.viewParent);
    }
}
