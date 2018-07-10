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
        this.componentInstance.registerPropertyChangeListener((k, nv) => {
            if (k === 'datavalue' && this._control) {
                this._control.setValue(nv);
            }
        });
    }

    get _control() {
        return this.ngform && this.ngform.controls[this.key || this.name];
    }

    createControl() {
        return this.fb.control(undefined);
    }

    ngOnInit() {
        this.ngform = this.parent.ngform;

        if (!this._control) {
            this.ngform.addControl(this.key || this.name, this.createControl());

            this.parent.registerFormWidget(this.componentInstance);
        }
    }
}

