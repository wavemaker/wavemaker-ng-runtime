import { ChangeDetectorRef, Component, ElementRef, Injector, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './checkbox.props';
import { styler } from '../../utils/styler';
import { toggleClass } from '@wm/utils';
import { invokeEventHandler, getControlValueAccessor } from '../../utils/widget-utils';

const DEFAULT_CLS = 'app-checkbox checkbox';
const WIDGET_CONFIG = {widgetType: 'wm-checkbox', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmCheckbox]',
    templateUrl: './checkbox.component.html',
    providers: [getControlValueAccessor(CheckboxComponent)]
})
export class CheckboxComponent  extends BaseComponent implements OnInit {

    model: boolean;
    /**
     * This property defines the value of the widget when the element is in the checked state. Default value is boolean value true. If specified, the value will be of string type
     */
    checkedvalue: string;
    /**
     * This property defines the value of the widget when the element is in the unchecked state.
     */
    uncheckedvalue: string;

    get datavalue(){
        return this.getComputedDataValue(this.model);
    }

    getComputedDataValue(modelValue) {
        if (this.checkedvalue && modelValue) {
            return this.checkedvalue;
        } else if (this.uncheckedvalue && !modelValue) {
            return this.uncheckedvalue;
        }
        return modelValue;
    }

    set datavalue(value: boolean | string) {
        if ((this.checkedvalue  && this.checkedvalue === value) || value === true) {
            this.model = true;
        } else {
            this.model = false;
        }
        this._onChange(this.datavalue);
    }

    onPropertyChange(key, nv, ov) {
        if (key === 'type') {
            toggleClass(this.$element, 'app-toggle', nv === 'toggle');
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
    }

    ngOnInit() {
        super.ngOnInit();
        styler(this.$element.querySelector('label'), this);
    }

    onChange($event) {
        this._onTouched();
        this._onChange(this.datavalue);
        $event.stopPropagation();
        invokeEventHandler(this, 'change', {$event: $event, newVal: this.datavalue, oldVal: this.getComputedDataValue(!this.model)});
    }
}
