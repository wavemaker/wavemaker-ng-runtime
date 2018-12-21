import { Attribute, Directive, Inject, OnInit, Self, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { FormComponent } from './form.component';
import { WidgetRef } from '../../framework/types';
import { TableComponent } from '../table/table.component';

@Directive({
    selector: '[wmFormWidget]'
})
export class FormWidgetDirective implements OnInit {

    ngform: FormGroup;
    fb;
    parent;

    constructor(
        @Optional() @Inject(FormComponent) form,
        @Optional() @Inject(TableComponent) table,
        @Self() @Inject(WidgetRef) public componentInstance,
        fb: FormBuilder,
        @Attribute('name') public name,
        @Attribute('key') public key) {
        this.fb = fb;
        this.parent = form || table;
        this.ngform = this.parent.ngform;

        this.componentInstance.registerPropertyChangeListener((k, nv) => {
            if (k === 'datavalue' && this._control) {
                this._control.setValue(nv);
            } else if (k === 'name' && !this._control) {
                this.addControl(this.key || nv);
            }
        });
    }

    get _control() {
        const fieldName = this.key || this.name;
        if (!fieldName) {
            return undefined;
        }
        return this.ngform && this.ngform.controls[fieldName];
    }

    addControl(fieldName) {
        this.ngform.addControl(fieldName, this.createControl());
    }

    createControl() {
        return this.fb.control(this.componentInstance.datavalue);
    }

    ngOnInit() {
        const fieldName = this.key || this.name;

        if (fieldName && !this._control) {
            this.addControl(fieldName);
            this.parent.registerFormWidget(this.componentInstance);
        }
    }
}
