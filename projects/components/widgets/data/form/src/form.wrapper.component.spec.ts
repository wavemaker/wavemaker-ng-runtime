import {ComponentFixture, discardPeriodicTasks, fakeAsync, tick, waitForAsync} from '@angular/core/testing';
import {
    $invokeWatchers,
    AbstractI18nService,
    App,
    AppDefaults,
    DynamicComponentRefProvider,
    extendProto,
    getValidJSON,
    isElementInViewport,
    scrollToElement,
    UserDefinedExecutionContext,
    VALIDATOR,
    Viewport
} from '@wm/core';
import {FormComponent} from './form.component';
import {FormWidgetDirective} from './form-widget.directive';
import {InputTextComponent} from '@wm/components/input';
import {FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Component, ViewChild} from '@angular/core';
import {IMaskModule} from 'angular-imask';
import {FormActionDirective} from './form-action/form-action.directive';
import {FormFieldDirective} from './form-field/form-field.directive';
import {
    checkCustomElementClass,
    compileTestComponent,
    mockApp,
    mockViewport,
    onClickCheckTaglengthOnBody,
    setInputValue
} from '../../../../base/src/test/util/component-test-util';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from '../../../../base/src/test/common-widget.specs';
import {performDataOperation} from '@wm/components/base';
import {LayoutGridRowDirective} from '@wm/components/containers/layout-grid';
import {CommonModule, DatePipe, DecimalPipe} from '@angular/common';
import {TimepickerModule} from 'ngx-bootstrap/timepicker';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {BsDatepickerModule} from 'ngx-bootstrap/datepicker';
import {ToDatePipe} from '../../../../base/src/pipes/custom-pipes';
import {
    getTimePickerElement,
    MockAbstractI18nService,
    triggerTimerClickonArrowsByIndex
} from 'projects/components/base/src/test/util/date-test-util';
import {
    fullNameValidator,
    nameComparisionValidator,
    registerFullNameValidator
} from 'projects/components/base/src/test/util/validations-test-util';
import {DateComponent} from "../../../input/epoch/src/date/date.component";
import {TimeComponent} from "../../../input/epoch/src/time/time.component";
import {LabelDirective} from '@wm/components/basic';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    isElementInViewport: jest.fn(),
    scrollToElement: jest.fn(),
    $appDigest: jest.fn(),
    $invokeWatchers: jest.fn(),
    getValidJSON: jest.fn(),
}));

jest.mock('@wm/components/base', () => ({
    ...jest.requireActual('@wm/components/base'),
    performDataOperation: jest.fn()
}));

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
    @ViewChild(FormComponent, /* TODO: add static flag */ { static: true })
    wmComponent: FormComponent;
    public testdata: any = [{ name: 'Ram', age: 24, dob: '2019-12-02' }, { name: 'Sita', age: 22, dob: '2019-12-02' }];

    onBeforeSubmit() {
        // console.log('calling on before submit');
    }

    onResult() {
        // console.log('calling on result');
    }
    onSuccess() {
        // console.log('calling on success');
    }

    onSubmit() {
        // console.log('calling on submit');
    }

    onError() {
        // console.log('calling on error');
    }
}

