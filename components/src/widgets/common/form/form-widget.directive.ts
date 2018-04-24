import { Directive, Optional, OnInit, Attribute, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormRef } from '../../framework/types';

@Directive({
    selector: '[wmFormWidget]'
})
export class FormWidgetDirective implements OnInit {

    ngForm: FormGroup;

    constructor(
        @Optional() @Inject(FormRef) public form,
        public fb: FormBuilder,
        @Attribute('name') public name,
        @Attribute('key') public key) {
    }

    get _control() {
        return this.ngForm && this.ngForm.controls[this.key || this.name];
    }

    createControl() {
        return this.fb.control('');
    }

    ngOnInit() {
        this.ngForm = this.form.ngForm;
        this.ngForm.addControl(this.key || this.name , this.createControl());
    }
}

