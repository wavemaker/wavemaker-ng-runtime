import { Attribute, Directive, Inject, OnInit, Self } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormComponent } from './form.component';
import { WidgetRef } from '../../framework/types';

@Directive({
    selector: '[wmFormWidget]'
})
export class FormWidgetDirective implements OnInit {

    ngform: FormGroup;
    fb;

    constructor(
        @Inject(FormComponent) public form,
        @Self() @Inject(WidgetRef) public componentInstance,
        fb: FormBuilder,
        @Attribute('name') public name,
        @Attribute('key') public key,
        @Attribute('updateon') public updateon) {
        this.fb = fb;
    }

    get _control() {
        return this.ngform && this.ngform.controls[this.key || this.name];
    }

    createControl() {
        let updateOn = this.updateon || 'blur';
        updateOn = updateOn === 'default' ? 'change' : updateOn;
        return this.fb.control('', {
            updateOn: updateOn
        });
    }

    ngOnInit() {
        this.ngform = this.form.ngform;
        this.ngform.addControl(this.key || this.name , this.createControl());

        this.form.registerFormWidget(this.componentInstance);
    }
}

