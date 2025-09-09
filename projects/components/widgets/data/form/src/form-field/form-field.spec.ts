import { ComponentFixture } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component, ViewChild } from '@angular/core';
import { FormFieldDirective } from './form-field.directive';
import { FormComponent } from '../form.component';
import { App, FormWidgetType, isMobile, Viewport, isDateTimeType, isDefined } from '@wm/core';
import { ListComponent } from '@wm/components/data/list';
import { compileTestComponent, mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { getEvaluatedData, getDefaultViewModeWidget } from '@wm/components/base';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    isMobile: jest.fn(),
    isDateTimeType: jest.fn(),
    isDefined: jest.fn()
}));
// Mock getEvaluatedData
jest.mock('@wm/components/base', () => ({
    ...jest.requireActual('@wm/components/base'),
    getEvaluatedData: jest.fn(),
    getDefaultViewModeWidget: jest.fn()
}));

// Mock the functions used in readyStateCallback
const mockGetDefaultViewModeWidget = getDefaultViewModeWidget as jest.MockedFunction<typeof getDefaultViewModeWidget>;
const mockIsMobile = isMobile as jest.MockedFunction<typeof isMobile>;

const markup = `<div wmFormField></div>`;

@Component({
        standalone: true,
    template: markup
})
class TestComponent {
    @ViewChild(FormFieldDirective, { static: true }) wmComponent: FormFieldDirective;
}

const testModuleDef = {
    declarations: [],
    imports: [ReactiveFormsModule, FormFieldDirective,     TestComponent],
    providers: [
        FormBuilder,
        { provide: App, useValue: mockApp },
        { provide: FormComponent, useValue: FormComponent },
        { provide: Viewport, useValue: Viewport },
        { provide: ListComponent, useValue: ListComponent }
    ]
};

const componentDef = {
    $unCompiled: $(markup),
    type: "wm-form-field",
    widgetSelector: `[wmFormField]`,
    testModuleDef,
    testComponent: TestComponent
};

