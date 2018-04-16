import { ChangeDetectorRef, Directive, ElementRef, forwardRef, HostBinding, HostListener, Injector } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { registerProps } from './textarea.props';

registerProps();

const DEFAULT_CLS = 'form-control app-textarea';
const WIDGET_CONFIG = {widgetType: 'wm-textarea', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmTextarea]',
    exportAs: 'wmTextarea',
    providers: [{
        provide: '@Widget', useExisting: forwardRef(() => TextareaDirective)
    }]
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

        styler(this.$element, this);
    }
}
