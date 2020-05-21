import { async, ComponentFixture, fakeAsync, TestBed, tick, discardPeriodicTasks } from '@angular/core/testing';
import { App, AppDefaults, DynamicComponentRefProvider, AbstractI18nService, UserDefinedExecutionContext } from '@wm/core';
import { FormComponent } from './form.component';
import { FormWidgetDirective } from './form-widget.directive';
import { InputModule } from '@wm/components/input';
import { FormBuilder, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Component, ViewChild } from '@angular/core';
import { IMaskModule } from 'angular-imask';
import { FormActionDirective } from './form-action/form-action.directive';
import { FormFieldDirective } from './form-field/form-field.directive';
import { compileTestComponent, setInputValue, onClickCheckTaglengthOnBody, checkCustomElementClass } from '../../../../base/src/test/util/component-test-util';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import { WmComponentsModule } from '@wm/components/base';
import { LayoutGridModule } from '@wm/components/containers/layout-grid';
import { BasicModule } from '@wm/components/basic';
import { VALIDATOR } from '@wm/core';
import { DatePipe, CommonModule, DecimalPipe } from '@angular/common';
import { BsDatepickerModule, TimepickerModule, BsDropdownModule } from 'ngx-bootstrap';
import { DateComponent, TimeComponent } from '@wm/components/input/epoch';
import { ToDatePipe } from '../../../../base/src/pipes/custom-pipes';
import { triggerTimerClickonArrowsByIndex, getTimePickerElement } from 'projects/components/base/src/test/util/date-test-util';
import { fullNameValidator, registerFullNameValidator, nameComparisionValidator } from 'projects/components/base/src/test/util/validations-test-util';

const mockApp = {
    getSelectedLocale: () => {
        return 'en';
    }
};

