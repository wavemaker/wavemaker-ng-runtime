import { Directive, Optional, OnInit, Attribute, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormRef } from '../../framework/types';

@Directive({
    selector: '[wmFormWidget]'
})
export class FormWidgetDirective implements OnInit {

    ngForm: FormGroup;
    fb;

    constructor(
        @Optional() @Inject(FormRef) public form,
        fb: FormBuilder,
        @Attribute('name') public name,
        @Attribute('key') public key,
        @Attribute('updateon') public updateon) {
        this.fb = fb;
    }

    get _control() {
        return this.ngForm && this.ngForm.controls[this.key || this.name];
    }

    createControl() {
        let updateOn = this.updateon || 'blur';
        updateOn = updateOn === 'default' ? 'change' : updateOn;
        return this.fb.control('', {
            updateOn: updateOn
        });
    }

    ngOnInit() {
        this.ngForm = this.form.ngForm;
        this.ngForm.addControl(this.key || this.name , this.createControl());
    }
}

