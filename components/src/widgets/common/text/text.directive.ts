import { Directive, forwardRef, HostBinding, Injector } from '@angular/core';

import { addClass } from '@wm/core';

import { styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './text.props';
import { Event } from '../../../utils/decorators';

registerProps();

const DEFAULT_CLS = 'app-textbox form-control';
const WIDGET_CONFIG = {widgetType: 'wm-text', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmText]',
    exportAs: 'wmText',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => TextDirective)}
    ]
})
export class TextDirective extends StylableComponent {

    _oldVal;
    datavalue;

    @HostBinding('attr.tabindex') tabindex: number;
    @HostBinding('attr.accesskey') shortcutkey: string;
    @HostBinding('attr.type') type: string;
    @HostBinding('attr.maxlength') maxchars: string;
    @HostBinding('attr.min') minvalue: number;
    @HostBinding('attr.max') maxvalue: number;
    @HostBinding('attr.placeholder') placeholder: string;
    @HostBinding('attr.pattern') regexp: string;
    @HostBinding('attr.step') step: number;
    @HostBinding() disabled: boolean;
    @HostBinding() required: boolean;
    @HostBinding() readonly: boolean;
    @HostBinding() autofocus: boolean;
    @HostBinding() autocomplete: boolean;

    onChange(fn, locals) {
        locals.newVal = this.datavalue;
        locals.oldVal = this._oldVal;

        this._oldVal = this.datavalue;
    }

    handleEvent(eventName: string, fn: Function, locals: any) {
        if (eventName === 'change') {
            super.handleEvent(eventName, () => {
                this.onChange(fn, locals);
            }, locals);
        } else {
            super.handleEvent(eventName, fn, locals);
        }
    }

    shouldRegisterHostEvent(eventName: string) {
        if (eventName === 'change') {
            return true;
        }

        return super.shouldRegisterHostEvent(eventName);
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        addClass(this.nativeElement, DEFAULT_CLS);
        styler(this.nativeElement, this);
    }
}