const markup = `<form wmForm role="" #form_1 ngNativeValidate
                    errormessage captionposition="top"
                    tabindex="0" title="Form" name="createUserForm1"
                    beforesubmit.event="onBeforeSubmit($event, widget, $data)"
                    result.event="onResult($event, widget, $data)"
                    success.event="onSuccess($event, widget, $data)"
                    error.event="onError($event, widget, $data)"
                    submit.event="onSubmit($event, widget, $formData)">

                    <div wmLayoutGrid columns="1" name="layoutgrid1">
                        <div wmLayoutGridRow name="gridrow2">
                            <div wmComposite role="group" name="composite1">
                                <label wmLabel class="h4 control-label" caption="User Details" name="label1"></label>
                            </div>
                            <div wmLayoutGridColumn name="gridcolumn1" columnwidth="12">
                                <div data-role="form-field" [formGroup]="form_1.ngform" wmFormField #formfield_1="wmFormField"
                                    widgettype="text" name="username" key="username" displayname="Username" show="true" type="string"
                                    __widgetType="text" placeholder="Enter value">
                                    <div class="live-field form-group app-composite-widget clearfix caption-{{form_1.captionposition}}"
                                        widget="text">
                                        <label [hidden]="!formfield_1.displayname"
                                            class="app-label control-label formfield-label {{form_1._captionClass}}"
                                            [title]="formfield_1.displayname" [ngStyle]="{width: form_1.captionsize}" [ngClass]="{'text-danger': formfield_1._control?.invalid && formfield_1._control?.touched && form_1.isUpdateMode,
                                                        required: form_1.isUpdateMode && formfield_1.required}"
                                            [textContent]="formfield_1.displayname"> </label>
                                        <div [ngClass]="formfield_1.displayname ? form_1._widgetClass : 'col-sm-12'">
                                            <label class="form-control-static app-label"
                                                [hidden]="form_1.isUpdateMode || formfield_1.viewmodewidget === 'default' || formfield_1.widgettype === 'upload'"
                                                [innerHTML]="formfield_1.getCaption()"></label>
                                            <wm-input [class.hidden]="!form_1.isUpdateMode && formfield_1.viewmodewidget !== 'default'"
                                                formControlName="username" focus.event="_onFocusField($event);"
                                                blur.event="_onBlurField($event);" #formWidget name="username_formWidget" type="text"
                                                aria-describedby="Enter text">
                                            </wm-input>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div wmLayoutGridRow name="gridrow1">
                            <div wmLayoutGridColumn name="gridcolumn2" columnwidth="12">
                                <div data-role="form-field" [formGroup]="form_1.ngform" wmFormField #formfield_2="wmFormField"
                                    widgettype="number" name="age" key="age" displayname="Age" show="true" type="number"
                                    __widgetType="number" placeholder="Enter value">
                                    <div class="live-field form-group app-composite-widget clearfix caption-{{form_1.captionposition}}"
                                        widget="number">
                                        <label [hidden]="!formfield_2.displayname"
                                            class="app-label control-label formfield-label {{form_1._captionClass}}"
                                            [title]="formfield_2.displayname" [ngStyle]="{width: form_1.captionsize}" [ngClass]="{'text-danger': formfield_2._control?.invalid && formfield_2._control?.touched && form_1.isUpdateMode,
                                                        required: form_1.isUpdateMode && formfield_2.required}"
                                            [textContent]="formfield_2.displayname"> </label>
                                        <div [ngClass]="formfield_2.displayname ? form_1._widgetClass : 'col-sm-12'">
                                            <label class="form-control-static app-label"
                                                [hidden]="form_1.isUpdateMode || formfield_2.viewmodewidget === 'default' || formfield_2.widgettype === 'upload'"
                                                [innerHTML]="formfield_2.getCaption()"></label>
                                            <div wmNumber
                                                [class.hidden]="!form_1.isUpdateMode && formfield_2.viewmodewidget !== 'default'"
                                                formControlName="age" focus.event="_onFocusField($event);"
                                                blur.event="_onBlurField($event);" #formWidget name="age_formWidget" type="number"
                                                aria-label="Only numbers"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div wmLayoutGridRow name="gridrow2">
                            <div wmLayoutGridColumn name="gridcolumn3" columnwidth="12">
                                <div data-role="form-field" [formGroup]="form_1.ngform" wmFormField #formfield_3="wmFormField"
                                    widgettype="text" name="lastname" key="lastname" displayname="Lastname" show="true" type="string"
                                    __widgetType="text" placeholder="Enter value">
                                    <div class="live-field form-group app-composite-widget clearfix caption-{{form_1.captionposition}}"
                                        widget="text">
                                        <label [hidden]="!formfield_3.displayname"
                                            class="app-label control-label formfield-label {{form_1._captionClass}}"
                                            [title]="formfield_3.displayname" [ngStyle]="{width: form_1.captionsize}" [ngClass]="{'text-danger': formfield_3._control?.invalid && formfield_3._control?.touched && form_1.isUpdateMode,
                                                        required: form_1.isUpdateMode && formfield_3.required}"
                                            [textContent]="formfield_3.displayname"> </label>
                                        <div [ngClass]="formfield_3.displayname ? form_1._widgetClass : 'col-sm-12'">
                                            <label class="form-control-static app-label"
                                                [hidden]="form_1.isUpdateMode || formfield_3.viewmodewidget === 'default' || formfield_3.widgettype === 'upload'"
                                                [innerHTML]="formfield_3.getCaption()"></label>
                                            <wm-input [class.hidden]="!form_1.isUpdateMode && formfield_3.viewmodewidget !== 'default'"
                                                formControlName="lastname" focus.event="_onFocusField($event);"
                                                blur.event="_onBlurField($event);" #formWidget name="lastname_formWidget" type="text"
                                                aria-describedby="Enter text">
                                            </wm-input>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div wmLayoutGridRow name="gridrow3">
                            <div wmLayoutGridColumn name="gridcolumn4" columnwidth="12">
                                <div data-role="form-field" [formGroup]="form_1.ngform" wmFormField #formfield_4="wmFormField"
                                    widgettype="date" name="dateofbirth" key="dateofbirth" displayname="Dateofbirth" show="true"
                                    type="date" __widgetType="date" placeholder="Select date">
                                    <div class="live-field form-group app-composite-widget clearfix caption-{{form_1.captionposition}}"
                                        widget="date">
                                        <label [hidden]="!formfield_4.displayname"
                                            class="app-label control-label formfield-label {{form_1._captionClass}}"
                                            [title]="formfield_4.displayname" [ngStyle]="{width: form_1.captionsize}" [ngClass]="{'text-danger': formfield_4._control?.invalid && formfield_4._control?.touched && form_1.isUpdateMode,
                                                        required: form_1.isUpdateMode && formfield_4.required}"
                                            [textContent]="formfield_4.displayname"> </label>
                                        <div [ngClass]="formfield_4.displayname ? form_1._widgetClass : 'col-sm-12'">
                                            <label class="form-control-static app-label"
                                                [hidden]="form_1.isUpdateMode || formfield_4.viewmodewidget === 'default' || formfield_4.widgettype === 'upload'"
                                                [innerHTML]="formfield_4.value | toDate:formfield_4.formWidget.datepattern ||  'yyyy-MMM-dd'"></label>
                                            <div wmDate dataentrymode="undefined"
                                                [class.hidden]="!form_1.isUpdateMode && formfield_4.viewmodewidget !== 'default'"
                                                formControlName="dateofbirth" focus.event="_onFocusField($event);"
                                                blur.event="_onBlurField($event);" #formWidget name="dateofbirth_formWidget"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div wmLayoutGridRow name="gridrow4">
                            <div wmLayoutGridColumn name="gridcolumn5" columnwidth="12">
                                <div data-role="form-field" [formGroup]="form_1.ngform" wmFormField #formfield_5="wmFormField"
                                    widgettype="time" name="timeofbirth" key="timeofbirth" displayname="Timeofbirth" show="true"
                                    type="time" __widgetType="time" placeholder="Select time">
                                    <div class="live-field form-group app-composite-widget clearfix caption-{{form_1.captionposition}}"
                                        widget="time">
                                        <label [hidden]="!formfield_5.displayname"
                                            class="app-label control-label formfield-label {{form_1._captionClass}}"
                                            [title]="formfield_5.displayname" [ngStyle]="{width: form_1.captionsize}" [ngClass]="{'text-danger': formfield_5._control?.invalid && formfield_5._control?.touched && form_1.isUpdateMode,
                                                        required: form_1.isUpdateMode && formfield_5.required}"
                                            [textContent]="formfield_5.displayname"> </label>
                                        <div [ngClass]="formfield_5.displayname ? form_1._widgetClass : 'col-sm-12'">
                                            <label class="form-control-static app-label"
                                                [hidden]="form_1.isUpdateMode || formfield_5.viewmodewidget === 'default' || formfield_5.widgettype === 'upload'"
                                                [innerHTML]="formfield_5.value | toDate:formfield_5.formWidget.timepattern || 'hh:mm a'"></label>
                                            <div wmTime dataentrymode="undefined"
                                                [class.hidden]="!form_1.isUpdateMode && formfield_5.viewmodewidget !== 'default'"
                                                formControlName="timeofbirth" focus.event="_onFocusField($event);"
                                                blur.event="_onBlurField($event);" #formWidget name="timeofbirth_formWidget"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div wmFormAction name="reset" key="reset" display-name="Reset" show="true" class="form-reset btn-secondary"
                        iconclass="wi wi-refresh" title="Reset" disabled="false" widget-type="button" type="reset" update-mode="true">
                    </div>
                    <div wmFormAction name="save" key="save" display-name="Save" show="true" class="form-save btn-success"
                        iconclass="wi wi-save" title="Save" disabled="false" widget-type="button" type="submit" update-mode="true">
                    </div>
                </form>`;

