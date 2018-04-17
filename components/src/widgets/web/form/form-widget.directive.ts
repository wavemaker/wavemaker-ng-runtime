import { Directive, Optional, OnInit, Attribute } from '@angular/core';
import { ParentForm } from './form.component';
import { FormBuilder, FormGroup } from '@angular/forms';

@Directive({
    selector: '[wmFormWidget]'
})
export class FormWidgetDirective implements OnInit {

    ngForm: FormGroup;

    constructor(@Optional() public form: ParentForm, public fb: FormBuilder,
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