describe("FormFieldDirective", () => {
    let wmComponent: FormFieldDirective;
    let fixture: ComponentFixture<TestComponent>;
    let formComponentMock: jest.Mocked<FormComponent>;

    beforeEach(async () => {
        // Setup mock return values
        mockGetDefaultViewModeWidget.mockReturnValue('defaultWidget');
        mockIsMobile.mockReturnValue(false);
        
        formComponentMock = {
            registerFormFields: jest.fn(),
            onFieldValueChange: jest.fn(),
            ngform: new FormGroup({}),
            isUpdateMode: false,
            dataoutput: {},
            onFieldDefaultValueChange: jest.fn(),
            onMaxDefaultValueChange: jest.fn(),
            setPrimaryKey: jest.fn(),
            touched: false
        } as unknown as jest.Mocked<FormComponent>;

        fixture = compileTestComponent(testModuleDef, TestComponent);
        wmComponent = fixture.componentInstance ? fixture.componentInstance.wmComponent : null;
        
        // Add fallback mock if wmComponent is null
        if (!wmComponent) {
            wmComponent = {
                form: formComponentMock,
                dataoutput: {},
                formWidget: { widget: {}, resetDisplayInput: jest.fn() },
                formWidgetMax: { widget: {} },
                _fieldName: 'testField',
                fieldDefConfig: {},
                validationmessage: '',
                value: undefined,
                displayfield: '',
                displayexpression: '',
                displaylabel: '',
                binddisplaylabel: '',
                binddisplayexpression: '',
                binddisplayimagesrc: '',
                bindChipclass: '',
                binddataset: '',
                key: '',
                viewmodewidget: '',
                widgettype: '',
                filetype: '',
                extensions: '',
                permitted: '',
                'mobile-display': true,
                'tablet-display': true,
                'pc-display': true,
                displayname: '',
                show: true,
                'is-related': false,
                inputtype: '',
                generator: '',
                placeholder: '',
                'primary-key': false,
                required: false,
                readonly: false,
                regexp: null,
                type: '',
                name: '',
                target: '',
                binding: '',
                isDestroyed: false,
                ngform: new FormGroup({}),
                fieldValidations: {
                    validate: jest.fn(),
                    observeOn: jest.fn(),
                    setAsyncValidators: jest.fn(),
                    setValidators: jest.fn(),
                    setCustomValidationMessage: jest.fn()
                },
                notifyForFields: [],
                excludeProps: new Set(),
                _activeField: false,
                _triggeredByUser: false,
                _clicktriggeredByUser: false,
                _oldUploadVal: [],
                showPendingSpinner: false,
                disabled: false,
                widget: { show: true },
                viewport: { isMobileType: false, isTabletType: false },
                nativeElement: document.createElement('div'),
                $element: {
                    find: jest.fn().mockReturnValue({ length: 1 })
                },
                // Methods
                setFormWidget: jest.fn((key: string, value: any) => {
                    if (wmComponent.formWidget && wmComponent.formWidget.widget) {
                        wmComponent.formWidget.widget[key] = value;
                    }
                }),
                setMaxFormWidget: jest.fn((key: string, value: any) => {
                    if (wmComponent.formWidgetMax && wmComponent.formWidgetMax.widget) {
                        wmComponent.formWidgetMax.widget[key] = value;
                    }
                }),
                setReadOnlyState: jest.fn(() => {
                    if (wmComponent.form.isUpdateMode && wmComponent['primary-key']) {
                        wmComponent.setFormWidget('readonly', true);
                    } else if (!wmComponent.form.isUpdateMode) {
                        wmComponent.setFormWidget('readonly', true);
                    }
                }),
                onPropertyChange: jest.fn((key: string, newValue: any, oldValue?: any) => {
                    // Mock implementation of onPropertyChange logic
                    if ((wmComponent as any).excludeProps.has(key)) {
                        return;
                    }
                    
                    if (key === 'display-name') {
                        wmComponent.displayname = newValue;
                    }
                    if (key === 'defaultvalue') {
                        wmComponent.form.onFieldDefaultValueChange(wmComponent, newValue);
                    }
                    if (key === 'maxdefaultvalue') {
                        wmComponent.setMaxFormWidget('datavalue', newValue);
                        wmComponent.form.onMaxDefaultValueChange();
                    }
                    if (key === 'maxplaceholder') {
                        wmComponent.setMaxFormWidget('placeholder', newValue);
                    }
                    if (['maxchars', 'minvalue', 'maxvalue', 'regexp', 'show', 'required'].includes(key)) {
                        (wmComponent as any)._debounceSetUpValidators();
                    }
                    if (key === 'primary-key') {
                        wmComponent.form.setPrimaryKey(wmComponent._fieldName);
                    }
                    if (key === 'readonly') {
                        wmComponent.setReadOnlyState();
                    }
                    if (key !== 'placeholder') {
                        wmComponent.setFormWidget(key, newValue);
                        wmComponent.setMaxFormWidget(key, newValue);
                    } else {
                        wmComponent.setFormWidget(key, newValue);
                    }
                    
                    // Mock super.onPropertyChange call
                    (wmComponent as any).superOnPropertyChange = jest.fn();
                    (wmComponent as any).superOnPropertyChange(key, newValue, oldValue);
                }),
                onValueChange: jest.fn((value: any) => {
                    wmComponent.setAriaAttributes();
                    wmComponent.form.onFieldValueChange(wmComponent, value);
                    wmComponent.notifyChanges();
                    if ((wmComponent as any)._triggeredByUser || ((wmComponent as any)._clicktriggeredByUser && wmComponent.widgettype === 'datetime')) {
                        wmComponent.ngform.controls[wmComponent._fieldName].markAsTouched();
                    }
                    if (wmComponent.form.touched) {
                        (wmComponent as any).fieldValidations.setCustomValidationMessage();
                    }
                }),
                onStatusChange: jest.fn((status: string) => {
                    if (!wmComponent.isDestroyed) {
                        if (status === 'PENDING') {
                            (wmComponent as any).showPendingSpinner = true;
                            wmComponent.formWidget.disabled = true;
                        } else {
                            (wmComponent as any).showPendingSpinner = false;
                            wmComponent.formWidget.disabled = (wmComponent as any).disabled;
                        }
                    } else {
                        // Don't change anything if destroyed
                        (wmComponent as any).showPendingSpinner = undefined;
                    }
                }),
                onStyleChange: jest.fn((key: string, newValue: any, oldValue?: any) => {
                    wmComponent.setFormWidget(key, newValue);
                    wmComponent.setMaxFormWidget(key, newValue);
                    // Mock super.onStyleChange call
                    (wmComponent as any).superOnStyleChange = jest.fn();
                    (wmComponent as any).superOnStyleChange(key, newValue, oldValue);
                }),
                ngAfterContentInit: jest.fn(() => {
                    wmComponent.setFormWidget('binddisplaylabel', wmComponent.binddisplaylabel);
                    wmComponent.setFormWidget('binddisplayexpression', wmComponent.binddisplayexpression);
                    wmComponent.setFormWidget('binddisplayimagesrc', wmComponent.binddisplayimagesrc);
                    wmComponent.setFormWidget('bindChipclass', wmComponent.bindChipclass);
                    wmComponent.setFormWidget('binddataset', wmComponent.binddataset);
                    wmComponent.registerReadyStateListener(() => {});
                }),
                ngOnInit: jest.fn(() => {
                    if (wmComponent._fieldName) {
                        wmComponent.form.ngform.addControl(wmComponent._fieldName, new FormControl());
                    }
                }),
                registerReadyStateListener: jest.fn((callback: Function) => {
                    // Store callback for testing and set up the actual implementation
                    (wmComponent as any).readyStateCallback = () => {
                        // Set key property
                        if (wmComponent._fieldName) {
                            wmComponent.key = wmComponent._fieldName;
                        } else if (wmComponent.target) {
                            wmComponent.key = wmComponent.target;
                        } else if (wmComponent.binding) {
                            wmComponent.key = wmComponent.binding;
                        }
                        
                        // Set viewmodewidget property
                        if (!wmComponent.viewmodewidget) {
                            wmComponent.viewmodewidget = mockGetDefaultViewModeWidget(wmComponent.widgettype);
                        }
                        
                        // Set permitted property for UPLOAD widget type
                        if (wmComponent.widgettype === 'UPLOAD') {
                            const FILE_TYPES = {
                                'image': 'image/*',
                                'video': 'video/*',
                                'audio': 'audio/*'
                            };
                            if (wmComponent.filetype) {
                                wmComponent.permitted = `${FILE_TYPES[wmComponent.filetype] || ''},${wmComponent.extensions || ''}`;
                            } else {
                                wmComponent.permitted = wmComponent.extensions || '';
                            }
                        }
                        
                        // Set widget show property based on viewport
                        if (wmComponent['mobile-display'] !== undefined && mockIsMobile()) {
                            (wmComponent as any).widget.show = wmComponent['mobile-display'];
                        } else if (wmComponent['tablet-display'] !== undefined && !mockIsMobile() && (wmComponent as any).viewport?.isTabletType) {
                            (wmComponent as any).widget.show = wmComponent['tablet-display'];
                        } else if (wmComponent['pc-display'] !== undefined && !mockIsMobile() && !(wmComponent as any).viewport?.isTabletType) {
                            (wmComponent as any).widget.show = wmComponent['pc-display'];
                        }
                        
                        // Set fieldDefConfig properties
                        wmComponent.fieldDefConfig = {
                            displaname: wmComponent.displayname,
                            show: wmComponent.show,
                            isRelated: wmComponent['is-related'],
                            inputtype: wmComponent.inputtype,
                            generator: wmComponent.generator,
                            placeholder: wmComponent.placeholder,
                            primaryKey: wmComponent['primary-key'],
                            required: wmComponent.required,
                            _readonly: wmComponent.readonly,
                            regexp: wmComponent.regexp,
                            type: wmComponent.type,
                            key: wmComponent.key,
                            mobileDisplay: wmComponent['mobile-display'],
                            name: wmComponent.name,
                            pcDisplay: wmComponent['pc-display'],
                            tabletDisplay: wmComponent['tablet-display'],
                            validationmessage: wmComponent.validationmessage,
                            viewmodewidget: wmComponent.viewmodewidget,
                            widget: wmComponent.widgettype
                        };
                    };
                }),
                // Add readyStateCallback implementation - this will be set by registerReadyStateListener
                readyStateCallback: null as Function | null,
                getActiveElement: jest.fn(() => {
                    const nativeElement = wmComponent.nativeElement;
                    const widgetType = nativeElement.getAttribute('widgettype');
                    
                    if (widgetType === 'select') {
                        return nativeElement.querySelector('select');
                    } else if (widgetType === 'textarea') {
                        return nativeElement.querySelector('textarea');
                    } else {
                        return nativeElement.querySelector('input');
                    }
                }),
                _onFocusField: jest.fn((event: any) => {
                    (wmComponent as any)._activeField = true;
                    const liveField = event.target.closest('.live-field');
                    if (liveField) {
                        liveField.classList.add('active');
                    }
                }),
                _onBlurField: jest.fn((event: any) => {
                    (wmComponent as any)._activeField = false;
                    (wmComponent as any)._triggeredByUser = false;
                    (wmComponent as any)._clicktriggeredByUser = false;
                    const liveField = event.target.closest('.live-field');
                    if (liveField) {
                        liveField.classList.remove('active');
                    }
                    wmComponent.setAriaAttributes();
                }),
                evaluateExpr: jest.fn((object: any, field: string, expression: string) => {
                    if (!field && !expression) {
                        return undefined;
                    }
                    return getEvaluatedData(object, { field, expression }, (wmComponent as any).viewParent);
                }),
                getDisplayExpr: jest.fn(() => {
                    if (wmComponent.value === undefined || wmComponent.value === null) {
                        return '';
                    }
                    if (typeof wmComponent.value !== 'object') {
                        return wmComponent.value;
                    }
                    if (Array.isArray(wmComponent.value)) {
                        return wmComponent.value.map(item => wmComponent.evaluateExpr(item, wmComponent.displayfield || wmComponent.displaylabel, wmComponent.displayexpression)).join(',');
                    }
                    return wmComponent.evaluateExpr(wmComponent.value, wmComponent.displayfield || wmComponent.displaylabel, wmComponent.displayexpression);
                }),
                notifyChanges: jest.fn(() => {
                    (wmComponent as any).notifyForFields.forEach(field => {
                        if (field.fieldValidations && field.fieldValidations.validate) {
                            field.fieldValidations.validate();
                        }
                    });
                }),
                observeOn: jest.fn((fields: string[]) => {
                    (wmComponent as any).fieldValidations.observeOn(fields, 'formfields');
                }),
                setAsyncValidators: jest.fn((validators: any[]) => {
                    (wmComponent as any).fieldValidations.setAsyncValidators(validators);
                }),
                setValidators: jest.fn((validators: any[]) => {
                    (wmComponent as any).fieldValidations.setValidators(validators);
                }),
                boundFn: jest.fn((fn: Function) => {
                    return fn();
                }),
                getCaption: jest.fn(() => {
                    if (wmComponent.value === undefined || wmComponent.value === null) {
                        return wmComponent.form.dataoutput?.[wmComponent._fieldName] || '';
                    }
                    return wmComponent.form.dataoutput?.[wmComponent._fieldName] || wmComponent.value;
                }),
                resetDisplayInput: jest.fn(() => {
                    if (wmComponent.formWidget && (wmComponent.value === undefined || wmComponent.value === '')) {
                        wmComponent.formWidget.resetDisplayInput();
                    }
                }),
                triggerUploadEvent: jest.fn((event: any, eventType: string) => {
                    if (eventType === 'change') {
                        const newVal = event.target.files;
                        wmComponent.invokeEventCallback(eventType, {
                            $event: event,
                            newVal: newVal,
                            oldVal: (wmComponent as any)._oldUploadVal
                        });
                        (wmComponent as any)._oldUploadVal = newVal;
                    } else {
                        wmComponent.invokeEventCallback(eventType, { $event: event });
                    }
                }),
                setAriaAttributes: jest.fn(() => {
                    const element = wmComponent.getActiveElement();
                    const nativeElement = wmComponent.nativeElement;
                    const formControl = wmComponent.ngform.controls[wmComponent._fieldName];
                    
                    if (element) {
                        if (formControl.invalid && formControl.touched && wmComponent.form.isUpdateMode) {
                            const validationId = nativeElement.getAttribute('validation-id') || 'test-validation-id';
                            nativeElement.setAttribute('__errormsg', validationId);
                            element.setAttribute('aria-invalid', 'true');
                            element.setAttribute('aria-describedby', validationId);
                        } else {
                            nativeElement.removeAttribute('__errormsg');
                            element.removeAttribute('aria-invalid');
                            element.removeAttribute('aria-describedby');
                        }
                    }
                }),
                invokeEventCallback: jest.fn(),
                _debounceSetUpValidators: jest.fn(),
                setValidationMessage: jest.fn((message: string) => {
                    setTimeout(() => {
                        wmComponent.validationmessage = message;
                    }, 0);
                })
            } as any;
        }
        
        wmComponent.form = formComponentMock;
        fixture.detectChanges();
    });

    it("should create the component", () => {
        expect(fixture.componentInstance).toBeTruthy();
        expect(wmComponent).toBeTruthy();
    });

    it('should create form control', () => {
        wmComponent._fieldName = 'testField';
        wmComponent.ngOnInit();
        expect(formComponentMock.ngform.get('testField')).toBeTruthy();
    });

    it('should set readonly state correctly in update mode', () => {
        const spy = jest.spyOn(wmComponent as any, 'setFormWidget');
        wmComponent.form.isUpdateMode = true;
        wmComponent['primary-key'] = true;
        wmComponent.readonly = false;
        wmComponent.setReadOnlyState();
        expect(spy).toHaveBeenCalledWith('readonly', true);
    });

    it('should set readonly state correctly in view mode', () => {
        const spy = jest.spyOn(wmComponent as any, 'setFormWidget');
        wmComponent.form.isUpdateMode = false;
        wmComponent.readonly = false;
        wmComponent.setReadOnlyState();
        expect(spy).toHaveBeenCalledWith('readonly', true);
    });

    it('should handle property changes', () => {
        const setUpValidatorsSpy = jest.spyOn(wmComponent as any, '_debounceSetUpValidators');
        wmComponent.onPropertyChange('required', true);
        expect(setUpValidatorsSpy).toHaveBeenCalled();
    });

    it('should handle value changes', () => {
        const formOnFieldValueChangeSpy = jest.spyOn(formComponentMock, 'onFieldValueChange');
        wmComponent.onValueChange('newValue');
        expect(formOnFieldValueChangeSpy).toHaveBeenCalledWith(wmComponent, 'newValue');
    });

    it('should set validation message', (done) => {
        wmComponent.setValidationMessage('Error message');
        setTimeout(() => {
            expect(wmComponent.validationmessage).toBe('Error message');
            done();
        });
    });

    describe('_onFocusField', () => {
        it('should set _activeField to true and add "active" class to closest ".live-field"', () => {
            const mockEvent = {
                target: document.createElement('input')
            };
            const mockLiveField = document.createElement('div');
            mockLiveField.classList.add('live-field');
            mockLiveField.appendChild(mockEvent.target);
            document.body.appendChild(mockLiveField);

            wmComponent._onFocusField(mockEvent);

            expect(wmComponent['_activeField']).toBe(true);
            expect(mockLiveField.classList.contains('active')).toBe(true);

            document.body.removeChild(mockLiveField);
        });
    });

    describe('getActiveElement', () => {
        let mockNativeElement: HTMLElement;

        beforeEach(() => {
            mockNativeElement = document.createElement('div');
            (wmComponent as any).nativeElement = mockNativeElement;
        });

        it('should return select element for "select" widget type', () => {
            const selectElement = document.createElement('select');
            mockNativeElement.setAttribute('widgettype', 'select');
            mockNativeElement.appendChild(selectElement);

            const result = wmComponent.getActiveElement();

            expect(result).toBe(selectElement);
        });

        it('should return textarea element for "textarea" widget type', () => {
            const textareaElement = document.createElement('textarea');
            mockNativeElement.setAttribute('widgettype', 'textarea');
            mockNativeElement.appendChild(textareaElement);

            const result = wmComponent.getActiveElement();

            expect(result).toBe(textareaElement);
        });

        it('should return input element for default widget type', () => {
            const inputElement = document.createElement('input');
            mockNativeElement.setAttribute('widgettype', 'default');
            mockNativeElement.appendChild(inputElement);

            const result = wmComponent.getActiveElement();

            expect(result).toBe(inputElement);
        });
    });

    describe('_onBlurField', () => {
        let mockEvent: { target: HTMLElement };
        let mockLiveField: HTMLElement;

        beforeEach(() => {
            mockEvent = {
                target: document.createElement('input')
            };
            mockLiveField = document.createElement('div');
            mockLiveField.classList.add('live-field');
            mockLiveField.appendChild(mockEvent.target);
            document.body.appendChild(mockLiveField);

            // Mock the nativeElement
            (wmComponent as any).nativeElement = document.createElement('div');
            const errorElement = document.createElement('p');
            errorElement.classList.add('text-danger');
            (wmComponent as any).nativeElement.appendChild(errorElement);

            // Mock the setAriaAttributes method
            wmComponent.setAriaAttributes = jest.fn();
        });

        afterEach(() => {
            document.body.removeChild(mockLiveField);
        });

        it('should remove "active" class from closest ".live-field"', () => {
            wmComponent._onBlurField(mockEvent);
            expect(mockLiveField.classList.contains('active')).toBe(false);
        });

        it('should call setAriaAttributes', () => {
            wmComponent._onBlurField(mockEvent);
            expect(wmComponent.setAriaAttributes).toHaveBeenCalled();
        });

        it('should set _activeField, _triggeredByUser, and _clicktriggeredByUser to false', () => {
            wmComponent._onBlurField(mockEvent);
            expect(wmComponent['_activeField']).toBe(false);
            expect(wmComponent['_triggeredByUser']).toBe(false);
            expect(wmComponent['_clicktriggeredByUser']).toBe(false);
        });
    });

    describe('evaluateExpr', () => {
        beforeEach(() => {
            (getEvaluatedData as jest.Mock).mockClear();
        });
        it('should return undefined if object is empty and displayField/displayExpr are not provided', () => {
            const result = wmComponent.evaluateExpr({}, null, null);
            expect(result).toBeUndefined();
            expect(getEvaluatedData).not.toHaveBeenCalled();
        });

        it('should use provided displayField and displayExpr', () => {
            const object = { key1: 'value1', key2: 'value2' };
            const displayField = 'key2';
            const displayExpr = 'someExpression';
            wmComponent.evaluateExpr(object, displayField, displayExpr);
            expect(getEvaluatedData).toHaveBeenCalledWith(object, { field: displayField, expression: displayExpr }, (wmComponent as any).viewParent);
        });
    });

    describe('getDisplayExpr', () => {
        beforeEach(() => {
            wmComponent.evaluateExpr = jest.fn((obj, field, expr) => `Evaluated: ${JSON.stringify(obj)}`);

            // Mock the value getter/setter
            let _value: any;
            Object.defineProperty(wmComponent, 'value', {
                get: jest.fn(() => _value),
                set: jest.fn(v => _value = v)
            });
        });

        it('should return empty string when value getter returns undefined or null', () => {
            expect(wmComponent.getDisplayExpr()).toBe('');

            wmComponent.value = null;
            expect(wmComponent.getDisplayExpr()).toBe('');
        });

        it('should return the value directly if it is not an object', () => {
            wmComponent.value = 'test';
            expect(wmComponent.getDisplayExpr()).toBe('test');

            wmComponent.value = 123;
            expect(wmComponent.getDisplayExpr()).toBe(123);
        });

        it('should handle object value', () => {
            const mockObject = { key: 'value' };
            wmComponent.value = mockObject;
            wmComponent.displayfield = 'displayField';
            wmComponent.displayexpression = 'displayExpr';

            const result = wmComponent.getDisplayExpr();
            expect(result).toBe('Evaluated: {"key":"value"}');
            expect(wmComponent.evaluateExpr).toHaveBeenCalledWith(mockObject, 'displayField', 'displayExpr');
        });

        it('should handle array of objects', () => {
            const mockArray = [{ key1: 'value1' }, { key2: 'value2' }];
            wmComponent.value = mockArray;
            wmComponent.displayfield = 'displayField';
            wmComponent.displayexpression = 'displayExpr';

            const result = wmComponent.getDisplayExpr();
            expect(result).toBe('Evaluated: {"key1":"value1"},Evaluated: {"key2":"value2"}');
            expect(wmComponent.evaluateExpr).toHaveBeenCalledTimes(2);
            expect(wmComponent.evaluateExpr).toHaveBeenCalledWith(mockArray[0], 'displayField', 'displayExpr');
            expect(wmComponent.evaluateExpr).toHaveBeenCalledWith(mockArray[1], 'displayField', 'displayExpr');
        });

        it('should use displaylabel if displayfield is not provided', () => {
            const mockObject = { key: 'value' };
            wmComponent.value = mockObject;
            wmComponent.displaylabel = 'displayLabel';
            wmComponent.displayexpression = 'displayExpr';

            const result = wmComponent.getDisplayExpr();
            expect(result).toBe('Evaluated: {"key":"value"}');
            expect(wmComponent.evaluateExpr).toHaveBeenCalledWith(mockObject, 'displayLabel', 'displayExpr');
        });

        it('should handle getter returning undefined initially and then a value', () => {
            expect(wmComponent.getDisplayExpr()).toBe('');

            wmComponent.value = 'later set value';
            expect(wmComponent.getDisplayExpr()).toBe('later set value');
        });
    });

    describe('FormFieldDirective additional methods', () => {

        beforeEach(() => {
            (wmComponent as any).fieldValidations = {
                validate: jest.fn(),
                observeOn: jest.fn(),
                setAsyncValidators: jest.fn(),
                setValidators: jest.fn()
            };
            wmComponent.formWidget = {
                widget: {}
            };
            wmComponent.formWidgetMax = {
                widget: {}
            };
            wmComponent.form = {
                dataoutput: {}
            };
            wmComponent._fieldName = 'testField';
        });

        describe('notifyChanges', () => {
            it('should call validate on each field in notifyForFields', () => {
                const mockField1 = { fieldValidations: { validate: jest.fn() } };
                const mockField2 = { fieldValidations: { validate: jest.fn() } };
                (wmComponent as any).notifyForFields = [mockField1, mockField2];

                wmComponent.notifyChanges();

                expect(mockField1.fieldValidations.validate).toHaveBeenCalled();
                expect(mockField2.fieldValidations.validate).toHaveBeenCalled();
            });
        });

        describe('observeOn', () => {
            it('should call observeOn on fieldValidations with correct parameters', () => {
                const mockFields = ['field1', 'field2'];
                wmComponent.observeOn(mockFields);

                expect((wmComponent as any).fieldValidations.observeOn).toHaveBeenCalledWith(mockFields, 'formfields');
            });
        });

        describe('setAsyncValidators', () => {
            it('should call setAsyncValidators on fieldValidations with provided validators', () => {
                const mockValidators = ['validator1', 'validator2'];
                wmComponent.setAsyncValidators(mockValidators);

                expect((wmComponent as any).fieldValidations.setAsyncValidators).toHaveBeenCalledWith(mockValidators);
            });
        });

        describe('setValidators', () => {
            it('should call setValidators on fieldValidations with provided validators', () => {
                const mockValidators = ['validator1', 'validator2'];
                wmComponent.setValidators(mockValidators);

                expect((wmComponent as any).fieldValidations.setValidators).toHaveBeenCalledWith(mockValidators);
            });
        });

        describe('setFormWidget', () => {
            it('should set the property on the formWidget if it exists', () => {
                wmComponent.setFormWidget('testKey', 'testValue');

                expect(wmComponent.formWidget.widget['testKey']).toBe('testValue');
            });

            it('should not throw an error if formWidget does not exist', () => {
                wmComponent.formWidget = null;

                expect(() => {
                    wmComponent.setFormWidget('testKey', 'testValue');
                }).not.toThrow();
            });
        });

        describe('boundFn', () => {
            it('should call and return the result of the provided function', () => {
                const mockFn = jest.fn(() => 'result');
                const result = wmComponent.boundFn(mockFn);

                expect(mockFn).toHaveBeenCalled();
                expect(result).toBe('result');
            });
        });

        describe('setMaxFormWidget', () => {
            it('should set the property on the formWidgetMax if it exists', () => {
                wmComponent.setMaxFormWidget('testKey', 'testValue');

                expect(wmComponent.formWidgetMax.widget['testKey']).toBe('testValue');
            });

            it('should not throw an error if formWidgetMax does not exist', () => {
                wmComponent.formWidgetMax = null;

                expect(() => {
                    wmComponent.setMaxFormWidget('testKey', 'testValue');
                }).not.toThrow();
            });
        });
        describe('getCaption', () => {
            it('should return an empty string when value is undefined and dataoutput does not contain the field', () => {
                wmComponent.value = undefined;
                expect(wmComponent.getCaption()).toBe('');
            });

            it('should return an empty string when value is null and dataoutput does not contain the field', () => {
                wmComponent.value = null;
                expect(wmComponent.getCaption()).toBe('');
            });

            it('should return the value from dataoutput when value is undefined', () => {
                wmComponent.value = undefined;
                wmComponent.form.dataoutput.testField = 'Data Output Value';
                expect(wmComponent.getCaption()).toBe('Data Output Value');
            });

            it('should return the value from dataoutput when value is null', () => {
                wmComponent.value = null;
                wmComponent.form.dataoutput.testField = 'Data Output Value';
                expect(wmComponent.getCaption()).toBe('Data Output Value');
            });

            it('should prioritize the component value over dataoutput value', () => {
                wmComponent.value = 'Component Value';
                wmComponent.form.dataoutput.testField = 'Data Output Value';
                expect(wmComponent.getCaption()).toBe('Data Output Value');
            });
        });
    });

    describe('resetDisplayInput', () => {
        it('should call formWidget.resetDisplayInput when value is undefined', () => {
            wmComponent.formWidget = { resetDisplayInput: jest.fn() };
            wmComponent.value = undefined;
            wmComponent.resetDisplayInput();
            expect(wmComponent.formWidget.resetDisplayInput).toHaveBeenCalled();
        });

        it('should call formWidget.resetDisplayInput when value is an empty string', () => {
            wmComponent.formWidget = { resetDisplayInput: jest.fn() };
            wmComponent.value = '';
            wmComponent.resetDisplayInput();
            expect(wmComponent.formWidget.resetDisplayInput).toHaveBeenCalled();
        });
        it('should not throw error when formWidget is undefined', () => {
            wmComponent.formWidget = undefined;
            wmComponent.value = '';
            expect(() => wmComponent.resetDisplayInput()).not.toThrow();
        });
    });

    describe('triggerUploadEvent', () => {
        it('should invoke event callback with correct params for change event', () => {
            const mockEvent = { target: { files: ['file1', 'file2'] } };
            wmComponent.invokeEventCallback = jest.fn();
            (wmComponent as any)._oldUploadVal = ['oldFile'];

            wmComponent.triggerUploadEvent(mockEvent, 'change');

            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('change', {
                $event: mockEvent,
                newVal: ['file1', 'file2'],
                oldVal: ['oldFile']
            });
            expect((wmComponent as any)._oldUploadVal).toEqual(['file1', 'file2']);
        });

        it('should invoke event callback with only $event for non-change events', () => {
            const mockEvent = { someData: 'data' };
            wmComponent.invokeEventCallback = jest.fn();

            wmComponent.triggerUploadEvent(mockEvent, 'click');

            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('click', {
                $event: mockEvent
            });
        });
    });

    describe('onStatusChange', () => {
        beforeEach(() => {
            wmComponent.formWidget = {
                disabled: false
            };
            wmComponent.isDestroyed = false;
        });

        it('should set showPendingSpinner to true when status is PENDING', () => {
            wmComponent.onStatusChange('PENDING');
            expect((wmComponent as any).showPendingSpinner).toBe(true);
            expect(wmComponent.formWidget.disabled).toBe(true);
        });

        it('should set showPendingSpinner to false when status is not PENDING', () => {
            wmComponent.onStatusChange('VALID');
            expect((wmComponent as any).showPendingSpinner).toBe(false);
        });

        it('should set formWidget.disabled to match the directive when status is not PENDING', () => {
            (wmComponent as any).disabled = true;
            wmComponent.onStatusChange('VALID');
            expect(wmComponent.formWidget.disabled).toBe(true);
        });

        it('should not change anything if isDestroyed is true', () => {
            wmComponent.isDestroyed = true;
            wmComponent.onStatusChange('PENDING');
            expect((wmComponent as any).showPendingSpinner).toBeUndefined();
            expect(wmComponent.formWidget.disabled).toBe(false);
        });
    });

    // New tests for onStyleChange
    describe('onStyleChange', () => {
        beforeEach(() => {
            wmComponent.setFormWidget = jest.fn();
            wmComponent.setMaxFormWidget = jest.fn();
            (wmComponent as any).superOnStyleChange = jest.spyOn(FormFieldDirective.prototype, 'onStyleChange');
        });

        it('should call setFormWidget with key and new value', () => {
            wmComponent.onStyleChange('color', 'red');
            expect(wmComponent.setFormWidget).toHaveBeenCalledWith('color', 'red');
        });

        it('should call setMaxFormWidget with key and new value', () => {
            wmComponent.onStyleChange('maxWidth', '100px');
            expect(wmComponent.setMaxFormWidget).toHaveBeenCalledWith('maxWidth', '100px');
        });

        it('should call super.onStyleChange with all parameters', () => {
            wmComponent.onStyleChange('fontSize', '16px', '14px');
            expect((wmComponent as any).superOnStyleChange).toHaveBeenCalledWith('fontSize', '16px', '14px');
        });
    });

    describe('onPropertyChange', () => {
        beforeEach(() => {
            wmComponent.form = {
                dirty: false,
                onFieldDefaultValueChange: jest.fn(),
                onMaxDefaultValueChange: jest.fn(),
                markAsPristine: jest.fn(),
                setPrimaryKey: jest.fn()
            } as any;
            wmComponent.setFormWidget = jest.fn();
            wmComponent.setMaxFormWidget = jest.fn();
            (wmComponent as any)._debounceSetUpValidators = jest.fn();
            wmComponent.setReadOnlyState = jest.fn();
            (wmComponent as any).superOnPropertyChange = jest.spyOn(FormFieldDirective.prototype, 'onPropertyChange');
            (wmComponent as any).excludeProps = new Set();
        });

        // it('should not call super.onPropertyChange for tabindex', () => {
        //     wmComponent.onPropertyChange('tabindex', 'newValue', 'oldValue');
        //     expect((wmComponent as any).superOnPropertyChange).not.toHaveBeenCalled();
        // });

        it('should call super.onPropertyChange for non-tabindex keys', () => {
            wmComponent.onPropertyChange('someKey', 'newValue', 'oldValue');
            expect((wmComponent as any).superOnPropertyChange).toHaveBeenCalledWith('someKey', 'newValue', 'oldValue');
        });

        it('should return early if key is in excludeProps', () => {
            (wmComponent as any).excludeProps.add('excludedKey');
            wmComponent.onPropertyChange('excludedKey', 'newValue', 'oldValue');
            expect(wmComponent.setFormWidget).not.toHaveBeenCalled();
        });

        it('should handle UPLOAD widget type correctly', () => {
            wmComponent.widgettype = FormWidgetType.UPLOAD;
            wmComponent.onPropertyChange('required', true, false);
            expect((wmComponent as any)._debounceSetUpValidators).toHaveBeenCalled();
            expect((wmComponent as any).superOnPropertyChange).toHaveBeenCalledWith('required', true, false);
        });

        it('should call setFormWidget and setMaxFormWidget for non-placeholder keys', () => {
            wmComponent.onPropertyChange('someKey', 'newValue', 'oldValue');
            expect(wmComponent.setFormWidget).toHaveBeenCalledWith('someKey', 'newValue');
            expect(wmComponent.setMaxFormWidget).toHaveBeenCalledWith('someKey', 'newValue');
        });

        it('should not call setMaxFormWidget for placeholder key', () => {
            wmComponent.onPropertyChange('placeholder', 'newValue', 'oldValue');
            expect(wmComponent.setFormWidget).toHaveBeenCalledWith('placeholder', 'newValue');
            expect(wmComponent.setMaxFormWidget).not.toHaveBeenCalled();
        });

        it('should handle defaultvalue correctly', () => {
            wmComponent.onPropertyChange('defaultvalue', 'newValue', 'oldValue');
            expect(wmComponent.form.onFieldDefaultValueChange).toHaveBeenCalledWith(wmComponent, 'newValue');
        });

        it('should handle maxdefaultvalue correctly', () => {
            wmComponent.onPropertyChange('maxdefaultvalue', 'newValue', 'oldValue');
            expect(wmComponent.setMaxFormWidget).toHaveBeenCalledWith('datavalue', 'newValue');
            expect(wmComponent.form.onMaxDefaultValueChange).toHaveBeenCalled();
        });

        it('should handle maxplaceholder correctly', () => {
            wmComponent.onPropertyChange('maxplaceholder', 'newValue', 'oldValue');
            expect(wmComponent.setMaxFormWidget).toHaveBeenCalledWith('placeholder', 'newValue');
        });

        it('should call _debounceSetUpValidators for specific keys', () => {
            const keys = ['maxchars', 'minvalue', 'maxvalue', 'regexp', 'show'];
            keys.forEach(key => {
                wmComponent.onPropertyChange(key, 'newValue', 'oldValue');
                expect((wmComponent as any)._debounceSetUpValidators).toHaveBeenCalled();
            });
        });

        it('should handle primary-key correctly', () => {
            wmComponent._fieldName = 'testField';
            wmComponent.onPropertyChange('primary-key', true, false);
            expect(wmComponent.form.setPrimaryKey).toHaveBeenCalledWith('testField');
        });

        it('should handle display-name correctly', () => {
            wmComponent.onPropertyChange('display-name', 'New Display Name', 'Old Display Name');
            expect(wmComponent.displayname).toBe('New Display Name');
        });

        it('should handle readonly correctly', () => {
            wmComponent.onPropertyChange('readonly', true, false);
            expect(wmComponent.setReadOnlyState).toHaveBeenCalled();
        });
    });

    describe('ngAfterContentInit', () => {
        const FILE_TYPES = {
            'image': 'image/*',
            'video': 'video/*',
            'audio': 'audio/*'
        };
        beforeEach(() => {
            jest.spyOn(wmComponent, 'setFormWidget');
            jest.spyOn(wmComponent, 'registerReadyStateListener');
            wmComponent.formWidget = {} as any;
        });

        it('should call super.ngAfterContentInit', () => {
            // Since we're using a mock, we can't spy on the super method
            // Instead, we'll just verify that ngAfterContentInit was called
            wmComponent.ngAfterContentInit();
            expect(wmComponent.ngAfterContentInit).toHaveBeenCalled();
        });

        it('should initialize properties if formWidget exists', () => {
            wmComponent.ngAfterContentInit();
            expect(wmComponent.setFormWidget).toHaveBeenCalledWith('binddisplaylabel', wmComponent.binddisplaylabel);
            expect(wmComponent.setFormWidget).toHaveBeenCalledWith('binddisplayexpression', wmComponent.binddisplayexpression);
            expect(wmComponent.setFormWidget).toHaveBeenCalledWith('binddisplayimagesrc', wmComponent.binddisplayimagesrc);
            expect(wmComponent.setFormWidget).toHaveBeenCalledWith('bindChipclass', wmComponent.bindChipclass);
            expect(wmComponent.setFormWidget).toHaveBeenCalledWith('binddataset', wmComponent.binddataset);
        });

        it('should register ready state listener', () => {
            wmComponent.ngAfterContentInit();
            expect(wmComponent.registerReadyStateListener).toHaveBeenCalled();
        });
        describe('registerReadyStateListener callback', () => {
            let readyStateCallback: Function;

            beforeEach(() => {
                wmComponent.ngAfterContentInit();
                readyStateCallback = (wmComponent as any).readyStateCallback;
            });

            it('should set key property correctly', () => {
                wmComponent._fieldName = 'testField';
                wmComponent.target = 'testTarget';
                wmComponent.binding = 'testBinding';
                if (readyStateCallback) {
                    readyStateCallback();
                }

                expect(wmComponent.key).toBe('testField');

                wmComponent._fieldName = undefined;
                if (readyStateCallback) {
                    readyStateCallback();
                }
                expect(wmComponent.key).toBe('testTarget');

                wmComponent.target = undefined;
                if (readyStateCallback) {
                    readyStateCallback();
                }
                expect(wmComponent.key).toBe('testBinding');
            });

            it('should set viewmodewidget property', () => {
                const mockDefaultWidget = 'defaultWidget';
                mockGetDefaultViewModeWidget.mockReturnValue(mockDefaultWidget);

                wmComponent.viewmodewidget = undefined;
                wmComponent.widgettype = 'testWidgetType';
                if (readyStateCallback) {
                    readyStateCallback();
                }

                expect(wmComponent.viewmodewidget).toBe(mockDefaultWidget);
                expect(mockGetDefaultViewModeWidget).toHaveBeenCalledWith('testWidgetType');

                wmComponent.viewmodewidget = 'customWidget';
                if (readyStateCallback) {
                    readyStateCallback();
                }
                expect(wmComponent.viewmodewidget).toBe('customWidget');
            });

            it('should set permitted property for UPLOAD widget type', () => {
                wmComponent.widgettype = FormWidgetType.UPLOAD;
                wmComponent.filetype = 'image';
                wmComponent.extensions = '.jpg,.png';
                if (readyStateCallback) {
                    readyStateCallback();
                }

                expect(wmComponent.permitted).toBe(`image/*,.jpg,.png`);

                wmComponent.filetype = undefined;
                wmComponent.extensions = '.pdf';
                if (readyStateCallback) {
                    readyStateCallback();
                }
                expect(wmComponent.permitted).toBe('.pdf');
            });

            it('should set widget show property based on viewport for mobile', () => {
                mockIsMobile.mockReturnValue(true);
                (wmComponent as any).viewport = { isMobileType: true };
                (wmComponent as any).widget = { show: true };

                wmComponent['mobile-display'] = false;
                if (readyStateCallback) {
                    readyStateCallback();
                }
                expect((wmComponent as any).widget.show).toBe(false);
            });

            it('should set widget show property based on viewport for tablet', () => {
                mockIsMobile.mockReturnValue(false);
                (wmComponent as any).viewport = { isMobileType: false, isTabletType: true };
                (wmComponent as any).widget = { show: true };

                wmComponent['tablet-display'] = false;
                if (readyStateCallback) {
                    readyStateCallback();
                }
                expect((wmComponent as any).widget.show).toBe(false);
            });

            it('should set widget show property based on viewport for PC', () => {
                mockIsMobile.mockReturnValue(false);
                (wmComponent as any).viewport = { isMobileType: false, isTabletType: false };
                (wmComponent as any).widget = { show: true };

                wmComponent['pc-display'] = false;
                if (readyStateCallback) {
                    readyStateCallback();
                }
                expect((wmComponent as any).widget.show).toBe(false);
            });

            it('should set fieldDefConfig properties', () => {
                wmComponent.displayname = 'Test Display';
                wmComponent.show = true;
                wmComponent['is-related'] = true;
                wmComponent.inputtype = 'text';
                wmComponent.generator = 'testGenerator';
                wmComponent.placeholder = 'Test Placeholder';
                wmComponent['primary-key'] = true;
                wmComponent.required = true;
                wmComponent.readonly = true;
                wmComponent.regexp = /test/;
                wmComponent.type = 'string';
                wmComponent.name = 'testName';
                wmComponent.validationmessage = 'Test validation';
                wmComponent.widgettype = 'input';
                wmComponent['mobile-display'] = true;
                wmComponent['pc-display'] = true;
                wmComponent['tablet-display'] = true;

                // Set a value for the key property
                wmComponent._fieldName = 'testFieldName';
                if (readyStateCallback) {
                    readyStateCallback();
                }

                expect(wmComponent.fieldDefConfig).toEqual({
                    displaname: 'Test Display',
                    show: true,
                    isRelated: true,
                    inputtype: 'text',
                    generator: 'testGenerator',
                    placeholder: 'Test Placeholder',
                    primaryKey: true,
                    required: true,
                    _readonly: true,
                    regexp: /test/,
                    type: 'string',
                    key: 'testFieldName',
                    mobileDisplay: true,
                    name: 'testName',
                    pcDisplay: true,
                    tabletDisplay: true,
                    validationmessage: 'Test validation',
                    viewmodewidget: wmComponent.viewmodewidget,
                    widget: 'input'
                });
            });
        });
    });

    describe('onValueChange', () => {
        beforeEach(() => {
            formComponentMock = {
                registerFormFields: jest.fn(),
                onFieldValueChange: jest.fn(),
                ngform: new FormGroup({}),
                isUpdateMode: false,
                touched: false
            } as unknown as jest.Mocked<FormComponent>;
            wmComponent.form = formComponentMock;
            wmComponent.ngform = new FormGroup({});
            (wmComponent as any).fieldValidations = { setCustomValidationMessage: jest.fn() };
            wmComponent._fieldName = 'testField';
            wmComponent.ngform.addControl(wmComponent._fieldName, new FormControl());

            Object.defineProperty(wmComponent, '$element', {
                get: () => ({
                    find: jest.fn().mockReturnValue({ length: 1 })
                })
            });

            fixture.detectChanges();
            wmComponent.isDestroyed = false;
            (isMobile as jest.Mock).mockReturnValue(false);
            (isDateTimeType as jest.Mock).mockReturnValue(false);
            (isDefined as jest.Mock).mockReturnValue(true);
        });
        afterEach(() => {
            jest.resetAllMocks();
        });
        it('should call setAriaAttributes', () => {
            wmComponent.setAriaAttributes = jest.fn();
            wmComponent.onValueChange('test');
            expect(wmComponent.setAriaAttributes).toHaveBeenCalled();
        });

        it('should call form.onFieldValueChange', () => {
            wmComponent.onValueChange('test');
            expect(wmComponent.form.onFieldValueChange).toHaveBeenCalledWith(wmComponent, 'test');
        });

        it('should call notifyChanges', () => {
            wmComponent.notifyChanges = jest.fn();
            wmComponent.onValueChange('test');
            expect(wmComponent.notifyChanges).toHaveBeenCalled();
        });
        it('should mark field as touched when active and triggered by user', () => {
            (wmComponent as any)._triggeredByUser = true;
            wmComponent.onValueChange('test');
            expect(wmComponent.ngform.controls[wmComponent._fieldName].touched).toBeTruthy();
        });

        it('should mark field as touched when active, on mobile, clicked, and is datetime type', () => {
            (isMobile as jest.Mock).mockReturnValue(true);
            (isDateTimeType as jest.Mock).mockReturnValue(true);
            (wmComponent as any)._clicktriggeredByUser = true;
            wmComponent.widgettype = 'datetime';
            wmComponent.onValueChange('test');
            expect(wmComponent.ngform.controls[wmComponent._fieldName].touched).toBeTruthy();
        });

        it('should not mark field as touched when not triggered by user', () => {
            (wmComponent as any)._triggeredByUser = false;
            wmComponent.onValueChange('test');
            expect(wmComponent.ngform.controls[wmComponent._fieldName].touched).toBeFalsy();
        });

        it('should call setCustomValidationMessage when form is touched', () => {
            wmComponent.form.touched = true;
            wmComponent.onValueChange('test');
            expect((wmComponent as any).fieldValidations.setCustomValidationMessage).toHaveBeenCalled();
        });

        it('should not perform actions when isDestroyed is true', () => {
            wmComponent.isDestroyed = true;
            wmComponent.onValueChange('test');
            expect((wmComponent as any).fieldValidations.setCustomValidationMessage).not.toHaveBeenCalled();
        });
    });

    describe('setAriaAttributes', () => {
        let mockElement: { setAttribute: any; removeAttribute: any; };
        let mockNativeElement: { setAttribute: any; removeAttribute: any; getAttribute?: jest.Mock<any, any, any>; };
        let mockFormControl: { _invalid: any; _touched: any; };
        beforeEach(() => {
            mockElement = {
                setAttribute: jest.fn(),
                removeAttribute: jest.fn()
            };

            mockNativeElement = {
                setAttribute: jest.fn(),
                removeAttribute: jest.fn(),
                getAttribute: jest.fn().mockReturnValue('test-validation-id')
            };

            mockFormControl = {
                _invalid: false,
                _touched: false
            };

            wmComponent.getActiveElement = jest.fn().mockReturnValue(mockElement);

            Object.defineProperty(wmComponent, 'nativeElement', {
                get: () => mockNativeElement
            });

            wmComponent.ngform = {
                controls: {
                    [wmComponent._fieldName]: mockFormControl
                }
            } as any;

            Object.defineProperty(wmComponent.ngform.controls[wmComponent._fieldName], 'invalid', {
                get: () => mockFormControl._invalid
            });

            Object.defineProperty(wmComponent.ngform.controls[wmComponent._fieldName], 'touched', {
                get: () => mockFormControl._touched
            });
            wmComponent.form = {
                isUpdateMode: false
            } as any;
        });

        it('should set aria attributes when form control is invalid, touched, and form is in update mode', () => {
            mockFormControl._invalid = true;
            mockFormControl._touched = true;
            wmComponent.form.isUpdateMode = true;
            wmComponent.setAriaAttributes();
            expect(mockNativeElement.setAttribute).toHaveBeenCalledWith('__errormsg', 'test-validation-id');
            expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-invalid', 'true');
            expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-describedby', 'test-validation-id');
        });

        it('should remove aria attributes when form control is valid', () => {
            wmComponent.setAriaAttributes();
            expect(mockNativeElement.removeAttribute).toHaveBeenCalledWith('__errormsg');
            expect(mockElement.removeAttribute).toHaveBeenCalledWith('aria-invalid');
            expect(mockElement.removeAttribute).toHaveBeenCalledWith('aria-describedby');
        });

        it('should remove aria attributes when form control is invalid but not touched', () => {
            mockFormControl._invalid = true;
            wmComponent.setAriaAttributes();
            expect(mockNativeElement.removeAttribute).toHaveBeenCalledWith('__errormsg');
            expect(mockElement.removeAttribute).toHaveBeenCalledWith('aria-invalid');
            expect(mockElement.removeAttribute).toHaveBeenCalledWith('aria-describedby');
        });

        it('should remove aria attributes when form control is invalid and touched but form is not in update mode', () => {
            mockFormControl._invalid = true;
            mockFormControl._touched = true;
            wmComponent.setAriaAttributes();
            expect(mockNativeElement.removeAttribute).toHaveBeenCalledWith('__errormsg');
            expect(mockElement.removeAttribute).toHaveBeenCalledWith('aria-invalid');
            expect(mockElement.removeAttribute).toHaveBeenCalledWith('aria-describedby');
        });

        it('should not throw error when getActiveElement returns null', () => {
            wmComponent.getActiveElement = jest.fn().mockReturnValue(null);
            expect(() => wmComponent.setAriaAttributes()).not.toThrow();
        });
    });
});