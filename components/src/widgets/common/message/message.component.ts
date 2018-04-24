import { Component, forwardRef, Injector } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { $appDigest, addClass, removeClass } from '@wm/core';

import { styler } from '../../framework/styler';
import { registerProps } from './message.props';
import { invokeEventHandler } from '../../../utils/widget-utils';
import { StylableComponent } from '../base/stylable.component';
import { WidgetRef } from '../../framework/types';

const DEFAULT_CLS = 'alert app-message';
const WIDGET_CONFIG = {widgetType: 'wm-message', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmMessage]',
    templateUrl: './message.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => MessageComponent)}
    ]
})
export class MessageComponent extends StylableComponent {

    messageClass = '';
    messageContent;
    messageIconClass = '';
    show: boolean = true;
    type: string = '';

    dismiss($event) {
        this.show = false;
        invokeEventHandler(this, 'close', {$event, newVal: this.show});
    }

    onMessageTypeChange(newVal) {
        removeClass(this.nativeElement, this.messageClass);
        switch (newVal) {
            case 'success':
                this.messageClass = 'alert-success';
                this.messageIconClass = 'fa fa-check';
                break;
            case 'error':
                this.messageClass = 'alert-danger';
                this.messageIconClass = 'fa fa-times-circle';
                break;
            case 'warn':  /*To support old projects with type as "warn"*/
            case 'warning':
                this.messageClass = 'alert-warning';
                this.messageIconClass = 'fa fa-exclamation-triangle';
                break;
            case 'info':
                this.messageClass = 'alert-info';
                this.messageIconClass = 'fa fa-info';
                break;
            case 'loading':
                this.messageClass = 'alert-info alert-loading';
                this.messageIconClass = 'fa fa-spinner fa-spin';
                break;
        }
        addClass(this.nativeElement, this.messageClass);
        this.type = newVal;
    }

    onPropertyChange(key, newVal, oldVal?) {
        switch (key) {
            case 'caption':
                this.messageContent =  this.sanitize.bypassSecurityTrustHtml(newVal);
                break;
            case 'type':
                this.onMessageTypeChange(newVal);
                break;
            case 'dataset':
                if (!Array.isArray(newVal) && typeof newVal === 'object') {
                    this.messageContent =  this.sanitize.bypassSecurityTrustHtml(newVal.caption);
                    this.onMessageTypeChange(newVal.type);
                    this.show = newVal.show || true;
                } else {
                    this.show = false;
                }
                break;
        }
    }

    toggle(showHide: string, caption: string, type: string) {
        if (typeof showHide === 'undefined') {
            this.show =  !this.show;
        } else {
            this.show = showHide === 'show' ?  true : false;
            this.messageContent = this.sanitize.bypassSecurityTrustHtml(caption) || this.messageContent;
            this.type = type || this.type;
        }
        $appDigest();
    }

    constructor(inj: Injector, private sanitize: DomSanitizer) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }
}
