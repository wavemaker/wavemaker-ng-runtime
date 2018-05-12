import { AfterViewInit, Attribute, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { NgModel } from '@angular/forms';

import { isDefined, toggleClass } from '@wm/core';

import { styler } from '../../framework/styler';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './checkbox.props';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';

const DEFAULT_CLS = 'app-checkbox checkbox';
const WIDGET_CONFIG = {widgetType: 'wm-checkbox', hostClass: DEFAULT_CLS};

registerProps();

/*
 * try to convert the chekedvalue and unchecked values to boolean/number
 */
const unStringify = val => {
    if (val === 'true') {
        return true;
    }
    if (val === 'false') {
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

    private proxyModel: boolean;
    private _caption = '&nbsp';
    private readonly _checkedvalue;
    private readonly _uncheckedvalue;

    @ViewChild(NgModel) ngModel: NgModel;

    // if the checkbox is checked, return checkedvalue else return uncheckedvalue
    public get datavalue() {
        return this.proxyModel ? this._checkedvalue : this._uncheckedvalue;
    }
    // when the datavalue is set, update the checked state
    public set datavalue(v) {
        this.proxyModel = v === this._checkedvalue;
        this.updatePrevDatavalue(this.datavalue);
    }

    constructor(
        inj: Injector,
        @Attribute('checkedvalue') checkedVal,
        @Attribute('uncheckedvalue') uncheckedVal,
        @Attribute('type') type
    ) {
        super(inj, WIDGET_CONFIG);

        this._checkedvalue = unStringify(checkedVal);
        this._uncheckedvalue = unStringify(uncheckedVal);

        // if the type of the checkbox is toggle update the related classes on the host node
        toggleClass(this.nativeElement, 'app-toggle', type === 'toggle');
    }

    onPropertyChange(key, nv, ov) {
        if  (key === 'caption') {
            if (!isDefined(nv) || nv === '') {
                this._caption = '&nbsp;';
            } else {
                this._caption = nv;
            }
        }
    }

    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        if (eventName !== 'change') {
            super.handleEvent(node, eventName, callback, locals);
        }
    }

    handleChange(newVal: boolean) {
        if (this.ngModel.valid) {
            this.invokeOnChange(this.datavalue, {type: 'change'});
        }
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.nativeElement.querySelector('label'), this);
    }
}