@Component({
    template: markup
})

class FormWrapperComponent {
    @ViewChild(FormComponent)
    wmComponent: FormComponent;
    public testdata: any = [{ name: 'Ram', age: 24, dob: '2019-12-02' }, { name: 'Sita', age: 22, dob: '2019-12-02' }];

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
        BrowserAnimationsModule,
        InputModule,
        FormsModule,
        ReactiveFormsModule,
        IMaskModule,
        WmComponentsModule.forRoot(),
        LayoutGridModule,
        BasicModule,
        CommonModule,
        BsDatepickerModule.forRoot(),
        TimepickerModule.forRoot(),
        BsDropdownModule.forRoot()
    ],
    declarations: [
        FormWrapperComponent,
        FormComponent,
        FormActionDirective,
        FormFieldDirective,
        FormWidgetDirective,
        DateComponent,
        TimeComponent
    ],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: AppDefaults, useClass: AppDefaults },
        { provide: FormBuilder, useClass: FormBuilder },
        { provide: DynamicComponentRefProvider, useValue: mockApp },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AbstractI18nService, useValue: mockApp },
        { provide: DecimalPipe, useClass: DecimalPipe },
        { provide: UserDefinedExecutionContext, useValue: UserDefinedExecutionContext }
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

const defaultValidators = (
    validatorType,
    errorType, 
    validator, 
    errorMsg,
    formField,
    invalidTestValue, 
    validTestValue
) => {
    expect(formField._control.valid).toBeTruthy();
    formField.setValidators([{
        type: validatorType,
        validator: validator,
        errorMessage: errorMsg
    }]);
    // Positive case
    formField.datavalue = invalidTestValue;
    expect(formField._control.valid).toBeFalsy();
    expect(formField._control.errors[errorType]).toBeTruthy();
    // Negetive case
    formField.datavalue = validTestValue;
    expect(formField._control.valid).toBeTruthy();
}

