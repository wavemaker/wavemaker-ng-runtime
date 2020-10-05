import { AfterViewInit, ElementRef, Injector } from '@angular/core';
import { NgModel } from '@angular/forms';

import { $appDigest, addClass, switchClass } from '@wm/core';
import { IWidgetConfig, styler } from '@wm/components/base';
import { BaseFormCustomComponent } from '../../base-form-custom.component';
declare const _;

export abstract class BaseInput extends BaseFormCustomComponent implements AfterViewInit {
    public class: string;
    public autotrim: boolean;

    // possible values for ngModelOptions are 'blur' and 'change'
    // default is 'blur'
    public ngModelOptions = {
        updateOn: ''
    };

    /**
     * Reference to the input element. All the styles and classes will be applied on this node.
     * Input components must override this
     */
    protected abstract inputEl: ElementRef;

    /**
     * Reference to the ngModel directive instance.
     * Used to check the validity of the input
     */
    protected abstract ngModel: NgModel;

    protected onPropertyChange(key: string, nv: any, ov: any) {
        // set the class on the input element
        if (key === 'tabindex') {
            return;
        }
        if (key === 'required') {
            /* WMS-18269 | Update Angular about the required attr value change */
            this._onChange(this.datavalue);
        }

        if (key === 'class') {
            if (this.inputEl.nativeElement) {
                switchClass(this.inputEl.nativeElement, nv, ov);
            }
        } else if (key === 'datavalue') {
            // update the oldDataValue when the datavalue is modified programmatically
            this.updatePrevDatavalue(nv);
            this._onChange(this.datavalue);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    // invoke the change callback
    handleChange(newValue: any) {
        if (this.autotrim && this.datavalue && _.isString(this.datavalue)) {
            this.datavalue = this.datavalue.trim();
        }
        this.invokeOnChange(this.datavalue, {type: 'change'}, this.ngModel.valid);
    }

    // Change event is registered from the template, Prevent the framework from registering one more event
    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any) {
        if (eventName !== 'change' && eventName !== 'blur') {
            super.handleEvent(this.inputEl.nativeElement, eventName, eventCallback, locals);
        }
    }

    // invoke the blur callback
    handleBlur($event) {
        this.invokeOnTouched($event);
    }

    // Update the model on enter key press
    flushViewChanges(val) {
        this.ngModel.update.next(val);
        $appDigest();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();

        // add the class on the input element
        if (this.class) {
            addClass(this.inputEl.nativeElement, this.class);
        }
        styler(this.nativeElement, this);
    }

    constructor(
        inj: Injector,
        config: IWidgetConfig
    ) {
        super(inj, config);
        let updateOn = this.nativeElement.getAttribute('updateon') || 'blur';
        updateOn = updateOn === 'default' ? 'change' : updateOn;
        this.ngModelOptions.updateOn = updateOn;
    }
}
