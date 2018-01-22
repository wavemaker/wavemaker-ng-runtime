import { ElementRef, Injector, Directive, HostBinding, HostListener } from '@angular/core';
import { addClass, setAttr, removeAttr } from '@utils/dom';
import { BaseComponent } from '../base/base.component';
import { initWidget } from '../../utils/init-widget';
import { styler } from '@utils/styler';
import { registerProps } from './textarea.props';

registerProps();

const WIDGET_TYPE = 'wm-textarea';
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

    @HostListener('ngModelChange', ['$event'])
    onChange(event: Event) {
        this.datavalue = event;
    }

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'disabled':
            case 'required':
            case 'readonly':
            case 'autofocus':
                nv ? setAttr(this.$element, key, nv) : removeAttr(this.$element, key);
                break;
        }
    }

    constructor(inj: Injector, elRef: ElementRef) {
        super();

        this.$host = elRef.nativeElement;
        this.$element = this.$host;

        addClass(this.$element, DEFAULT_CLS);

        initWidget(this, WIDGET_TYPE, (<any>inj).elDef, (<any>inj).view);
        styler(this.$element, this);
    }
}
