import { Directive, forwardRef, HostBinding, HostListener, Injector } from '@angular/core';

import { styler } from '../../framework/styler';
import { registerProps } from './textarea.props';
import { StylableComponent } from '../base/stylable.component';

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
export class TextareaDirective extends StylableComponent {

    @HostBinding('attr.tabindex') tabindex: number;
    @HostBinding('attr.accesskey') shortcutkey: string;
    @HostBinding('attr.maxlength') maxchars: string;
    @HostBinding('attr.placeholder') placeholder: string;
    @HostBinding('value') datavalue: any;
    @HostBinding() disabled: boolean;
    @HostBinding() required: boolean;
    @HostBinding() readonly: boolean;
    @HostBinding() autofocus: boolean;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
    }
}
