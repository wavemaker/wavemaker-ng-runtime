import { Component, Injector, ElementRef, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { DomSanitizer } from '@angular/platform-browser';
import { registerProps } from './message.props';

const WIDGET_CONFIG = {widgetType: 'wm-message', hasTemplate: true};

registerProps();

@Component({
    selector: 'wm-message',
    templateUrl: './message.component.html'
})
export class MessageComponent extends BaseComponent {

    messageClass = '';
    messageContent;
    messageIconClass = '';
    show: boolean = true;
    type: string = '';

    @Output() close = new EventEmitter();

    dismiss($event) {
        this.show = false;
        this.close.emit({$event, $isolateScope:this, newVal: this.show});
    }

    onMessageTypeChange(newVal) {
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
        this.$digest();
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, private sanitize: DomSanitizer) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
    }

    _ngOnInit() {
        styler(this.$element, this);
    }
}
