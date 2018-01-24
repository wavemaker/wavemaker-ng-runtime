import { ElementRef, Injector, Directive, HostBinding, HostListener, ChangeDetectorRef } from '@angular/core';
import { addClass } from '@utils/dom';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { registerProps } from './textarea.props';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-textarea', hasTemplate: false};
const DEFAULT_CLS = 'form-control app-textarea';

@Directive({
    selector: '[wmTextarea]'
})
export class TextareaDirective extends BaseComponent {

    @HostBinding('attr.tabindex') tabindex: number;
    @HostBinding('attr.accesskey') shortcutkey: string;
    @HostBinding('attr.maxlength') maxchars: string;
    @HostBinding('attr.placeholder') placeholder: string;
    @HostBinding('value') datavalue: any;
    @HostBinding() disabled: boolean;
    @HostBinding() required: boolean;
    @HostBinding() readonly: boolean;
    @HostBinding() autofocus: boolean;

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
