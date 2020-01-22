import {async, ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import {App, AppDefaults, DynamicComponentRefProvider} from '@wm/core';
import {FormComponent} from './form.component';
import {InputModule} from '@wm/components/input';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Component, ViewChild} from '@angular/core';
import { By } from '@angular/platform-browser';
import {TextMaskModule} from 'angular2-text-mask';
import {FormActionDirective} from './form-action/form-action.directive';
import {FormFieldDirective} from './form-field/form-field.directive';
import {compileTestComponent, setInputValue } from '../../../../base/src/test/util/component-test-util';
import {ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import {WmComponentsModule} from '@wm/components/base';
import {LayoutGridModule} from '@wm/components/containers/layout-grid';
import {BasicModule} from '@wm/components/basic';

const mockApp = {};

const markup = `<form wmForm name="testform"
                     captionposition=top
                     title="Form Title"
                     tabindex="0"
                     beforesubmit.event="onBeforeSubmit($event, widget, $data)"
                     result.event="onResult($event, widget, $data)"
                     success.event="onSuccess($event, widget, $data)"
                     error.event="onError($event, widget, $data)"
                     submit.event="onSubmit($event, widget, $formData)"
                     formdata="En">

                <div wmLayoutGrid  columns="1" name="layoutgrid">
                    <div wmLayoutGridRow  name="gridrow7">

                        <div wmLayoutGridColumn  columnwidth="12" name="gridcolumn17">
                            <div data-role="form-field" name="testformfield" wmFormField>
                                <div class="live-field form-group app-composite-widget" widget="text">
                                    <label wmLabel name="Form Label Name" class="p media-heading" caption.bind="item.name" fontsize="1.143" fontunit="em">First Name</label>
                                    <wm-input formcontrolname="firstname" #formWidget name="input_form" type="text" aria-describedby="Enter text"></wm-input>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <div wmFormAction name="reset"  key="reset" class="form-reset btn-secondary" iconclass="wi wi-refresh" display-name="Reset" type="reset" style="height: 20px; width: 70px;"></div>
            <div wmFormAction name="save"  key="save" class="form-save btn-success" iconclass="wi wi-save" display-name="Save" type="submit" style="height: 20px; width: 70px;"></div>

    </form>
    `;

@Component({
    template: markup
})

class FormWrapperComponent {
    @ViewChild(FormComponent)
    wmComponent: FormComponent;
    public testdata: any = [{name: 'Ram', age: 24}, {name: 'Sita', age: 22}];

    onBeforeSubmit($event, widget, $data) {
        console.log('calling on before submit');
    }

    onResult($event, widget, $data) {
        console.log('calling on result');
    }
    onSuccess($event, widget, $data) {
        console.log('calling on success');
    }

    onSubmit($event, widget, $formData) {
        console.log('calling on submit');
    }

    onError($event, widget, $data) {
        console.log('calling on error');
    }
}

const testModuleDef: ITestModuleDef = {
    imports: [
        InputModule,
        FormsModule,
        ReactiveFormsModule,
        TextMaskModule,
        WmComponentsModule.forRoot(),
        LayoutGridModule,
        BasicModule
    ],
    declarations: [FormWrapperComponent, FormComponent, FormActionDirective, FormFieldDirective],
    providers: [
        {provide: App, useValue: mockApp},
        { provide: AppDefaults, useClass: AppDefaults },
        { provide: FormBuilder, useClass: FormBuilder },
        { provide: DynamicComponentRefProvider, useValue: mockApp }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-form',
    widgetSelector: '[wmForm]',
    inputElementSelector: 'input.app-textbox',
    testModuleDef: testModuleDef,
    testComponent: FormWrapperComponent
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();


describe('FormComponent', () => {
    let wrapperComponent: FormWrapperComponent;
    let wmComponent: FormComponent;
    let fixture: ComponentFixture<FormWrapperComponent>;
    let btnElm;

    const getSaveButtonEl = () => {
        return fixture.nativeElement.querySelector('button[name="save"]');
    };

    const getInputEl = () => {
        return fixture.nativeElement.querySelector('.app-textbox');
    };

    beforeEach(async(() => {
        fixture = compileTestComponent(testModuleDef, FormWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        wmComponent = wrapperComponent.wmComponent;
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        fixture.detectChanges();

        btnElm = getSaveButtonEl();
        btnElm.widget.show = true;
        btnElm.widget.caption = 'Save';
        btnElm.widget.type = 'submit';
    }));

    it('should create Form Component', () => {
        console.log('creating Form Component');
        fixture.detectChanges();
        expect(wrapperComponent).toBeTruthy();
    });


    it('check for dirty property before and after form submit and should trigger onSuccess event', (async(done) => {
        const testValue = 'abc';
        const inputEl = fixture.nativeElement.querySelector('wm-input');
        setInputValue(fixture, '.app-textbox', testValue).then(() => {
            expect(inputEl.querySelector('input').value).toEqual(testValue);

            const formField = wmComponent.getWidget().formFields[0];
            formField._control.markAsDirty();
            fixture.detectChanges();
            expect(wmComponent.dirty).toBe(true);
            console.log('before form submit, dirty - ', wmComponent.dirty);

            spyOn(wrapperComponent, 'onResult').and.callThrough();
            spyOn(wrapperComponent, 'onSuccess').and.callThrough();

            fixture.whenStable().then(() => {
                wmComponent.submitForm({});
                fixture.detectChanges();

                setTimeout(() => {
                    expect(wrapperComponent.onResult).toHaveBeenCalledTimes(1);
                    expect(wmComponent.dirty).toBe(false);
                    console.log('after form submit, dirty - ', wmComponent.dirty);
                    expect(wrapperComponent.onSuccess).toHaveBeenCalledTimes(1);
                    done();
                });
            });
        });
    }));
});