const dateValidations = (
    validatorType, 
    validator, 
    errorMsg, 
    wmComponent, 
    invalidTestValue, 
    validTestValue
) => {
    let formField = wmComponent.formfields['dateofbirth'];
    let dateWidget = formField.getWidget().formWidget;
    expect(formField._control.valid).toBeTruthy();
    formField.setValidators([{
        type: validatorType,
        validator: validator,
        errorMessage: errorMsg
    }]);
    // Positive case
    dateWidget.datavalue = invalidTestValue;
    expect(formField._control.valid).toBeFalsy();
    // Negetive case
    dateWidget.datavalue = validTestValue;
    expect(formField._control.valid).toBeTruthy();
}

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

    it('should be able to set form as dirty', () => {
        expect(wmComponent.dirty).toBeFalsy();
        wmComponent.markAsDirty();
        expect(wmComponent.dirty).toBeTruthy();
    });

    it('should be able to set form as pristine', () => {
        wmComponent.markAsDirty();
        expect(wmComponent.dirty).toBeTruthy();
        wmComponent.markAsPristine();
        expect(wmComponent.dirty).toBeFalsy();
    });

    it('should be able to set form as touched', () => {
        expect(wmComponent.touched).toBeFalsy();
        wmComponent.markAsTouched();
        expect(wmComponent.touched).toBeTruthy();
    });

    it('should be able to set form as untouched', () => {
        wmComponent.markAsTouched();
        expect(wmComponent.touched).toBeTruthy();
        wmComponent.markAsUntouched();
        expect(wmComponent.touched).toBeFalsy();
    });

    it('should trigger default required validator', () => {
        const invalidTestValue = '';
        const validTestValue = 'test';
        defaultValidators(
            VALIDATOR.REQUIRED,
            'required',
            true,
            'This field cannot be empty.',
            wmComponent.formfields['username'],
            invalidTestValue,
            validTestValue
        );
    });

    it('should trigger default regexp validator', () => {
        const invalidTestValue = 'test';
        const validTestValue = 'test@test.com';
        defaultValidators(
            VALIDATOR.REGEXP,
            'pattern',
            /\w+@\w+\.\w{2,3}/,
            'Not a Valid Email.',
            wmComponent.formfields['username'],
            invalidTestValue,
            validTestValue
        );
    });

    it('should trigger default maxchars validator', () => {
        const invalidTestValue = 'test12345';
        const validTestValue = 'test';
        defaultValidators(
            VALIDATOR.MAXCHARS,
            'maxlength',
            5,
            'Text is too long.',
            wmComponent.formfields['username'],
            invalidTestValue,
            validTestValue
        );
    });

    it('should trigger default minvalue validator', () => {
        const invalidTestValue = 15;
        const validTestValue = 18;
        defaultValidators(
            VALIDATOR.MINVALUE,
            'min',
            validTestValue,
            'Under age.',
            wmComponent.formfields['age'],
            invalidTestValue,
            validTestValue
        );
    });

    it('should trigger default maxvalue validator', () => {
        const invalidTestValue = 20;
        const validTestValue = 18;
        defaultValidators(
            VALIDATOR.MAXVALUE,
            'max',
            validTestValue,
            'Over age.',
            wmComponent.formfields['age'],
            invalidTestValue,
            validTestValue
        );
    });

    it('should respect the mindate validation', async(() => {
        const invalidTestValue = '2019-11-02';
        const validTestValue = '2019-12-05';
        dateValidations(
            VALIDATOR.MINDATE,
            '2019-12-02',
            'Minimum date.',
            wmComponent,
            invalidTestValue,
            validTestValue
        );
    }));

    it('should respect the maxdate validation', async(() => {
        const invalidTestValue = '2019-12-05';
        const validTestValue = '2019-11-02';
        dateValidations(
            VALIDATOR.MAXDATE,
            '2019-12-02',
            'Maximum date.',
            wmComponent,
            invalidTestValue,
            validTestValue
        );
    }));

    it('should respect the excludedays validation', async(() => {
        const invalidTestValue = '2019-12-30';
        const validTestValue = '2019-12-29';
        dateValidations(
            VALIDATOR.EXCLUDEDAYS,
            '1,6',
            'Excluded days.',
            wmComponent,
            invalidTestValue,
            validTestValue
        );
    }));

    it('should respect the excludedate validation', async(() => {
        const invalidTestValue = '2020-01-01';
        const validTestValue = '2020-01-02';
        dateValidations(
            VALIDATOR.EXCLUDEDATES,
            '2020-01-01',
            'Excluded dates.',
            wmComponent,
            invalidTestValue,
            validTestValue
        );
    }));

    xit('should respect the mintime validation', async(() => {
        let formField = wmComponent.formfields['timeofbirth'];
        let timeWidget = formField.getWidget().formWidget;
        timeWidget.timepattern = 'HH:mm:ss';
        timeWidget.datavalue = "01:00:00";
        formField.setValidators([{
            type: VALIDATOR.MINTIME,
            validator: '01:00:00',
            errorMessage: "Minimum time."
        }]);
        onClickCheckTaglengthOnBody(fixture, '.btn-date', null, null);

        fixture.whenStable().then(() => {
            triggerTimerClickonArrowsByIndex(3);
            checkCustomElementClass(getTimePickerElement()[3], 'disabled');
            checkCustomElementClass(getTimePickerElement()[4], 'disabled');
            checkCustomElementClass(getTimePickerElement()[5], 'disabled');
        });
    }));

    xit('should respect the maxtime validation', async(() => {
        let formField = wmComponent.formfields['timeofbirth'];
        let timeWidget = formField.getWidget().formWidget;
        timeWidget.timepattern = 'HH:mm:ss';
        timeWidget.datavalue = "03:00:00";
        formField.setValidators([{
            type: VALIDATOR.MAXTIME,
            validator: '03:00:00',
            errorMessage: "Minimum time."
        }]);
        onClickCheckTaglengthOnBody(fixture, '.btn-date', null, null);

        fixture.whenStable().then(() => {
            triggerTimerClickonArrowsByIndex(0);
            checkCustomElementClass(getTimePickerElement()[0], 'disabled');
            checkCustomElementClass(getTimePickerElement()[1], 'disabled');
            checkCustomElementClass(getTimePickerElement()[2], 'disabled');
        });
    }));

    it('should trigger custom validator(sync)', () => {
        const invalidTestValue = 'test';
        const validTestValue = 'test12345';
        let formField = wmComponent.formfields['username'];
        expect(formField._control.valid).toBeTruthy();
        formField.setValidators([fullNameValidator]);
        // Positive case
        formField.datavalue = invalidTestValue;
        expect(formField._control.valid).toBeFalsy();
        expect(formField._control.errors.errorMessage).toEqual('Enter your full name.');
        // Negetive case
        formField.datavalue = validTestValue;
        expect(formField._control.valid).toBeTruthy();
    });

    it('should trigger default and custom validator', () => {
        const invalidTestValue = 'test';
        const validTestValue = 'test12345';
        let formField = wmComponent.formfields['username'];
        expect(formField._control.valid).toBeTruthy();
        formField.setValidators([{
            type: VALIDATOR.REQUIRED,
            validator: true,
            errorMessage: "This field cannot be empty."
        }, fullNameValidator]);
        formField.datavalue = '';
        expect(formField._control.valid).toBeFalsy();
        expect(formField._control.errors.required).toBeTruthy();
        // Positive case
        formField.datavalue = invalidTestValue;
        expect(formField._control.valid).toBeFalsy();
        expect(formField._control.errors.errorMessage).toEqual('Enter your full name.');
        // Negetive case
        formField.datavalue = validTestValue;
        expect(formField._control.valid).toBeTruthy();
    });

    it('should trigger observe validator', fakeAsync(() => {
        const invalidTestValue = 'test';
        const validTestValue = 'valid';
        let firstNameFormField = wmComponent.formfields['username'];
        let lastNameFormField = wmComponent.formfields['lastname'];
        firstNameFormField.datavalue = invalidTestValue;
        expect(firstNameFormField._control.valid).toBeTruthy();
        firstNameFormField.setValidators([nameComparisionValidator]);
        firstNameFormField.observeOn(['lastname']);
        // As the Form is not touched the validations are not triggering,
        // So programatically setting the control as touched
        lastNameFormField._control.markAsTouched();
        // Positive case
        lastNameFormField.datavalue = invalidTestValue;
        // Added tick to kick in depended control validators
        tick(500);
        expect(firstNameFormField._control.valid).toBeFalsy();
        expect(firstNameFormField._control.errors.errorMessage).toEqual('First name and last name cannot be same.');
        // Negetive case
        lastNameFormField.datavalue = validTestValue;
        // Added tick to kick in depended control validators
        tick(500);
        expect(firstNameFormField._control.valid).toBeTruthy();
        discardPeriodicTasks();
    }));

    it('should trigger custom validator(async)', fakeAsync(() => {
        const invalidTestValue = 'test';
        const validTestValue = 'valid';
        let formField = wmComponent.formfields['username'];
        expect(formField._control.valid).toBeTruthy();
        formField.setAsyncValidators([registerFullNameValidator]);
        // Positive case
        formField.datavalue = invalidTestValue;
        // Added tick let the asyncronous call complete
        tick(500);
        expect(formField._control.valid).toBeFalsy();
        expect(formField._control.errors.errorMessage).toEqual('The email address is already registered.');
        // Negetive case
        formField.datavalue = validTestValue;
        tick(500);
        expect(formField._control.valid).toBeTruthy();
        discardPeriodicTasks();
    }));
});
