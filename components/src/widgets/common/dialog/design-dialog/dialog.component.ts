import { Attribute, Component, ContentChild, Inject, Injector, OnInit, Self, TemplateRef, ViewChild } from '@angular/core';

import { toBoolean } from '@wm/core';

import { Context } from '../../../framework/types';
import { registerProps } from './dialog.props';
import { BaseDialog } from '../base/base-dialog';
import { provideAsDialogRef, provideAsWidgetRef } from '../../../../utils/widget-utils';

const DIALOG_CLS = 'app-dialog modal-dialog';

const WIDGET_INFO = {widgetType: 'wm-dialog'};

registerProps();

@Component({
    selector: 'div[wmDialog]',
    templateUrl: './dialog.component.html',
    providers: [
        provideAsWidgetRef(DialogComponent),
        provideAsDialogRef(DialogComponent),
        {provide: Context, useValue: {}, multi: true}
    ]
})
export class DialogComponent extends BaseDialog implements OnInit {

    @ViewChild('dialogTemplate', {read: TemplateRef}) dialogTemplate: TemplateRef<any>;
    @ContentChild('dialogBody', {read: TemplateRef}) dialogBody: TemplateRef<any>;
    @ContentChild('dialogFooter', {read: TemplateRef}) dialogFooter: TemplateRef<any>;

    constructor(
        inj: Injector,
        @Attribute('class') dialogClass: string,
        @Attribute('modal') modal: string | boolean,
        @Attribute('closable') closable: string | boolean,
        @Self() @Inject(Context) contexts: Array<any>
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
                keyboard: toBoolean(closable)
            }
        );
    }

    protected getTemplateRef(): TemplateRef<any> {
        return this.dialogTemplate;
    }

    protected processAttr(attrName: string, attrValue: string) {
        // ignore the class attribute.
        // Prevent the framework from setting the class on the host element.
        if (attrName === 'class') {
            return;
        }
        super.processAttr(attrName, attrValue);
    }

    ngOnInit() {
        super.ngOnInit();
        this.register();
    }
}
