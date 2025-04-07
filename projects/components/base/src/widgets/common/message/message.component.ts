import { Component, Inject, Injector, Optional } from '@angular/core';

import { switchClass } from '@wm/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './message.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

const DEFAULT_CLS = 'alert app-message';
const WIDGET_CONFIG: IWidgetConfig = { widgetType: 'wm-message', hostClass: DEFAULT_CLS };

@Component({
    standalone: true,
    selector: '[wmMessage]',
    templateUrl: './message.component.html',
    providers: [
        provideAsWidgetRef(MessageComponent)
    ],
    exportAs: 'wmMessage'
})
export class MessageComponent extends StylableComponent {
    static initializeProps = registerProps();
    messageClass = '';
    messageIconClass = '';
    type = '';
    caption: string;
    public hideclose: any;

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        styler(this.nativeElement, this);
    }

    public showMessage(caption?: string, type?: string) {
        if (caption) {
            this.caption = caption;
        }
        if (type) {
            this.setWidgetProperty('type', type);
        }
        this.setWidgetProperty('show', true);
    }

    public hideMessage() {
        this.setWidgetProperty('show', false);
    }

    public dismiss($event) {
        this.hideMessage();
        this.invokeEventCallback('close', { $event });
    }

    private onMessageTypeChange(nv: string) {
        let msgCls, msgIconCls;
        switch (nv) {
            case 'success':
                msgCls = 'alert-success';
                msgIconCls = 'wm-sl-l sl-check';
                break;
            case 'error':
                msgCls = 'alert-danger';
                msgIconCls = 'wi wi-cancel';
                break;
            case 'warn':  /*To support old projects with type as "warn"*/
            case 'warning':
                msgCls = 'alert-warning';
                msgIconCls = 'wm-sl-l sl-alarm-bell';
                break;
            case 'info':
                msgCls = 'alert-info';
                msgIconCls = 'wi wi-info';
                break;
            case 'loading':
                msgCls = 'alert-info alert-loading';
                msgIconCls = 'fa fa-spinner fa-spin';
                break;
        }
        switchClass(this.nativeElement, msgCls, this.messageClass);
        this.messageClass = msgCls;
        this.messageIconClass = msgIconCls;
    }

    onPropertyChange(key, nv, ov?) {
        if (key === 'type') {
            this.onMessageTypeChange(nv);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
