import { Directive, forwardRef, HostBinding, HostListener, Injector } from '@angular/core';

import { styler } from '../base/framework/styler';
import { IStylableComponent } from '../base/framework/types';
import { BaseComponent } from '../base/base.component';
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

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this as IStylableComponent);
    }
}