const testModuleDef: ITestModuleDef = {
    imports: [
        BrowserAnimationsModule,
        InputTextComponent,
        FormsModule,
        ReactiveFormsModule,
        IMaskModule,
        LayoutGridRowDirective,
        LabelDirective,
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
        TimeComponent,
        DateComponent
    ],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: Viewport, useValue: mockViewport },
        { provide: AppDefaults, useClass: AppDefaults },
        { provide: FormBuilder, useClass: FormBuilder },
        { provide: DynamicComponentRefProvider, useValue: mockApp },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: DecimalPipe, useClass: DecimalPipe },
        { provide: UserDefinedExecutionContext, useValue: mockApp },
        { provide: AbstractI18nService, useClass: MockAbstractI18nService }
    ],
    teardown: { destroyAfterEach: false }
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
    let mockJQuery;

    const getSaveButtonEl = () => {
        return fixture.nativeElement.querySelector('button[name="save"]');
    };

    beforeEach(waitForAsync(() => {
        fixture = compileTestComponent(testModuleDef, FormWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        wmComponent = wrapperComponent.wmComponent;
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.formFields = [
            {
                key: 'field1',
                setFormWidget: jest.fn(),
                setReadOnlyState: jest.fn(),
                form: { name: 'form1' },
                datavalue: undefined,
                _control: new FormControl(''),
                nativeElement: {
                    querySelector: jest.fn().mockReturnValue({
                        removeAttribute: jest.fn()
                    })
                },
                widgettype: 'input',
                type: 'string',
                value: ''
            },
            {
                key: 'field2',
                setFormWidget: jest.fn(),
                setReadOnlyState: jest.fn(),
                form: { name: 'form1' },
                datavalue: undefined,
                _control: new FormControl(''),
                nativeElement: {
                    querySelector: jest.fn().mockReturnValue({
                        removeAttribute: jest.fn()
                    })
                },
                widgettype: 'input',
                type: 'string',
                value: ''
            }
        ];
        wmComponent.getFormFields = jest.fn().mockReturnValue(wmComponent.formFields);

        // Mock both updateFieldSource and _debouncedUpdateFieldSource
        jest.spyOn(wmComponent as any, 'updateFieldSource').mockImplementation(() => { });
        jest.spyOn(wmComponent as any, '_debouncedUpdateFieldSource').mockImplementation(() => { });

        wmComponent.ngform = new FormGroup({
            testField: new FormControl(''),
        });
        mockJQuery = {
            find: jest.fn().mockReturnThis(),
            first: jest.fn().mockReturnThis(),
            parent: jest.fn().mockReturnThis(),
            attr: jest.fn(),
            focus: jest.fn(),
            hasClass: jest.fn().mockReturnValue(false),
            length: 1,
            is: jest.fn().mockReturnValue(false)
        };
        Object.defineProperty(wmComponent, '$element', {
            value: mockJQuery,
            writable: true
        });
        fixture.detectChanges();

        btnElm = getSaveButtonEl();
        btnElm.widget.show = true;
        btnElm.widget.caption = 'Save';
        btnElm.widget.type = 'submit';
    }));
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should create Form Component', () => {
        fixture.detectChanges();
        expect(wrapperComponent).toBeTruthy();
    });

    it('should call updateFieldSource when formdatasource changes', () => {
        wmComponent.formdatasource = 'newDataSource';
        wmComponent.onFormDataSourceChange();
        expect(wmComponent['updateFieldSource']).toHaveBeenCalled();
    });

    it('should update form fields when updateFieldSource is called', () => {
        // Restore the original implementation for this test
        ((wmComponent as any)['updateFieldSource'] as jest.SpyInstance).mockRestore();

        wmComponent.formdatasource = { execute: jest.fn().mockReturnValue(false), twoWayBinding: true };
        (wmComponent as any).bindformdata = 'someBinding';

        wmComponent['updateFieldSource']();

        expect(wmComponent.formFields[0].setFormWidget).toHaveBeenCalledWith('datavaluesource', wmComponent.formdatasource);
        expect(wmComponent.formFields[0].setFormWidget).toHaveBeenCalledWith('binddatavalue', 'someBinding.field1');
        // Add similar expectations for other form fields
    });

    it('check for dirty property before and after form submit and should trigger onSuccess event', (async () => {
        const testValue = 'abc';
        const inputEl = fixture.nativeElement.querySelector('wm-input');
        setInputValue(fixture, '.app-textbox', testValue).then(() => {
            expect(inputEl.querySelector('input').value).toEqual(testValue);

            const formField = wmComponent.getWidget().formFields[0];
            formField._control.markAsDirty();
            fixture.detectChanges();
            expect(wmComponent.dirty).toBe(true);

            const onResultSpy = jest.spyOn(wrapperComponent, 'onResult');
            const onSuccessSpy = jest.spyOn(wrapperComponent, 'onSuccess');

            fixture.whenStable().then(() => {
                wmComponent.submitForm({});
                fixture.detectChanges();

                setTimeout(() => {
                    expect(onResultSpy).toHaveBeenCalledTimes(1);
                    expect(wmComponent.dirty).toBe(false);
                    expect(onSuccessSpy).toHaveBeenCalledTimes(1);
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

    it('should respect the mindate validation', waitForAsync(() => {
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

    it('should respect the maxdate validation', waitForAsync(() => {
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

    it('should respect the excludedays validation', waitForAsync(() => {
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

    it('should respect the excludedate validation', waitForAsync(() => {
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

    it('should respect the mintime validation', (() => {
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

    // it('should respect the maxtime validation', waitForAsync(() => {
    //     let formField = wmComponent.formfields['timeofbirth'];
    //     let timeWidget = formField.getWidget().formWidget;
    //     timeWidget.timepattern = 'HH:mm:ss';
    //     timeWidget.datavalue = "03:00:00";
    //     formField.setValidators([{
    //         type: VALIDATOR.MAXTIME,
    //         validator: '03:00:00',
    //         errorMessage: "Minimum time."
    //     }]);
    //     onClickCheckTaglengthOnBody(fixture, '.btn-date', null, null);
    //
    //     fixture.whenStable().then(() => {
    //         triggerTimerClickonArrowsByIndex(0);
    //         checkCustomElementClass(getTimePickerElement()[0], 'disabled');
    //         checkCustomElementClass(getTimePickerElement()[1], 'disabled');
    //         checkCustomElementClass(getTimePickerElement()[2], 'disabled');
    //     });
    // }));

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


    describe('onDataSourceChange', () => {
        it('should update isDataSourceUpdated when formFields exist and bindformdata is false', () => {
            wmComponent.formFields = [{}, {}];
            (wmComponent as any).bindformdata = false;
            wmComponent.getNearestParentFormData = jest.fn().mockReturnValue({ field1: 'value1' });
            wmComponent.setFormDataFromParentFormData = jest.fn();

            wmComponent.onDataSourceChange();

            expect(wmComponent.isDataSourceUpdated).toBe(true);
            expect(wmComponent.getNearestParentFormData).toHaveBeenCalledWith(wmComponent);
            expect(wmComponent.setFormDataFromParentFormData).toHaveBeenCalledWith({ field1: 'value1' });
        });

        it('should not update isDataSourceUpdated when formFields do not exist', () => {
            wmComponent.formFields = [];
            (wmComponent as any).bindformdata = false;

            wmComponent.onDataSourceChange();

            expect(wmComponent.isDataSourceUpdated).toBeFalsy();
        });

        it('should not update isDataSourceUpdated when bindformdata is true', () => {
            wmComponent.formFields = [{}, {}];
            (wmComponent as any).bindformdata = true;

            wmComponent.onDataSourceChange();

            expect(wmComponent.isDataSourceUpdated).toBeFalsy();
        });
    });

    describe('onFormDataSourceChange', () => {
        it('should call updateFieldSource', () => {
            (wmComponent as any).updateFieldSource = jest.fn();

            wmComponent.onFormDataSourceChange();

            expect((wmComponent as any).updateFieldSource).toHaveBeenCalled();
        });
    });

    describe('setValidationOnInnerForms', () => {
        beforeEach(() => {
            wmComponent['setValidationOnFields'] = jest.fn();
            wmComponent['getNativeElement'] = jest.fn().mockReturnValue({
                querySelectorAll: jest.fn().mockReturnValue([])
            });
        });

        it('should call setValidationOnFields for each form element', () => {
            const mockFormElements = [
                { widget: { name: 'form1' } },
                { widget: { name: 'form2' } }
            ];
            (wmComponent as any)['getNativeElement'].mockReturnValue({
                querySelectorAll: jest.fn().mockReturnValue(mockFormElements)
            });

            wmComponent['setValidationOnInnerForms'](true);

            expect(wmComponent['setValidationOnFields']).toHaveBeenCalledTimes(2);
            expect(wmComponent['setValidationOnFields']).toHaveBeenCalledWith(mockFormElements[0].widget, 'form1', true);
            expect(wmComponent['setValidationOnFields']).toHaveBeenCalledWith(mockFormElements[1].widget, 'form2', true);
        });

        it('should handle form array index in form name', () => {
            const mockFormElement = {
                widget: {
                    name: 'form1',
                    formArrayIndex: 0
                }
            };
            (wmComponent as any)['getNativeElement'].mockReturnValue({
                querySelectorAll: jest.fn().mockReturnValue([mockFormElement])
            });

            wmComponent['setValidationOnInnerForms'](false);

            expect(wmComponent['setValidationOnFields']).toHaveBeenCalledWith(mockFormElement.widget, 'form1[0]', false);
        });
    });

    describe('ngAfterViewInit', () => {
        it('should set FormArray control and push ngform when parentForm and isParentList are true', () => {
            (wmComponent as any).parentForm = { ngform: new FormGroup({}) };
            Object.defineProperty(wmComponent, 'isParentList', { value: true });
            (wmComponent as any).parentList = { name: 'testList' };
            Object.defineProperty(wmComponent, 'parentFormArray', { value: new FormArray([]) });
            wmComponent.ngform = new FormGroup({});

            wmComponent.ngAfterViewInit();

            expect(wmComponent.parentForm.ngform.get('testList')).toBeInstanceOf(FormArray);
            expect(wmComponent.parentFormArray.length).toBe(1);
            expect((wmComponent as any).formArrayIndex).toBe(0);
        });

        it('should not set FormArray control when it already exists', () => {
            const existingFormArray = new FormArray([]);
            (wmComponent as any).parentForm = {
                ngform: new FormGroup({
                    testList: existingFormArray
                })
            };
            Object.defineProperty(wmComponent, 'isParentList', { value: true });
            (wmComponent as any).parentList = { name: 'testList' };
            Object.defineProperty(wmComponent, 'parentFormArray', { value: existingFormArray });
            wmComponent.ngform = new FormGroup({});

            wmComponent.ngAfterViewInit();

            expect(wmComponent.parentForm.ngform.get('testList')).toBe(existingFormArray);
            expect(wmComponent.parentFormArray.length).toBe(1);
            expect((wmComponent as any).formArrayIndex).toBe(0);
        });
        it('should call addInnerNgFormToForm', () => {
            jest.spyOn(wmComponent as any, 'addInnerNgFormToForm');
            (wmComponent as any).bindingValue = 'testBinding';

            // Clear the mock calls before the test
            (wmComponent as any)._debouncedUpdateFieldSource.mockClear();

            wmComponent.ngAfterViewInit();

            expect((wmComponent as any).addInnerNgFormToForm).toHaveBeenCalledWith('testBinding');
        });
    });

    describe('addInnerNgFormToForm', () => {
        beforeEach(() => {
            (wmComponent as any).parentForm = {
                ngform: new FormGroup({})
            };
            wmComponent.ngform = new FormGroup({});
            Object.defineProperty(wmComponent, 'widgetId', { value: 'testWidgetId' });
        });

        it('should return early when isParentList is true', () => {
            Object.defineProperty(wmComponent, 'isParentList', { value: true });

            (wmComponent as any).addInnerNgFormToForm('binding');

            expect((wmComponent as any).formGroupName).toBeUndefined();
        });

        it('should set formGroupName and add control to parentForm when conditions are met', () => {
            Object.defineProperty(wmComponent, 'isParentList', { value: false });

            (wmComponent as any).addInnerNgFormToForm('binding');

            expect((wmComponent as any).formGroupName).toBe('binding');
            expect(wmComponent.parentForm.ngform.get('binding')).toBe(wmComponent.ngform);
        });

        it('should handle name conflicts by appending a unique identifier', () => {
            (wmComponent as any).parentForm = {
                ngform: new FormGroup({
                    binding: new FormGroup({}),
                    binding_1: new FormGroup({})
                })
            };
            Object.defineProperty(wmComponent, 'isParentList', { value: false });

            // Clear the mock calls before the test
            (wmComponent as any)._debouncedUpdateFieldSource.mockClear();

            (wmComponent as any).addInnerNgFormToForm('binding');

            expect((wmComponent as any).formGroupName).toBe('binding_2');
            expect(wmComponent.parentForm.ngform.get('binding_2')).toBe(wmComponent.ngform);
        });
    });

    describe('addEventsToContext', () => {
        it('should add all form actions to the context', () => {
            const context = {};
            (wmComponent as any).addEventsToContext(context);

            expect(context).toHaveProperty('cancel');
            expect(context).toHaveProperty('reset');
            expect(context).toHaveProperty('save');
            expect(context).toHaveProperty('saveAndNew');
            expect(context).toHaveProperty('saveAndView');
            expect(context).toHaveProperty('delete');
            expect(context).toHaveProperty('new');
            expect(context).toHaveProperty('edit');
            expect(context).toHaveProperty('highlightInvalidFields');
            expect(context).toHaveProperty('filter');
            expect(context).toHaveProperty('clearFilter');
            expect(context).toHaveProperty('submit');
        });

        it('should call corresponding component methods when context methods are invoked', () => {
            const context = {};
            (wmComponent as any).addEventsToContext(context);

            // Create mock methods on the component for those that don't exist
            const mockMethods = [
                'cancel', 'reset', 'save', 'saveAndNew', 'saveAndView', 'delete',
                'new', 'edit', 'highlightInvalidFields', 'filter', 'clearFilter', 'submit'
            ];

            mockMethods.forEach(method => {
                if (typeof wmComponent[method] !== 'function') {
                    wmComponent[method] = jest.fn();
                } else {
                    jest.spyOn((wmComponent as any), method);
                }
            });

            // Call context methods
            mockMethods.forEach(method => {
                if (typeof context[method] === 'function') {
                    context[method]('event');
                }
            });

            // Check if component methods were called
            mockMethods.forEach(method => {
                if (typeof wmComponent[method] === 'function') {
                    expect(wmComponent[method]).toHaveBeenCalled();
                }
            });
        });
    });

    describe('setValidationOnInnerForms', () => {
        it('should call setValidationOnFields for each inner form', () => {
            // Mock the necessary methods and properties
            wmComponent['getNativeElement'] = jest.fn().mockReturnValue({
                querySelectorAll: jest.fn().mockReturnValue([
                    { widget: { name: 'form1' } },
                    { widget: { name: 'form2', formArrayIndex: 0 } },
                    { widget: { name: 'form3', parentForm: { name: 'parentForm' } } }
                ])
            });
            wmComponent['setValidationOnFields'] = jest.fn();

            wmComponent['setValidationOnInnerForms'](true);

            expect(wmComponent['setValidationOnFields']).toHaveBeenCalledTimes(3);
            expect(wmComponent['setValidationOnFields']).toHaveBeenCalledWith({ name: 'form1' }, 'form1', true);
            expect(wmComponent['setValidationOnFields']).toHaveBeenCalledWith({ name: 'form2', formArrayIndex: 0 }, 'form2[0]', true);
            expect(wmComponent['setValidationOnFields']).toHaveBeenCalledWith({ name: 'form3', parentForm: { name: 'parentForm' } }, 'parentForm.form3', true);
        });

        it('should handle complex nested form structures', () => {
            wmComponent['getNativeElement'] = jest.fn().mockReturnValue({
                querySelectorAll: jest.fn().mockReturnValue([
                    {
                        widget: {
                            name: 'childForm',
                            formArrayIndex: 1,
                            parentForm: {
                                name: 'parentForm',
                                formGroupName: 'parentGroup',
                                parentFormArray: true,
                                formArrayIndex: 0
                            }
                        }
                    }
                ])
            });
            wmComponent['setValidationOnFields'] = jest.fn();

            wmComponent['setValidationOnInnerForms'](false);

            expect(wmComponent['setValidationOnFields']).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'childForm' }),
                'parentGroup[0].childForm[1]',
                false
            );
        });
    });

    describe('validateFieldsOnSubmit', () => {
        beforeEach(() => {
            (wmComponent as any).setValidationMsgs = jest.fn();
            wmComponent.highlightInvalidFields = jest.fn();

            // Set up a more comprehensive form structure
            wmComponent.ngform = new FormGroup({
                field1: new FormControl(''),
                field2: new FormControl(''),
                nestedForm: new FormGroup({
                    nestedField: new FormControl('')
                })
            });
        });

        it('should return false when operationType is delete', () => {
            (wmComponent as any).operationType = 'delete';
            expect(wmComponent.validateFieldsOnSubmit()).toBeFalsy();
        });

        it('should return false when form is valid', () => {
            wmComponent.ngform.setErrors(null);
            expect(wmComponent.validateFieldsOnSubmit()).toBeFalsy();
        });

        it('should highlight invalid fields when validationtype is default', () => {
            wmComponent.validationtype = 'default';
            wmComponent.ngform.setErrors({ invalid: true });
            wmComponent.validateFieldsOnSubmit();
            expect(wmComponent.highlightInvalidFields).toHaveBeenCalled();
        });

        it('should focus on first invalid element', () => {
            wmComponent.validationtype = 'html';
            wmComponent.ngform.setErrors({ invalid: true });
            wmComponent.ngform.controls.field1.setErrors({ required: true });

            mockJQuery.attr.mockReturnValue('field1');
            mockJQuery.hasClass.mockReturnValue(false);

            expect(wmComponent.validateFieldsOnSubmit()).toBeTruthy();
            expect(mockJQuery.find).toHaveBeenCalledWith('form.ng-invalid:visible, [formControlName].ng-invalid:visible');
            expect(mockJQuery.focus).toHaveBeenCalled();
        });

        it('should handle nested invalid forms', () => {
            wmComponent.validationtype = 'html';
            wmComponent.ngform.setErrors({ invalid: true });
            wmComponent.ngform.controls.nestedForm.setErrors({ required: true });
            (wmComponent.ngform.controls.nestedForm as FormGroup).controls.nestedField.setErrors({ required: true });

            mockJQuery.is.mockReturnValueOnce(true).mockReturnValueOnce(false);
            mockJQuery.attr.mockReturnValueOnce('nestedForm').mockReturnValueOnce('nestedField');
            mockJQuery.hasClass.mockReturnValue(false);

            expect(wmComponent.validateFieldsOnSubmit()).toBeTruthy();
            expect(mockJQuery.find).toHaveBeenCalledWith('form.ng-invalid:visible, [formControlName].ng-invalid:visible');
            expect(mockJQuery.focus).toHaveBeenCalled();
        });

        it('should not focus on invalid element if it is an app-search-input', () => {
            wmComponent.validationtype = 'html';
            wmComponent.ngform.setErrors({ invalid: true });
            wmComponent.ngform.controls.field1.setErrors({ required: true });

            mockJQuery.attr.mockReturnValue('field1');
            mockJQuery.hasClass.mockReturnValue(true);

            expect(wmComponent.validateFieldsOnSubmit()).toBeTruthy();
            expect(mockJQuery.find).toHaveBeenCalledWith('form.ng-invalid:visible, [formControlName].ng-invalid:visible');
            expect(mockJQuery.focus).not.toHaveBeenCalled();
        });
    });

    describe('handleEvent', () => {
        it('should not call super.handleEvent for submit event', () => {
            const superHandleEvent = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(wmComponent)), 'handleEvent');
            (wmComponent as any).handleEvent(document.createElement('div'), 'submit', jest.fn(), {});
            expect(superHandleEvent).not.toHaveBeenCalled();
        });

        it('should call super.handleEvent for non-submit events', () => {
            const superHandleEvent = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(wmComponent)), 'handleEvent');
            (wmComponent as any).handleEvent(document.createElement('div'), 'click', jest.fn(), {});
            expect(superHandleEvent).toHaveBeenCalled();
        });
    });

    describe('onPropertyChange', () => {
        beforeEach(() => {
            (wmComponent as any).setLayoutConfig = jest.fn();
            wmComponent.setFormData = jest.fn();
            wmComponent.onDataSourceChange = jest.fn();
            wmComponent.onFormDataSourceChange = jest.fn();
            wmComponent.generateFormFields = jest.fn();
        });

        it('should set captionAlignClass for captionalign', () => {
            wmComponent.onPropertyChange('captionalign', 'left');
            expect(wmComponent.captionAlignClass).toBe('align-left');
        });

        it('should call setLayoutConfig for captionposition and captionwidth', () => {
            wmComponent.onPropertyChange('captionposition', 'top');
            expect((wmComponent as any).setLayoutConfig).toHaveBeenCalled();

            wmComponent.onPropertyChange('captionwidth', '100px');
            expect((wmComponent as any).setLayoutConfig).toHaveBeenCalledTimes(2);
        });

        it('should set captionsize', () => {
            wmComponent.onPropertyChange('captionsize', '14px');
            expect(wmComponent.captionsize).toBe('14px');
        });

        it('should set validationtype based on novalidate', () => {
            (wmComponent as any).widget = { validationtype: '' };
            wmComponent.onPropertyChange('novalidate', true);
            expect((wmComponent as any).widget.validationtype).toBe('none');

            wmComponent.onPropertyChange('novalidate', false);
            expect((wmComponent as any).widget.validationtype).toBe('default');
        });

        it('should handle formdata changes', () => {
            wmComponent.onPropertyChange('formdata', [{ id: 1 }, { id: 2 }]);
            expect(wmComponent.setFormData).toHaveBeenCalledWith({ id: 2 });

            wmComponent.onPropertyChange('formdata', { id: 3 });
            expect(wmComponent.setFormData).toHaveBeenCalledWith({ id: 3 });
        });

        it('should handle defaultmode changes', () => {
            wmComponent.isLayoutDialog = false;
            wmComponent.onPropertyChange('defaultmode', 'Edit');
            expect(wmComponent.updateMode).toBeTruthy();
            expect(wmComponent.isUpdateMode).toBeTruthy();

            wmComponent.onPropertyChange('defaultmode', 'View');
            expect(wmComponent.updateMode).toBeFalsy();
            expect(wmComponent.isUpdateMode).toBeFalsy();
        });

        it('should call appropriate methods for datasource and formdatasource changes', () => {
            wmComponent.onPropertyChange('datasource', {});
            expect(wmComponent.onDataSourceChange).toHaveBeenCalled();

            wmComponent.onPropertyChange('formdatasource', {});
            expect(wmComponent.onFormDataSourceChange).toHaveBeenCalled();
        });

        it('should call generateFormFields for metadata changes', () => {
            wmComponent.onPropertyChange('metadata', {});
            expect(wmComponent.generateFormFields).toHaveBeenCalled();
        });

        it('should handle dataset changes', () => {
            const mockField = {
                isDataSetBound: false,
                formWidget: {
                    dataset$: {
                        next: jest.fn()
                    }
                }
            };
            (wmComponent as any).getFormFields.mockReturnValue([mockField]);
            wmComponent.onPropertyChange('dataset', {});
            expect(mockField.formWidget.dataset$.next).toHaveBeenCalled();
        });
    });

    describe('validateFieldsOnSubmit', () => {
        beforeEach(() => {
            (wmComponent as any).setValidationMsgs = jest.fn();
            wmComponent.highlightInvalidFields = jest.fn();

            // Set up a more comprehensive form structure
            wmComponent.ngform = new FormGroup({
                field1: new FormControl(''),
                field2: new FormControl(''),
                nestedForm: new FormGroup({
                    nestedField: new FormControl('')
                })
            });

            // Reset mock jQuery methods before each test
            mockJQuery.find.mockReset();
            mockJQuery.first.mockReset();
            mockJQuery.parent.mockReset();
            mockJQuery.attr.mockReset();
            mockJQuery.focus.mockReset();
            mockJQuery.hasClass.mockReset();
            mockJQuery.is.mockReset();

            // Set default return values
            mockJQuery.find.mockReturnValue(mockJQuery);
            mockJQuery.first.mockReturnValue(mockJQuery);
            mockJQuery.parent.mockReturnValue(mockJQuery);
            mockJQuery.hasClass.mockReturnValue(false);
            mockJQuery.is.mockReturnValue(false);
            mockJQuery.length = 1;
        });

        it('should return false when operationType is delete', () => {
            (wmComponent as any).operationType = 'delete';
            expect(wmComponent.validateFieldsOnSubmit()).toBeFalsy();
        });

        it('should return false when form is valid', () => {
            wmComponent.ngform.setErrors(null);
            expect(wmComponent.validateFieldsOnSubmit()).toBeFalsy();
        });

        it('should highlight invalid fields when validationtype is default', () => {
            wmComponent.validationtype = 'default';
            wmComponent.ngform.setErrors({ invalid: true });
            wmComponent.validateFieldsOnSubmit();
            expect(wmComponent.highlightInvalidFields).toHaveBeenCalled();
        });

        it('should focus on first invalid element', () => {
            wmComponent.validationtype = 'html';
            wmComponent.ngform.setErrors({ invalid: true });
            wmComponent.ngform.controls.field1.setErrors({ required: true });

            mockJQuery.attr.mockReturnValue('field1');

            expect(wmComponent.validateFieldsOnSubmit()).toBeTruthy();
            expect(mockJQuery.find).toHaveBeenCalledWith('form.ng-invalid:visible, [formControlName].ng-invalid:visible');
            expect(mockJQuery.focus).toHaveBeenCalled();
        });

        it('should handle nested invalid forms', () => {
            wmComponent.validationtype = 'html';
            wmComponent.ngform.setErrors({ invalid: true });
            wmComponent.ngform.controls.nestedForm.setErrors({ required: true });
            (wmComponent.ngform.controls.nestedForm as FormGroup).controls.nestedField.setErrors({ required: true });

            mockJQuery.is.mockReturnValueOnce(true).mockReturnValueOnce(false);
            mockJQuery.attr.mockReturnValueOnce('nestedForm').mockReturnValueOnce('nestedField');

            expect(wmComponent.validateFieldsOnSubmit()).toBeTruthy();
            expect(mockJQuery.find).toHaveBeenCalledWith('form.ng-invalid:visible, [formControlName].ng-invalid:visible');
            expect(mockJQuery.focus).toHaveBeenCalled();
        });

        it('should not focus on invalid element if it is an app-search-input', () => {
            wmComponent.validationtype = 'html';
            wmComponent.ngform.setErrors({ invalid: true });
            wmComponent.ngform.controls.field1.setErrors({ required: true });

            mockJQuery.attr.mockReturnValue('field1');
            mockJQuery.hasClass.mockReturnValue(true);

            expect(wmComponent.validateFieldsOnSubmit()).toBeTruthy();
            expect(mockJQuery.find).toHaveBeenCalledWith('form.ng-invalid:visible, [formControlName].ng-invalid:visible');
            expect(mockJQuery.focus).not.toHaveBeenCalled();
        });
    });

    describe('toggleMessage', () => {
        beforeEach(() => {
            wmComponent.messageRef = {
                showMessage: jest.fn()
            };
            (wmComponent as any).app = {
                notifyApp: jest.fn()
            };
            wmComponent.checkAppServiceErrorMsg = jest.fn();
            wmComponent.statusMessage = { caption: '', type: '' };
            (isElementInViewport as jest.Mock).mockReturnValue(true);
            (scrollToElement as jest.Mock).mockClear();
        });

        it('should set statusMessage caption to empty when show is false', () => {
            wmComponent.toggleMessage(false);
            expect(wmComponent.statusMessage.caption).toBe('');
        });

        it('should use errormessage when type is error and errormessage is set', () => {
            wmComponent.errormessage = 'Custom error message';
            wmComponent.toggleMessage(true, 'Default message', 'error');
            expect(wmComponent.statusMessage.caption).toBe('Custom error message');
        });

        it('should use provided message when type is not error', () => {
            wmComponent.toggleMessage(true, 'Info message', 'info');
            expect(wmComponent.statusMessage.caption).toBe('Info message');
        });

        it('should show inline message when messagelayout is Inline', () => {
            wmComponent.messagelayout = 'Inline';
            wmComponent.toggleMessage(true, 'Test message', 'info');
            expect(wmComponent.messageRef.showMessage).toHaveBeenCalledWith('Test message', 'info');
        });

        it('should scroll to element when not in viewport', () => {
            wmComponent.messagelayout = 'Inline';
            (isElementInViewport as jest.Mock).mockReturnValue(false);
            wmComponent.toggleMessage(true, 'Test message', 'info');
            expect(scrollToElement).toHaveBeenCalledWith(wmComponent.$element[0]);
        });

        it('should use app.notifyApp when messagelayout is not Inline', () => {
            wmComponent.messagelayout = 'Toaster';
            wmComponent.toggleMessage(true, 'Test message', 'info', 'Test Header');
            expect((wmComponent as any).app.notifyApp).toHaveBeenCalledWith('Test message', 'info', 'Test Header');
        });

        it('should use checkAppServiceErrorMsg when type is error and messagelayout is Inline', () => {
            wmComponent.messagelayout = 'Inline';
            (wmComponent as any).checkAppServiceErrorMsg.mockReturnValue('Service error message');
            wmComponent.toggleMessage(true, 'Test message', 'error');
            expect(wmComponent.statusMessage.caption).toBe('Service error message');
        });
    });

    describe('checkAppServiceErrorMsg', () => {
        beforeEach(() => {
            (wmComponent as any).app = {
                Actions: {
                    appNotification: {
                        getMessage: jest.fn()
                    }
                }
            };
        });

        it('should return undefined when type is not error', () => {
            expect(wmComponent.checkAppServiceErrorMsg('info')).toBeUndefined();
        });

        it('should return undefined when notificationAction is not available', () => {
            (wmComponent as any).app.Actions.appNotification = undefined;
            expect(wmComponent.checkAppServiceErrorMsg('error')).toBeUndefined();
        });

        it('should return message from notificationAction when available and type is error', () => {
            const mockMessage = 'Custom error message';
            (wmComponent as any).app.Actions.appNotification.getMessage.mockReturnValue(mockMessage);
            expect(wmComponent.checkAppServiceErrorMsg('error')).toBe(mockMessage);
        });
    });

    describe('registerFormFields', () => {
        beforeEach(() => {
            wmComponent.formFields = [];
            wmComponent.formfields = {};
            wmComponent.registerFormWidget = jest.fn();
            (wmComponent as any)._debouncedUpdateFieldSource = jest.fn();
            wmComponent.onDataSourceChange = jest.fn();
            wmComponent.setFormData = jest.fn();
        });

        it('should register a form field', () => {
            const mockField = { key: 'testField', form: { name: 'testForm' } };
            wmComponent.registerFormFields(mockField);

            expect(wmComponent.formFields).toContain(mockField);
            expect(wmComponent.formfields['testField']).toBe(mockField);
            expect(wmComponent.registerFormWidget).toHaveBeenCalledWith(mockField);
            expect((wmComponent as any)._debouncedUpdateFieldSource).toHaveBeenCalled();
        });

        it('should register field with parent form if present', () => {
            const mockField = { key: 'testField', form: { name: 'testForm' } };
            (wmComponent as any).parentForm = {
                formFields: [],
                formfields: {},
                setFormData: jest.fn()
            };
            wmComponent.registerFormFields(mockField);

            expect(wmComponent.parentForm.formFields).toContain(mockField);
            expect(wmComponent.parentForm.formfields['testField']).toBe(mockField);
            expect(wmComponent.parentForm.setFormData).toHaveBeenCalled();
        });

        it('should apply formdata when all fields are registered', () => {
            wmComponent.numberOfFields = 2;
            wmComponent.formdata = { field1: 'value1', field2: 'value2' };

            wmComponent.registerFormFields({ key: 'field1', form: { name: 'testForm' } });
            wmComponent.registerFormFields({ key: 'field2', form: { name: 'testForm' } });

            expect(wmComponent.onDataSourceChange).toHaveBeenCalled();
            expect(wmComponent.setFormData).toHaveBeenCalledWith(wmComponent.formdata);
        });
    });

    describe('constructDataObject', () => {
        beforeEach(() => {
            wmComponent.getFormFields = jest.fn().mockReturnValue([
                { key: 'field1', datavalue: 'value1', form: { widgetId: 'form1' }, _control: new FormControl('value1') },
                { key: 'field2', datavalue: 'value2', form: { widgetId: 'form1' }, _control: new FormControl('value2') },
                { key: 'field3', datavalue: null, form: { widgetId: 'form1' }, _control: new FormControl(null) }
            ]);
            wmComponent.updateFormDataOutput = jest.fn(data => wmComponent.dataoutput = data);
            Object.defineProperty(wmComponent, 'widgetId', { value: 'form1' });
        });

        it('should construct data object from form fields', () => {
            const result = wmComponent.constructDataObject();

            expect(result).toEqual({
                field1: 'value1',
                field2: 'value2',
                field3: undefined
            });
            expect(wmComponent.updateFormDataOutput).toHaveBeenCalled();
        });

        it('should handle inner form fields', () => {
            (wmComponent as any).getFormFields.mockReturnValue([
                { key: 'field1', datavalue: 'value1', form: { widgetId: 'form1' }, _control: new FormControl('value1') },
                { key: 'innerField', datavalue: 'innerValue', form: { widgetId: 'form2', formGroupName: 'innerForm' }, _control: new FormControl('innerValue') }
            ]);

            const result = wmComponent.constructDataObject();

            expect(result).toEqual({
                field1: 'value1',
                innerForm: {
                    innerField: 'innerValue'
                }
            });
        });

        it('should handle form array fields', () => {
            (wmComponent as any).getFormFields.mockReturnValue([
                { key: 'field1', datavalue: 'value1', form: { widgetId: 'form1' }, _control: new FormControl('value1') },
                { key: 'arrayField', datavalue: 'arrayValue', form: { widgetId: 'form1', formArrayIndex: 0, isParentList: true, parentList: { name: 'arrayForm' } }, _control: new FormControl('arrayValue') }
            ]);

            const result = wmComponent.constructDataObject();

            expect(result).toEqual({
                field1: 'value1',
                arrayForm: [
                    { arrayField: 'arrayValue' }
                ]
            });
        });
    });

    describe('updateDataOutput', () => {
        beforeEach(() => {
            wmComponent.constructDataObject = jest.fn();
            (wmComponent as any).setValidationMsgs = jest.fn();
            (wmComponent as any).ngform = { touched: false };
        });

        it('should call constructDataObject', () => {
            wmComponent.updateDataOutput();
            expect(wmComponent.constructDataObject).toHaveBeenCalled();
        });

        it('should not call setValidationMsgs when form is untouched', () => {
            wmComponent.updateDataOutput();
            expect((wmComponent as any).setValidationMsgs).not.toHaveBeenCalled();
        });
    });

    describe('setFieldValue', () => {
        let mockField;
        let mockData;

        beforeEach(() => {
            mockField = {
                key: 'testField',
                name: 'testField',
                form: {},
                value: undefined
            };
            mockData = {
                testField: 'testValue'
            };
            Object.defineProperty(wmComponent, 'dirty', {
                value: false,
                writable: true
            });
            (wmComponent as any)._triggeredByUser = false;
            wmComponent.markAsPristine = jest.fn();
            wmComponent.setFormData = jest.fn();
            wmComponent.setFormDataFromParentFormData = jest.fn();
        });

        it('should set field value when key exists in data', () => {
            wmComponent.setFieldValue(mockField, mockData);
            expect(mockField.value).toBe('testValue');
        });

        it('should set field value for nested key', () => {
            mockField.key = 'parent.child';
            mockData = { parent: { child: 'nestedValue' } };
            wmComponent.setFieldValue(mockField, mockData);
            expect(mockField.value).toBe('nestedValue');
        });

        it('should mark form as pristine when dirty and not triggered by user', () => {
            Object.defineProperty(wmComponent, 'dirty', {
                value: true,
                writable: true
            });
            wmComponent.setFieldValue(mockField, mockData);
            expect(wmComponent.markAsPristine).toHaveBeenCalled();
        });

        it('should call setFormData for inner form fields', () => {
            mockField.form.formGroupName = 'innerForm';
            mockData.innerForm = { testField: 'innerValue' };
            wmComponent.setFieldValue(mockField, mockData);
            expect(wmComponent.setFormData).toHaveBeenCalledWith({ testField: 'innerValue' });
        });

        it('should call setFormDataFromParentFormData for parent form array', () => {
            mockField.form.parentFormArray = true;
            wmComponent.setFieldValue(mockField, mockData);
            expect(wmComponent.setFormDataFromParentFormData).toHaveBeenCalledWith(mockData);
        });
    });

    describe('setFormData', () => {
        let mockFormFields;
        let mockData;

        beforeEach(() => {
            mockFormFields = [
                { key: 'field1', fieldValidations: { setCustomValidationMessage: jest.fn() } },
                { key: 'field2', fieldValidations: { setCustomValidationMessage: jest.fn() } }
            ];
            mockData = { field1: 'value1', field2: 'value2' };
            wmComponent.setFieldValue = jest.fn();
            wmComponent.constructDataObject = jest.fn();
        });

        it('should call setFieldValue for each form field', () => {
            wmComponent.setFormData(mockData, mockFormFields);
            expect(wmComponent.setFieldValue).toHaveBeenCalledTimes(2);
            expect(wmComponent.setFieldValue).toHaveBeenCalledWith(mockFormFields[0], mockData, undefined);
            expect(wmComponent.setFieldValue).toHaveBeenCalledWith(mockFormFields[1], mockData, undefined);
        });

        it('should call setCustomValidationMessage for fields with fieldValidations', () => {
            wmComponent.setFormData(mockData, mockFormFields);
            expect(mockFormFields[0].fieldValidations.setCustomValidationMessage).toHaveBeenCalled();
            expect(mockFormFields[1].fieldValidations.setCustomValidationMessage).toHaveBeenCalled();
        });

        it('should call constructDataObject', () => {
            wmComponent.setFormData(mockData, mockFormFields);
            expect(wmComponent.constructDataObject).toHaveBeenCalled();
        });
    });

    describe('resetFormState', () => {
        beforeEach(() => {
            (wmComponent as any).validationMessages = ['message1', 'message2'];
            (wmComponent as any).ngform = {
                markAsUntouched: jest.fn(),
                markAsPristine: jest.fn()
            };
        });

        it('should clear validation messages', () => {
            wmComponent.resetFormState();
            expect((wmComponent as any).validationMessages).toEqual([]);
        });

        it('should mark form as untouched and pristine', () => {
            wmComponent.resetFormState();
            expect(wmComponent.ngform.markAsUntouched).toHaveBeenCalled();
            expect(wmComponent.ngform.markAsPristine).toHaveBeenCalled();
        });

        it('should not throw error if ngform is not defined', () => {
            wmComponent.ngform = undefined;
            expect(() => wmComponent.resetFormState()).not.toThrow();
        });
    });

    describe('savePrevformFields', () => {
        it('should save previous form fields', () => {
            wmComponent.formFields = [
                { key: 'field1', type: 'string', widgettype: 'text', outputformat: 'text', value: 'value1' },
                { key: 'field2', type: 'number', widgettype: 'number', outputformat: 'number', value: 123 }
            ];
            wmComponent.savePrevformFields();
            expect(wmComponent.prevformFields).toEqual([
                { key: 'field1', type: 'string', widgettype: 'text', outputformat: 'text', value: 'value1' },
                { key: 'field2', type: 'number', widgettype: 'number', outputformat: 'number', value: 123 }
            ]);
        });
    });

    describe('resetFileUploadWidget', () => {
        let mockField;
        beforeEach(() => {
            mockField = {
                key: 'fileField',
                _control: { reset: jest.fn() },
                href: 'oldHref',
                value: 'oldValue'
            };
            Object.defineProperty(wmComponent, '$element',
                {
                    value: {
                        find: jest.fn().mockReturnValue({ val: jest.fn() })
                    }
                }
            );
        });

        it('should reset file upload widget', () => {
            wmComponent.resetFileUploadWidget(mockField);
            expect(wmComponent.$element.find).toHaveBeenCalledWith('[name="fileField_formWidget"]');
            expect(mockField._control.reset).toHaveBeenCalled();
            expect(mockField.href).toBe('');
            expect(mockField.value).toBeNull();
        });

        it('should not set href and value when skipValueSet is true', () => {
            wmComponent.resetFileUploadWidget(mockField, true);
            expect(mockField.href).toBe('oldHref');
            expect(mockField.value).toBe('oldValue');
        });
    });

    describe('setOperationType', () => {
        it('should set operation type to provided mode', () => {
            wmComponent.setOperationType('update');
            expect((wmComponent as any).operationType).toBe('update');
        });

        it('should set operation type to insert when no mode is provided', () => {
            wmComponent.setOperationType("");
            expect((wmComponent as any).operationType).toBe('insert');
        });
    });

    describe('triggerWMEvent', () => {
        beforeEach(() => {
            Object.defineProperty(wmComponent, 'nativeElement', { value: { getAttribute: jest.fn() } });
            (wmComponent as any).app = { notify: jest.fn() };
        });

        it('should trigger WM event when dependsontable is set', () => {
            (wmComponent as any).nativeElement.getAttribute.mockReturnValue('testTable');
            (wmComponent as any).triggerWMEvent('testEvent');
            expect($invokeWatchers).toHaveBeenCalledWith(true);
            expect((wmComponent as any).app.notify).toHaveBeenCalledWith('wm-event', { eventName: 'testEvent', widgetName: 'testTable' });
        });

        it('should not trigger WM event when dependsontable is not set', () => {
            (wmComponent as any).nativeElement.getAttribute.mockReturnValue(null);
            (wmComponent as any).triggerWMEvent('testEvent');
            expect((wmComponent as any).app.notify).not.toHaveBeenCalled();
        });
    });

    describe('closeDialog', () => {
        it('should close dialog', () => {
            wmComponent.dialogId = 'testDialog';
            (wmComponent as any).dialogService = { close: jest.fn() };
            wmComponent.closeDialog();
            expect((wmComponent as any).dialogService.close).toHaveBeenCalledWith('testDialog');
        });
    });

    describe('expandCollapsePanel', () => {
        it('should toggle expanded when collapsible', () => {
            wmComponent.collapsible = true;
            wmComponent.expanded = false;
            wmComponent.expandCollapsePanel();
            expect(wmComponent.expanded).toBe(true);
        });

        it('should not toggle expanded when not collapsible', () => {
            wmComponent.collapsible = false;
            wmComponent.expanded = false;
            wmComponent.expandCollapsePanel();
            expect(wmComponent.expanded).toBe(false);
        });
    });

    describe('onDataSourceUpdate', () => {
        beforeEach(() => {
            wmComponent.new = jest.fn();
            wmComponent.setFormData = jest.fn();
            wmComponent.closeDialog = jest.fn();
        });

        it('should call new when newForm is true', () => {
            wmComponent.onDataSourceUpdate({}, true, undefined);
            expect(wmComponent.new).toHaveBeenCalled();
            expect(wmComponent.isUpdateMode).toBe(true);
        });

        it('should set form data and close dialog when newForm is false', () => {
            const response = { data: 'testData' };
            wmComponent.onDataSourceUpdate(response, false, undefined);
            expect(wmComponent.setFormData).toHaveBeenCalledWith(response);
            expect(wmComponent.closeDialog).toHaveBeenCalled();
            expect(wmComponent.isUpdateMode).toBe(true);
        });

        it('should set isUpdateMode to provided value', () => {
            wmComponent.onDataSourceUpdate({}, false, false);
            expect(wmComponent.isUpdateMode).toBe(false);
        });
    });

    describe('getNearestParentFormData', () => {
        let mockForm;
        beforeEach(() => {
            mockForm = {
                parentForm: {
                    formdata: { data: 'parentData' }
                },
                bindformdata: false
            };
        });

        it('should return empty object when there is no parent form', () => {
            delete mockForm.parentForm;
            expect(wmComponent.getNearestParentFormData(mockForm)).toEqual({});
        });

        it('should return parent form data when conditions are met', () => {
            expect(wmComponent.getNearestParentFormData(mockForm)).toEqual({ data: 'parentData' });
        });

        it('should recursively call itself when conditions are not met', () => {
            mockForm.bindformdata = true;
            const spy = jest.spyOn(wmComponent, 'getNearestParentFormData');
            wmComponent.getNearestParentFormData(mockForm);
            expect(spy).toHaveBeenCalledTimes(2);
        });
    });

    describe('submitForm', () => {
        let mockEvent;
        let mockDataSource;

        beforeEach(() => {
            mockEvent = { preventDefault: jest.fn() };
            mockDataSource = {
                pagination: { number: 0 },
                category: '',
                execute: jest.fn()
            };

            wmComponent.validateFieldsOnSubmit = jest.fn().mockReturnValue(false);
            wmComponent.constructDataObject = jest.fn().mockReturnValue({ field: 'value' });
            wmComponent.resetFormState = jest.fn();
            wmComponent.invokeEventCallback = jest.fn();
            (wmComponent as any).triggerWMEvent = jest.fn();
            wmComponent.closeDialog = jest.fn();
            wmComponent.toggleMessage = jest.fn();
            wmComponent.onResultCb = jest.fn();

        });

        it('should return early if validateFieldsOnSubmit returns true', () => {
            (wmComponent as any).validateFieldsOnSubmit.mockReturnValue(true);
            wmComponent.submitForm(mockEvent);
            expect(wmComponent.resetFormState).not.toHaveBeenCalled();
        });

        it('should call onBeforeSubmitEvt if defined', () => {
            wmComponent.onBeforeSubmitEvt = true;
            (wmComponent as any).invokeEventCallback.mockReturnValue(true);
            wmComponent.submitForm(mockEvent);
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('beforesubmit', expect.any(Object));
            expect(wmComponent.resetFormState).toHaveBeenCalled();
        });

        it('should return early if onBeforeSubmitEvt returns false', () => {
            wmComponent.onBeforeSubmitEvt = true;
            (wmComponent as any).invokeEventCallback.mockReturnValue(false);
            wmComponent.submitForm(mockEvent);
            expect(wmComponent.resetFormState).not.toHaveBeenCalled();
        });

        it('should call performDataOperation if dataSource is defined', async () => {
            wmComponent.datasource = mockDataSource;
            (wmComponent as any).operationType = 'update';
            (performDataOperation as jest.Mock).mockResolvedValue({ body: '{"success": true}' });
            (getValidJSON as jest.Mock).mockReturnValue({ success: true });

            await wmComponent.submitForm(mockEvent);

            expect(performDataOperation).toHaveBeenCalledWith(
                mockDataSource,
                { field: 'value' },
                { operationType: 'update' }
            );
            expect(wmComponent.onResultCb).toHaveBeenCalled();
        });

        it('should handle CrudVariable dataSource', async () => {
            wmComponent.datasource = { ...mockDataSource, category: 'wm.CrudVariable' };
            wmComponent.dialogId = 'testDialog';
            (performDataOperation as jest.Mock).mockResolvedValue({ body: '{"success": true}' });
            (getValidJSON as jest.Mock).mockReturnValue({ success: true });

            await wmComponent.submitForm(mockEvent);

            expect((wmComponent as any).triggerWMEvent).toHaveBeenCalledWith('resetEditMode');
            expect(wmComponent.datasource.execute).toHaveBeenCalled();
            expect(wmComponent.closeDialog).toHaveBeenCalled();
        });

        it('should handle error in performDataOperation', async () => {
            wmComponent.datasource = mockDataSource;
            wmComponent.errormessage = 'Custom error message';
            (performDataOperation as jest.Mock).mockRejectedValue({ error: 'Test error' });

            await wmComponent.submitForm(mockEvent);

            expect(wmComponent.onResultCb).toHaveBeenCalled();
        });

        it('should call onSubmitEvt if defined and no dataSource', () => {
            wmComponent.onSubmitEvt = true;
            wmComponent.submitForm(mockEvent);
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('submit', expect.any(Object));
            expect(wmComponent.onResultCb).toHaveBeenCalledWith({}, true, mockEvent);
        });

        it('should call onResultCb even if no onSubmitEvt and no dataSource', () => {
            wmComponent.submitForm(mockEvent);
            expect(wmComponent.onResultCb).toHaveBeenCalledWith({}, true, mockEvent);
        });
    });

    describe('setFormDataFromParentFormData', () => {
        beforeEach(() => {
            (wmComponent as any).parentForm = {};
            wmComponent.setFormData = jest.fn();
            wmComponent.formdata = {};
            (wmComponent as any).bindformdata = false;
        });

        it('should set form data when not inside a list', () => {
            const mockFormData = { field: 'value' };
            wmComponent.setFormDataFromParentFormData(mockFormData);

            expect(wmComponent.setFormData).toHaveBeenCalledWith(mockFormData);
        });

        it('should handle form inside a list', () => {
            Object.defineProperty(wmComponent, 'parentFormArray', { value: { patchValue: jest.fn() } });
            (wmComponent as any).parentList = { name: 'listName' };
            (wmComponent as any).formArrayIndex = 0;

            const mockFormData = { listName: [{ field: 'value' }] };
            wmComponent.setFormDataFromParentFormData(mockFormData);

            expect(wmComponent.parentFormArray.patchValue).toHaveBeenCalledWith([{ field: 'value' }]);
            expect(wmComponent.formdata).toEqual({ field: 'value' });
            expect(wmComponent.setFormData).toHaveBeenCalledWith({ field: 'value' });
        });

        it('should handle form inside a list with non-array data', () => {
            Object.defineProperty(wmComponent, 'parentFormArray', { value: { patchValue: jest.fn() } });
            (wmComponent as any).parentList = { name: 'listName' };
            (wmComponent as any).formArrayIndex = 0;

            const mockFormData = { listName: { field: 'value' } };
            wmComponent.setFormDataFromParentFormData(mockFormData);

            expect(wmComponent.parentFormArray.patchValue).toHaveBeenCalledWith([{ field: 'value' }]);
            expect(wmComponent.formdata).toEqual({ field: 'value' });
            expect(wmComponent.setFormData).toHaveBeenCalledWith({ field: 'value' });
        });
    });

    describe('prepareValidationObj', () => {
        beforeEach(() => {
            (wmComponent as any).validationMessages = [];
        });

        it('should add a new validation message for an invalid field', () => {
            const v = { invalid: true, errors: { required: true } };
            const k = 'testField';
            const field = {
                value: 'testValue',
                validationmessage: 'Test validation message',
                $element: { find: jest.fn().mockReturnValue('mockElement') }
            };
            const prefix = 'testForm';

            wmComponent['prepareValidationObj'](v, k, field, prefix);

            expect((wmComponent as any).validationMessages).toHaveLength(1);
            expect((wmComponent as any).validationMessages[0]).toEqual({
                field: 'testField',
                value: 'testValue',
                errorType: ['required'],
                message: 'Test validation message',
                getElement: expect.any(Function),
                formName: 'testForm',
                fullyQualifiedFormName: 'testForm'
            });
            expect((wmComponent as any).validationMessages[0].getElement()).toBe('mockElement');
        });

        it('should update an existing validation message for an invalid field', () => {
            (wmComponent as any).validationMessages = [{
                field: 'testField',
                fullyQualifiedFormName: 'testForm',
                value: 'oldValue',
                errorType: ['required']
            }];

            const v = { invalid: true, errors: { minlength: true } };
            const k = 'testField';
            const field = { value: 'newValue' };
            const prefix = 'testForm';

            wmComponent['prepareValidationObj'](v, k, field, prefix);

            expect((wmComponent as any).validationMessages).toHaveLength(1);
            expect((wmComponent as any).validationMessages[0].value).toBe('newValue');
            expect((wmComponent as any).validationMessages[0].errorType).toEqual(['minlength']);
        });

        it('should remove validation message for a valid field', () => {
            (wmComponent as any).validationMessages = [{
                field: 'testField',
                fullyQualifiedFormName: 'testForm',
                value: 'testValue',
                errorType: ['required']
            }];

            const v = { valid: true, invalid: false };
            const k = 'testField';
            const field = { value: 'testValue' };
            const prefix = 'testForm';

            wmComponent['prepareValidationObj'](v, k, field, prefix);

            expect((wmComponent as any).validationMessages).toHaveLength(0);
        });

        it('should handle nested form names', () => {
            const v = { invalid: true, errors: { required: true } };
            const k = 'testField';
            const field = {
                value: 'testValue',
                validationmessage: 'Test validation message',
                $element: { find: jest.fn().mockReturnValue('mockElement') }
            };
            const prefix = 'parentForm.childForm';

            wmComponent['prepareValidationObj'](v, k, field, prefix);

            expect((wmComponent as any).validationMessages[0].formName).toBe('childForm');
            expect((wmComponent as any).validationMessages[0].fullyQualifiedFormName).toBe('parentForm.childForm');
        });

        it('should not add or update validation message for a valid field', () => {
            const v = { valid: true, invalid: false };
            const k = 'testField';
            const field = { value: 'testValue' };
            const prefix = 'testForm';
            wmComponent['prepareValidationObj'](v, k, field, prefix);
            expect((wmComponent as any).validationMessages).toHaveLength(0);
        });
    });

    describe('generateFormFields', () => {
        let mockGridLayout;
        let mockDynamicFormRef;
        let mockDynamicComponentProvider;
        let mockComponentRef;

        beforeEach(() => {
            mockGridLayout = {
                length: 1,
                attr: jest.fn().mockReturnValue('2'),
                appendChild: jest.fn(),
                0: { appendChild: jest.fn() } // Add this line
            };
            mockComponentRef = {
                instance: {},
                location: {
                    nativeElement: document.createElement('div')
                }
            };
            mockDynamicFormRef = {
                clear: jest.fn(),
                createComponent: jest.fn().mockReturnValue(mockComponentRef)
            };
            mockDynamicComponentProvider = {
                getComponentFactoryRef: jest.fn().mockResolvedValue({})
            };
            Object.defineProperty(wmComponent, '$element', {
                value: {
                    find: jest.fn().mockReturnValue({
                        length: 1,
                        first: jest.fn().mockReturnValue(mockGridLayout),
                        prepend: jest.fn()
                    })
                }
            });
            wmComponent.dynamicFormRef = mockDynamicFormRef;
            (wmComponent as any).dynamicComponentProvider = mockDynamicComponentProvider;
            wmComponent.metadata = {
                data: [
                    { field: 'value1', widgetType: 'text' },
                    { field: 'value2', widgetType: 'number' }
                ]
            };
            Object.defineProperty(wmComponent, 'widgetId', { value: 'testWidget' });
            Object.defineProperty(wmComponent, 'viewParent', { value: {} });
            (wmComponent as any).inj = {};
            wmComponent.setFormData = jest.fn();

            (extendProto as jest.Mock) = jest.fn();
        });

        it('should generate form fields from metadata', async () => {
            await wmComponent.generateFormFields();

            expect(wmComponent.formFields).toEqual([]);
            expect(mockDynamicFormRef.clear).toHaveBeenCalled();
            expect(mockDynamicComponentProvider.getComponentFactoryRef).toHaveBeenCalledWith(
                'app-form-dynamic-testWidget',
                expect.stringContaining('<wm-gridrow>'),
                expect.any(Object)
            );
            expect(mockDynamicFormRef.createComponent).toHaveBeenCalled();
            expect(mockGridLayout[0].appendChild).toHaveBeenCalledWith(mockComponentRef.location.nativeElement);
            expect(extendProto).toHaveBeenCalled();
            expect(wmComponent.setFormData).toHaveBeenCalledWith(wmComponent.formdata);
        });

        it('should handle onBeforeRenderEvt', async () => {
            wmComponent.onBeforeRenderEvt = true;
            wmComponent.invokeEventCallback = jest.fn().mockReturnValue([
                { field: 'newValue', widgetType: 'text' }
            ]);

            await wmComponent.generateFormFields();

            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('beforerender', expect.any(Object));
            expect(mockDynamicComponentProvider.getComponentFactoryRef).toHaveBeenCalledWith(
                expect.any(String),
                expect.stringContaining('wm-gridrow'),
                expect.any(Object)
            );
        });

        it('should return early if fields are empty', async () => {
            wmComponent.metadata = { data: [] };

            await wmComponent.generateFormFields();

            expect(mockDynamicComponentProvider.getComponentFactoryRef).not.toHaveBeenCalled();
        });

        it('should return early if fields are not an array', async () => {
            wmComponent.metadata = { data: 'not an array' };

            await wmComponent.generateFormFields();

            expect(mockDynamicComponentProvider.getComponentFactoryRef).not.toHaveBeenCalled();
        });

        it('should create dynamic context if not present', async () => {
            (wmComponent as any)._dynamicContext = undefined;

            await wmComponent.generateFormFields();

            expect((wmComponent as any)._dynamicContext).toBeDefined();
            expect((wmComponent as any)._dynamicContext.form).toBe(wmComponent);
        });
    });
});
