import { Directive, forwardRef, HostBinding, HostListener, Injector } from '@angular/core';

import { addClass } from '@wm/utils';

import { BaseComponent } from '../base/base.component';
import { styler } from '../base/framework/styler';
import { IStylableComponent } from '../base/framework/types';
import { registerProps } from './text.props';
import { Event } from '../../utils/decorators';

registerProps();

const DEFAULT_CLS = 'app-textbox form-control';
const WIDGET_CONFIG = {widgetType: 'wm-text', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmText]',
    exportAs: 'wmText',
    providers: [{
        provide: '@Widget', useExisting: forwardRef(() => TextDirective)
    }]
})
export class TextDirective extends BaseComponent {

    _oldVal;

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

    private _datavalue;
    @HostBinding('value')
    get datavalue() {
        return this._datavalue || '';
    }
    set datavalue(val) {
        this._datavalue = val;
    }

    @HostListener('ngModelChange', ['$event'])
    onNgModelChange(event: Event) {
        this.datavalue = event;
    }

    @Event('change')
    onChange(fn, locals) {
        locals.newVal = this.datavalue;
        locals.oldVal = this._oldVal;
        fn(locals);
        this._oldVal = this.datavalue;
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
        styler(this.nativeElement, this as IStylableComponent);
    }
}

