import { AfterViewInit, Attribute, Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { isDefined, toggleClass } from '@wm/core';

import { IWidgetConfig } from '../../framework/types';
import { styler } from '../../framework/styler';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './checkbox.props';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';

const DEFAULT_CLS = 'app-checkbox checkbox';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-checkbox',
    hostClass: DEFAULT_CLS
};

registerProps();

/*
 * try to convert the chekedvalue and unchecked values to boolean/number
 */
const unStringify = (val, defaultVal?) => {
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
    selector: '[wmCheckbox]',
    templateUrl: './checkbox.component.html',
    providers: [
        provideAsNgValueAccessor(CheckboxComponent),
        provideAsWidgetRef(CheckboxComponent)
    ]
})
export class CheckboxComponent extends BaseFormCustomComponent implements OnInit, AfterViewInit {

    public proxyModel: boolean;
    public disabled: boolean;
    public readonly: boolean;
    public required: boolean;
    public name: string;
    public shortcutkey: string;
    public tabindex: any;
    public _caption = '&nbsp';
    private _checkedvalue;
    private _uncheckedvalue;

    @ViewChild(NgModel) ngModel: NgModel;
    @ViewChild('checkbox', {read: ElementRef}) checkboxEl: ElementRef;

    // if the checkbox is checked, return checkedvalue else return uncheckedvalue
    public get datavalue() {
        return isDefined(this.proxyModel) ? (this.proxyModel ? this._checkedvalue : this._uncheckedvalue) : undefined;
    }
    // when the datavalue is set, update the checked state
    public set datavalue(v) {
        this.proxyModel = (isDefined(v) && v !== '') ? v === this._checkedvalue : undefined;
        this.updatePrevDatavalue(this.datavalue);
    }

    constructor(
        inj: Injector,
        @Attribute('checkedvalue') checkedVal,
        @Attribute('uncheckedvalue') uncheckedVal,
        @Attribute('type') type
    ) {
        super(inj, WIDGET_CONFIG);

        this._checkedvalue = unStringify(checkedVal, true);
        this._uncheckedvalue = unStringify(uncheckedVal, false);

        // if the type of the checkbox is toggle update the related classes on the host node
        toggleClass(this.nativeElement, 'app-toggle', type === 'toggle');
    }

    onPropertyChange(key, nv, ov) {
        if (key === 'tabindex') {
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
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    // change and blur events are handled from template
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        if (eventName !== 'change' && eventName !== 'blur') {
            super.handleEvent(this.checkboxEl.nativeElement, eventName, callback, locals);
        }
    }

    handleChange(newVal: boolean) {
        this.invokeOnChange(this.datavalue, {type: 'change'}, this.ngModel.valid);
    }


    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.nativeElement.querySelector('label'), this);
    }
}
