import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import {App, AppDefaults, setPipeProvider} from '@wm/core';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginationModule, TypeaheadModule } from 'ngx-bootstrap';
import { By } from '@angular/platform-browser';
import { FormFieldDirective } from './form-field/form-field.directive';
import { LiveFormDirective } from './live-form/live-form.directive';

let
mockApp = {
    subscribe: () => {}
};

@Component({
    template: `
        <div wmForm>
        </div>
    `
})
class FormFieldWrapperDirective {
    @ViewChild(FormFieldDirective)
    formFieldDirective: FormFieldDirective;
}

fdescribe('FormFieldDirective', () => {
    let wrapperComponent: FormFieldWrapperDirective;
    let formFieldDirective: FormFieldDirective;
    let fixture: ComponentFixture<FormFieldWrapperDirective>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                PaginationModule.forRoot()
            ],
            declarations: [FormFieldWrapperDirective, FormFieldDirective],
            providers: [
                {provide: App, useValue: mockApp},

            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(FormFieldWrapperDirective);
        wrapperComponent = fixture.componentInstance;
        formFieldDirective = wrapperComponent.formFieldDirective;

        fixture.detectChanges();
    }));


    it('FormFieldDirective displayValue property', () => {
        console.log(formFieldDirective);
        console.log("Type :  ",typeof formFieldDirective);
        //expect(Object.keys(formFieldDirective)).toContain('displayValue');
    });

});
