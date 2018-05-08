import { Attribute, Component, forwardRef, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { toBoolean } from '@wm/core';

import { DialogRef, WidgetRef } from '../../../framework/types';
import { registerProps } from './iframe-dialog.props';
import { BaseDialog } from '../base/base-dialog';

const DIALOG_CLS = 'app-dialog modal-dialog app-iframe-dialog';
const WIDGET_INFO = {widgetType: 'wm-iframedialog'};

registerProps();

@Component({
    selector: 'div[wmIframeDialog]',
    templateUrl: './iframe-dialog.component.html',
    providers: [
        {provide: DialogRef, useExisting: forwardRef(() => IframeDialogComponent)},
        {provide: WidgetRef, useExisting: forwardRef(() => IframeDialogComponent)}
    ]
})
export class IframeDialogComponent extends BaseDialog implements OnInit {

    @ViewChild('dialogTemplate') dialogTemplate: TemplateRef<any>;

    constructor(
        inj: Injector,
        @Attribute('class') dialogClass: string,
        @Attribute('modal') modal: string | boolean,
        @Attribute('closable') closable: string | boolean,
    ) {
        if (modal === null || modal === undefined) {
            modal = false;
        }

        if (closable === null || closable === undefined) {
            closable = true;
        }
        super(
            inj,
            WIDGET_INFO,
            {
                class: `${DIALOG_CLS} ${dialogClass || ''}`,
                backdrop: toBoolean(modal) || 'static',
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

    /**
     * Click event handler for the ok button
     * invokes on-ok event callback
     * @param {Event} $event
     */
    onOk($event: Event) {
        this.invokeEventCallback('ok', {$event});
        this.close();
    }

    ngOnInit() {
        super.ngOnInit();
        this.register();
    }
}
