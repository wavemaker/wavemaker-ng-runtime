import { AfterViewInit, ElementRef } from '@angular/core';
import { NgModel } from '@angular/forms';

import { addClass, switchClass } from '@wm/core';

import { BaseFormCustomComponent } from '../../base/base-form-custom.component';
import { styler } from '../../../framework/styler';

export abstract class BaseInput extends BaseFormCustomComponent implements AfterViewInit {
    public class: string;

    // possible values for ngModelOptions are 'blur' and 'change'
    // default is 'blur'
    protected ngModelOptions = {
        updateOn: 'blur'
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

        if (key === 'class') {
            if (this.inputEl.nativeElement) {
                switchClass(this.inputEl.nativeElement, nv, ov);
            }
        } else if (key === 'datavalue') {
            // update the oldDataValue when the datavalue is modified programmatically
            this.updatePrevDatavalue(nv);
        } else if (key === 'updateon') {
            if (nv === 'default') {
                nv = 'change';
            }
            this.ngModelOptions.updateOn = nv;
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    // invoke the change callback
    protected handleChange(newValue: any) {
        this.invokeOnChange(this.datavalue, {type: 'change'}, this.ngModel.valid);
    }

    // Change event is registered from the template, Prevent the framework from registering one more event
    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any) {
        if (eventName !== 'change' && eventName !== 'blur') {
            super.handleEvent(this.inputEl.nativeElement, eventName, eventCallback, locals);
        }
    }

    // invoke the blur callback
    protected handleBlur($event) {
        this.invokeOnTouched($event);
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();

        // add the class on the input element
        if (this.class) {
            addClass(this.inputEl.nativeElement, this.class);
        }
        styler(this.inputEl.nativeElement, this);
    }
}