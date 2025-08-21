import { CommonModule } from '@angular/common';
import { WmComponentsModule } from "@wm/components/base";
import { FormsModule } from '@angular/forms';
import {
    AfterViewInit,
    Attribute,
    Component,
    ElementRef,
    HostListener,
    Inject,
    Injector,
    OnInit,
    Optional,
    ViewChild
} from '@angular/core';
import {NG_VALIDATORS, NG_VALUE_ACCESSOR, NgModel} from '@angular/forms';

import {isDefined, toggleClass} from '@wm/core';
import {IWidgetConfig, provideAs, provideAsWidgetRef, styler} from '@wm/components/base';
import {BaseFormCustomComponent} from '../base-form-custom.component';

import {registerProps} from './checkbox.props';

const DEFAULT_CLS = 'app-checkbox checkbox';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-checkbox',
    hostClass: DEFAULT_CLS
};

/*
 * try to convert the chekedvalue and unchecked values to boolean/number
 */
export const unStringify = (val, defaultVal?) => {
    if (val === null) {
        return defaultVal;
    }

    if (val === true || val === 'true') {
        return true;
    }

    if (val === false || val === 'false') {
        return false;
    }

    const number = parseInt(val, 10);
    if (!isNaN(number)) {
        return number;
    }
    return val;
};

@Component({
  standalone: true,
  imports: [CommonModule, WmComponentsModule, FormsModule],
    selector: '[wmCheckbox]',
    templateUrl: './checkbox.component.html',
    providers: [
        provideAs(CheckboxComponent, NG_VALUE_ACCESSOR, true),
        provideAs(CheckboxComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(CheckboxComponent)
    ]
})
export class CheckboxComponent extends BaseFormCustomComponent implements OnInit, AfterViewInit {
    static initializeProps = registerProps();

    public proxyModel: boolean;
    public disabled: boolean;
    public readonly: boolean;
    public required: boolean;
    public name: string;
    public hint: string;
    public arialabel: string;
    public shortcutkey: string;
    public tabindex: any;
    public _caption = '&nbsp';
    private _checkedvalue;
    private _uncheckedvalue;

    @ViewChild(NgModel) ngModel: NgModel;
    @ViewChild('checkbox', { static: true, read: ElementRef }) checkboxEl: ElementRef;

    // if the checkbox is checked, return checkedvalue else return uncheckedvalue
    // @ts-ignore
    public get datavalue() {
        return isDefined(this.proxyModel) ? (this.proxyModel ? this._checkedvalue : this._uncheckedvalue) : undefined;
    }
    // when the datavalue is set, update the checked state
    // @ts-ignore
    public set datavalue(v) {
        this.proxyModel = (isDefined(v) && v !== '') ? v === this._checkedvalue : undefined;
        this.updatePrevDatavalue(this.datavalue);
    }

    constructor(
        inj: Injector,
        @Attribute('checkedvalue') checkedVal,
        @Attribute('uncheckedvalue') uncheckedVal,
        @Attribute('type') public type,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any
    ) {
        super(inj, WIDGET_CONFIG, explicitContext);

        this._checkedvalue = unStringify(checkedVal, true);
        this._uncheckedvalue = unStringify(uncheckedVal, false);

        // if the type of the checkbox is toggle update the related classes on the host node
        toggleClass(this.nativeElement, 'app-toggle', type === 'toggle');
    }

    onPropertyChange(key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        if (key === 'required') {
            this._onChange(this.datavalue);
            return;
        }

        if (key === 'caption') {
            if (!isDefined(nv) || nv === '') {
                this._caption = '&nbsp;';
            } else {
                this._caption = nv;
            }
        } else if (key === 'checkedvalue') {
            this._checkedvalue = unStringify(nv, true);
        } else if (key === 'uncheckedvalue') {
            this._uncheckedvalue = unStringify(nv, false);
        } else if (key === 'datavalue') {
            this.datavalue = unStringify(nv);
            this._onChange(this.datavalue);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    // change and blur events are handled from template
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        if (eventName !== 'change' && eventName !== 'blur') {
            // applying tap (Hammer event) on the label as the event handler is not getting triggered on the input.
            const $el = eventName === 'tap' ? this.nativeElement.querySelector('label') : this.checkboxEl.nativeElement;
            super.handleEvent($el, eventName, callback, locals);
        }
    }

    handleChange(newVal: boolean) {
        this.invokeOnChange(this.datavalue, {type: 'change'}, this.ngModel.valid);
    }

    @HostListener('keydown.enter', ['$event', '"ENTER"'])
    onKeyDown($event) {
        $event.preventDefault();
        this.checkboxEl.nativeElement.click();
    }


    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.nativeElement.querySelector('label'), this);
    }
}
