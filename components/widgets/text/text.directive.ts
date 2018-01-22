import { ElementRef, Injector, Directive, HostBinding, HostListener } from '@angular/core';
import { addClass, setAttr, removeAttr, setProperty } from '@utils/dom';
import { BaseComponent } from '../base/base.component';
import { initWidget } from '../../utils/init-widget';
import { styler } from '@utils/styler';
import { registerProps } from './text.props';

registerProps();

const WIDGET_TYPE = 'wm-text';
const DEFAULT_CLS = 'app-textbox form-control';

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

    @HostListener('ngModelChange', ['$event'])
    onChange(event: Event) {
        this.datavalue = event;
    }

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'autocomplete':
                nv ? removeAttr(this.$element, 'autocomplete') : setAttr(this.$element, 'autocomplete', 'off');
                break;
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
