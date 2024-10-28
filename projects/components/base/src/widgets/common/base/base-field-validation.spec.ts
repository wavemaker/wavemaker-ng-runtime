import { BaseFieldValidations } from './base-field-validations';
import { $unwatch, $watch } from '@wm/core';

jest.mock('@wm/core', () => ({
    $unwatch: jest.fn(),
    $watch: jest.fn(),
    FormWidgetType: {
        CHECKBOX: 'checkbox',
        TOGGLE: 'toggle'
    }
}));

describe('BaseFieldValidations', () => {
    let baseFieldValidations: BaseFieldValidations;
    let mockInstance: any;
    let mockFormWidget: any;
    let mockWidgetControl: any;
    let mockWidgetContext: any;

    beforeEach(() => {
        mockInstance = {
            required: false,
            maxchars: null,
            minvalue: null,
            maxvalue: null,
            regexp: null,
            show: true,
            widgetId: 'testWidget',
            registerDestroyListener: jest.fn(),
            widget: {}
        };
        mockFormWidget = {
            prevDatavalue: 'oldValue'
        };
        mockWidgetControl = {
            setValidators: jest.fn(),
            setAsyncValidators: jest.fn(),
            updateValueAndValidity: jest.fn(),
            markAsTouched: jest.fn()
        };
        mockWidgetContext = {
            ngform: {
                touched: false,
            },
        };

        baseFieldValidations = new BaseFieldValidations(
            mockInstance,
            mockFormWidget,
            'input',
            mockWidgetControl,
            mockWidgetContext
        );
        baseFieldValidations.applyDefaultValidators = jest.fn();
        baseFieldValidations.isNullOrEmptyOrFalsy = jest.fn().mockReturnValue(false);
    });

    test('setUpValidators should set up default validators', () => {
        mockInstance.required = true;
        mockInstance.maxchars = 10;
        mockInstance.minvalue = 5;
        mockInstance.maxvalue = 15;
        mockInstance.regexp = /test/;

        baseFieldValidations.setUpValidators();

        expect(mockWidgetControl.setValidators).toHaveBeenCalled();
    });

    test('setValidators should set up custom validators', () => {
        const mockCustomValidator = jest.fn();
        baseFieldValidations.setValidators([mockCustomValidator]);

        expect(baseFieldValidations['_syncValidators']).toContainEqual(expect.any(Function));
    });

    test('validate should apply default validators and update async validators', () => {
        const mockAsyncValidator = jest.fn().mockResolvedValue(null);
        baseFieldValidations['_asyncValidatorFn'] = jest.fn().mockReturnValue(mockAsyncValidator);

        baseFieldValidations.validate();

        expect(baseFieldValidations.applyDefaultValidators).toHaveBeenCalled();
        expect(mockWidgetControl.setAsyncValidators).toHaveBeenCalledWith([expect.any(Function)]);
        expect(mockWidgetControl.updateValueAndValidity).toHaveBeenCalled();
    });

    test('applyDefaultValidators should combine custom and default validators', () => {
        mockInstance.required = true;
        const mockCustomValidator = jest.fn();
        baseFieldValidations['_syncValidators'] = [mockCustomValidator];

        // Restore the original implementation for this test
        baseFieldValidations.applyDefaultValidators = BaseFieldValidations.prototype.applyDefaultValidators;

        baseFieldValidations.applyDefaultValidators();

        expect(mockWidgetControl.setValidators).toHaveBeenCalled();
    });

    describe('validate', () => {
        it('should call applyDefaultValidators', () => {
            baseFieldValidations.validate();
            expect(baseFieldValidations.applyDefaultValidators).toHaveBeenCalled();
        });

        it('should set async validators and update validity when _asyncValidatorFn exists', () => {
            baseFieldValidations['_asyncValidatorFn'] = jest.fn().mockReturnValue(() => Promise.resolve(null));
            baseFieldValidations.validate();
            expect(mockWidgetControl.setAsyncValidators).toHaveBeenCalled();
            expect(mockWidgetControl.updateValueAndValidity).toHaveBeenCalled();
        });

        it('should set emitEvent to false when value is unchanged or empty', () => {
            baseFieldValidations['_asyncValidatorFn'] = jest.fn().mockReturnValue(() => Promise.resolve(null));
            baseFieldValidations.isNullOrEmptyOrFalsy = jest.fn().mockReturnValue(true);
            baseFieldValidations.validate();
            expect(mockWidgetControl.updateValueAndValidity).toHaveBeenCalledWith({ emitEvent: false });
        });

        it('should mark control as touched when form is touched', () => {
            mockWidgetContext.ngform.touched = true;
            baseFieldValidations.validate();
            expect(mockWidgetControl.markAsTouched).toHaveBeenCalled();
        });
    });

    describe('watchDefaultValidatorExpr', () => {
        it('should call $unwatch with the correct watchName', () => {
            const fn = jest.fn();
            const key = 'testKey';
            baseFieldValidations.watchDefaultValidatorExpr(fn, key);
            expect($unwatch).toHaveBeenCalledWith('testWidget_testKey_formField');
        });

        it('should call registerDestroyListener with $watch', () => {
            const fn = jest.fn();
            const key = 'testKey';
            baseFieldValidations.watchDefaultValidatorExpr(fn, key);
            expect(mockInstance.registerDestroyListener).toHaveBeenCalled();
            expect($watch).toHaveBeenCalled();
        });

        // it('should update widget key and call applyDefaultValidators when watch callback is triggered', () => {
        //     const fn = jest.fn();
        //     const key = 'testKey';
        //     baseFieldValidations.watchDefaultValidatorExpr(fn, key);

        //     // Simulate the watch callback
        //     const watchCallback = ($watch as jest.Mock).mock.calls[0][3];
        //     if (typeof watchCallback === 'function') {
        //         watchCallback('newValue', 'oldValue');
        //         expect(mockInstance.widget[key]).toBe('newValue');
        //         expect(baseFieldValidations.applyDefaultValidators).toHaveBeenCalled();
        //     } else {
        //         fail('watchCallback is not a function');
        //     }
        // });
    });
});