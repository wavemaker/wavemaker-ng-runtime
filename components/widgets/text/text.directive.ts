import { ElementRef, Injector, Directive, HostBinding, HostListener, ChangeDetectorRef } from '@angular/core';
import { addClass } from '@utils/dom';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { registerProps } from './text.props';

registerProps();

const DEFAULT_CLS = 'app-textbox form-control';
const WIDGET_CONFIG = {widgetType: 'wm-text', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmText]'
})
export class TextDirective extends BaseComponent {

    @HostBinding('attr.tabindex') tabindex: number;
    @HostBinding('attr.accesskey') shortcutkey: string;
    @HostBinding('attr.type') type: string;
    @HostBinding('attr.maxlength') maxchars: string;
    @HostBinding('attr.min') minvalue: number;
    @HostBinding('attr.max') maxvalue: number;
    @HostBinding('attr.placeholder') placeholder: string;
    @HostBinding('attr.pattern') regexp: string;
    @HostBinding('attr.step') step: number;
    @HostBinding('value') datavalue: any;
    @HostBinding() disabled: boolean;
    @HostBinding() required: boolean;
    @HostBinding() readonly: boolean;
    @HostBinding() autofocus: boolean;
    @HostBinding() autocomplete: boolean;

    @HostListener('ngModelChange', ['$event'])
    onChange(event: Event) {
        this.datavalue = event;
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        addClass(this.$element, DEFAULT_CLS);
        styler(this.$element, this);
    }
}

