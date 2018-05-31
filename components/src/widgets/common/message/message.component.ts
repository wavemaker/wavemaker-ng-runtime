import { Component, Injector } from '@angular/core';

import { switchClass } from '@wm/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './message.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

const DEFAULT_CLS = 'alert app-message';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-message', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmMessage]',
    templateUrl: './message.component.html',
    providers: [
        provideAsWidgetRef(MessageComponent)
    ]
})
export class MessageComponent extends StylableComponent {

    messageClass = '';
    messageIconClass = '';
    type: string = '';
    caption: string;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    public show(caption: string, type: string) {
        this.caption = caption;
        this.setWidgetProperty('type', type);
        this.setWidgetProperty('show', true);
    }

    public hide() {
        this.setWidgetProperty('show', false);
    }

    private dismiss($event) {
        this.hide();
        this.invokeEventCallback('close', {$event});
    }

    private onMessageTypeChange(nv: string) {
        let msgCls, msgIconCls;
        switch (nv) {
            case 'success':
                msgCls = 'alert-success';
                msgIconCls = 'fa fa-check';
                break;
            case 'error':
                msgCls = 'alert-danger';
                msgIconCls = 'fa fa-times-circle';
                break;
            case 'warn':  /*To support old projects with type as "warn"*/
            case 'warning':
                msgCls = 'alert-warning';
                msgIconCls = 'fa fa-exclamation-triangle';
                break;
            case 'info':
                msgCls = 'alert-info';
                msgIconCls = 'fa fa-info';
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
        }
    }
}
