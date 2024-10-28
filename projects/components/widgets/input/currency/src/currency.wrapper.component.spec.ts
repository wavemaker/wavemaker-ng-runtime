import { Component, ViewChild } from "@angular/core";
import { CurrencyComponent } from "./currency.component";
import { AbstractControl, FormControl, FormsModule } from "@angular/forms";
import { AbstractI18nService, App, AppDefaults, CURRENCY_INFO, setPipeProvider } from "@wm/core";
import { TrailingZeroDecimalPipe } from "@wm/components/base";
import { DecimalPipe } from "@angular/common";
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../base/src/test/common-widget.specs";
import { PipeProvider } from "../../../../../runtime-base/src/services/pipe-provider.service";
import { waitForAsync, ComponentFixture } from '@angular/core/testing';
import { compileTestComponent, mockApp, setInputValue } from "../../../../base/src/test/util/component-test-util";
import { MockAbstractI18nService } from "projects/components/base/src/test/util/date-test-util";
import { NumberLocale } from "../../default/src/public_api";

const markup = `<div blur.event="onBlur($event, widget)"
                 focus.event="onFocus($event, widget)"
                 change.event="onChange($event, widget, newVal, oldVal)"
                 wmCurrency name="currency1" step="0.01" hint="currency" inputmode="natural"
                 trailingzero="true" tabindex="1"></div>`;

@Component({
    template: markup
})

class CurrencyWrapperComponent {
    @ViewChild(CurrencyComponent, /* TODO: add static flag */ { static: true }) wmComponent: CurrencyComponent;

    public onChange($event, widget, newVal, oldVal) {
    }

    public onFocus($event, widget) {
    }

    public onBlur($event, widget) {
    }

    constructor(_pipeProvider: PipeProvider) {
        setPipeProvider(_pipeProvider);
    }
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule],
    declarations: [CurrencyWrapperComponent, CurrencyComponent],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: AppDefaults, useValue: AppDefaults },
        { provide: AbstractI18nService, useClass: MockAbstractI18nService },
        { provide: DecimalPipe, useClass: DecimalPipe },
        { provide: TrailingZeroDecimalPipe, useClass: TrailingZeroDecimalPipe }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-currency',
    widgetSelector: '[wmCurrency]',
    testModuleDef: testModuleDef,
    testComponent: CurrencyWrapperComponent,
    inputElementSelector: 'input.app-textbox'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
// TestBase.verifyPropsInitialization(); /* to be fixed for step property issue */
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();

describe('CurrencyComponent', () => {
    let wrapperComponent: CurrencyWrapperComponent;
    let currencyComponent: CurrencyComponent;
    let fixture: ComponentFixture<CurrencyWrapperComponent>;
    let currencyComp;

    let getInputEl = () => {
        return fixture.debugElement.nativeElement.querySelector('input');
    }

    let validateOnEvt = (evtName, expectedVal) => {
        let inputEl = getInputEl();

        inputEl.dispatchEvent(new InputEvent(evtName));
        expect(currencyComp.displayValue).toEqual(expectedVal);
    }

    let validateInput = (options: { [x: string]: any; key?: string; keyCode?: number; code?: string; }) => {
        let inputEl = getInputEl();
        options['target'] = inputEl;

        const validateVal = currencyComp.validateInputEntry(options);
        expect(validateVal).toEqual(false);
    }

    beforeEach(waitForAsync(() => {
        fixture = compileTestComponent(testModuleDef, CurrencyWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        currencyComponent = wrapperComponent.wmComponent;
        currencyComp = currencyComponent as any;
        // Mock CURRENCY_INFO

        fixture.detectChanges();
    }));

    it('should create the Currency Component', () => {
        expect(wrapperComponent).toBeTruthy();
    });

    it('should show formatted value when default value is provided and on focus should remove step formatting. Test focus and blur cb', () => {
        currencyComp.datavalue = 1234;
        currencyComp.ngModelOptions.updateOn = 'change';

        jest.spyOn(wrapperComponent, 'onFocus');
        jest.spyOn(wrapperComponent, 'onBlur');


        // On focus should strip '.00'
        validateOnEvt('focus', '1,234');
        expect(currencyComp.transformNumber(currencyComp.datavalue)).toEqual(currencyComp.displayValue);

        // on focus, check focus callback is triggered
        expect(wrapperComponent.onFocus).toHaveBeenCalledTimes(1);

        // On blur should show '.00' formatting
        validateOnEvt('blur', '1,234.00');
        setInputValue(fixture, '.app-currency-input', '1234').then(() => {
            expect(currencyComp.displayValue).toEqual(getInputEl().value);
        });

        // on blur, check blur callback is triggered
        expect(wrapperComponent.onBlur).toHaveBeenCalledTimes(1);
    });

    it('should not show formatted value when step is not provided', () => {
        currencyComp.step = 1;
        currencyComp.datavalue = 12345;

        validateOnEvt('focus', '12,345');

        validateOnEvt('blur', '12,345');
    });

    it('should not show formatted value when trailingzero is not provided', () => {
        currencyComp.trailingzero = false;
        currencyComp.datavalue = 12345;

        validateOnEvt('focus', '12,345');

        validateOnEvt('blur', '12,345');
    });

    it('should show inputted decimal in focus and formatted decimal value on blur in natural currency', () => {
        currencyComp.datavalue = 123.3;

        validateOnEvt('focus', '123.3');

        validateOnEvt('blur', '123.30');
    });

    it('should show financial format on the inputted value when currency is financial', () => {
        currencyComp.inputmode = 'financial';
        currencyComp.step = 0.01;
        currencyComp.datavalue = 1234;


        // when a default value is provided, add trailing zeros and do not format it to financial currency
        expect(currencyComp.displayValue).toEqual('1,234.00');

        currencyComp.isDefaultQuery = false;
        // When user enters a value show it in financial format

        setInputValue(fixture, '.app-currency-input', '12').then(() => {
            expect(currencyComp.displayValue).toEqual('0.12');
        });
    });

    it('should show trailing zeros on focus and remove them on blur when trailing zero is set to false in financial mode', () => {
        currencyComp.inputmode = 'financial';
        currencyComp.step = 0.01;
        currencyComp.trailingzero = false;

        currencyComp.datavalue = 123.00;

        // On focus should show '.00' formatting
        validateOnEvt('focus', '123.00');

        // On blur should strip '.00'
        validateOnEvt('blur', '123');
    });


    it('should check formatting of display value happends based on update on value', () => {
        currencyComp.ngModelOptions.updateOn = 'change';
        currencyComp.inputmode = 'financial';
        currencyComp.step = 0.01;

        currencyComp.isDefaultQuery = false;

        // format the display value when update on is set to keypress
        currencyComp.onInputChange('1234567');
        expect((currencyComp.displayValue)).toEqual('12,345.67');

        // do not format the display value when update on is set to blur, and change it only on blur
        currencyComp.ngModelOptions.updateOn = 'blur';
        currencyComp.onInputChange('1234567');
        expect((currencyComp.displayValue)).toEqual('12345.67');
    });


    // <------------------------- VALDIATIONS ----------------------------->

    it('should not allow user to enter more than 16 digits', () => {
        currencyComp.datavalue = 1234567890123456;

        validateInput({ 'key': '7', 'keyCode': 50, 'code': 'Digit7' });
    });

    it('should  allow user to enter decimals exceeding the limit set in step when input mode is financial', () => {
        currencyComp.inputmode = 'financial';
        currencyComp.datavalue = 123.45;

        let inputEl = getInputEl();

        const options = { 'key': '7', 'keyCode': 50, 'code': 'Digit7', 'target': inputEl };
        const validateVal = currencyComp.validateInputEntry(options);
        expect(validateVal).toEqual(undefined);


    });

    it('should allow user to enter value when decimal limit in datavalue is reached but change is on integral part', () => {
        let inputEl = getInputEl();
        currencyComp.datavalue = 123.45;

        let options = { 'key': '7', 'keyCode': 50, 'code': 'Digit7', 'target': inputEl };

        // make change to integral part
        options.target.setSelectionRange(2, 2);
        const validateValue = currencyComp.validateInputEntry(options);
        expect(validateValue).toEqual(undefined);
    });

    it('should allow user to enter only numerics and seperators', () => {
        validateInput({ 'key': 'r', 'keyCode': 82, 'code': 'KeyR' });
    });

    it('should not allow user to enter decimal more than once', () => {
        currencyComp.datavalue = 123.45;

        validateInput({ 'key': '.', 'keyCode': 190, 'code': 'Period' });
    });

    it('should not allow user to enter exponential more than once', () => {
        let inputEl = getInputEl();
        inputEl.value = '123e';

        validateInput({ 'key': 'e', 'keyCode': 69, 'code': 'KeyE' });
    });

    it('should allow minus sign only once', () => {
        currencyComp.datavalue = -123.45;
        validateInput({ 'key': '-', 'keyCode': 189, 'code': 'Minus' });

        // When negative value is entered, minus sign should be shown on blur
        validateOnEvt('blur', '-123.45');
    });

    it('should not allow user to enter space when there is no input value', () => {
        currencyComp.datavalue = null;

        validateInput({ 'key': ' ', 'keyCode': 32, 'code': 'Space' });
    });

    it('should throw error when minimum value condition is not met', () => {
        currencyComp.minvalue = 100;
        currencyComp.datavalue = 50;

        expect(currencyComp.numberNotInRange).toEqual(true);
    });

    it('should throw error when maxvalue value condition is not met', () => {
        currencyComp.maxvalue = 100;
        currencyComp.datavalue = 150;

        expect(currencyComp.numberNotInRange).toEqual(true);
    });
    it('should update currencyCode and currencySymbol when key is "currency"', () => {
        const newCurrency = 'EUR';
        const oldCurrency = 'USD';

        // Simulate a property change event
        currencyComp.onPropertyChange('currency', newCurrency, oldCurrency);

        // Expectations
        expect(currencyComp.currencyCode).toEqual(newCurrency);
    });
    it('should call super.onPropertyChange for other keys', () => {
        const key = 'someKey';
        const newValue = 'someValue';
        const oldValue = 'oldValue';

        // Spy on super method
        const superSpy = jest.spyOn(NumberLocale.prototype, 'onPropertyChange');

        // Simulate a property change event
        currencyComp.onPropertyChange(key, newValue, oldValue);

        // Expectations
        expect(superSpy).toHaveBeenCalledWith(key, newValue, oldValue);
    })

    describe('NumberLocale functionality', () => {

        it('should parse localized numbers correctly', () => {
            expect((currencyComp as any).parseNumber('1,234.56')).toBe(1234.56);
            expect((currencyComp as any).parseNumber('-1,234.56')).toBe(-1234.56);
            expect((currencyComp as any).parseNumber('0,123')).toBe(123);
        });

        it('should validate number range correctly', () => {
            currencyComponent.minvalue = 0;
            currencyComponent.maxvalue = 1000;

            currencyComponent.datavalue = 500;
            expect(currencyComponent.datavalue).toBe(500);
        });

        it('should handle decimal places according to step', () => {
            currencyComponent.step = 0.01;
            currencyComponent.datavalue = 10.123;
            expect(currencyComponent.datavalue).toBeNull();
            currencyComponent.datavalue = 10.12;
            expect(currencyComponent.datavalue).toBe(10.12);
            currencyComponent.step = 0.1;
            currencyComponent.datavalue = 10.12;
            expect(currencyComponent.datavalue).toBeNull();
            currencyComponent.datavalue = 10.1;
            expect(currencyComponent.datavalue).toBe(10.1);
        });

        it('should correctly transform numbers to localized strings', () => {
            const transformNumber = (currencyComponent as any).transformNumber.bind(currencyComponent);
            expect(transformNumber(1234.56)).toBe('1,234.56');
        });

        it('should handle financial input mode correctly', () => {
            currencyComponent.inputmode = 'financial';
            currencyComponent.step = 0.01;
            currencyComponent.onInputChange('1234');
            expect(currencyComponent.displayValue).toBe('1234.00');
            currencyComponent.onInputChange('123456');
            expect(currencyComponent.displayValue).toBe('123456.00');
        });

        it('should validate input entry correctly', () => {
            expect(currencyComponent.validateInputEntry({ key: '5', target: { value: '123' } })).toBeUndefined();
            expect(currencyComponent.validateInputEntry({ key: 'a', target: { value: '123' } })).toBe(false);
            expect(currencyComponent.validateInputEntry({ key: '.', target: { value: '123.45' } })).toBe(false);
        });

        it('should handle arrow key presses correctly', () => {
            currencyComponent.step = 0.1;
            currencyComponent.datavalue = 10;
            currencyComponent.onArrowPress({ preventDefault: jest.fn(), target: { value: '10' } }, 'UP');
            expect(currencyComponent.datavalue).toBe(10.1);
            currencyComponent.onArrowPress({ preventDefault: jest.fn(), target: { value: '10.1' } }, 'DOWN');
            expect(currencyComponent.datavalue).toBe(10);
        });

        it('should update display text correctly', () => {
            currencyComponent.datavalue = 1234.56;
            fixture.detectChanges();
            expect(currencyComponent.displayValue).toBe('1,234.56');
            currencyComponent.trailingzero = true;
            currencyComponent.datavalue = 1234;
            fixture.detectChanges();
            expect(currencyComponent.displayValue).toBe('1,234');
        });

        describe('resetCursorPosition', () => {
            let inputElement: HTMLInputElement;

            beforeEach(() => {
                inputElement = document.createElement('input');
                inputElement.value = '1234.56';
                (currencyComponent as any).inputEl = { nativeElement: inputElement };
            });

            it('should set cursor position correctly when value is less than input length', () => {
                (currencyComponent as any).resetCursorPosition(2);
                expect(inputElement.selectionStart).toBe(5);
                expect(inputElement.selectionEnd).toBe(5);
            });

            it('should set cursor position to 0 when value is greater than input length', () => {
                (currencyComponent as any).resetCursorPosition(10);
                expect(inputElement.selectionStart).toBe(0);
                expect(inputElement.selectionEnd).toBe(0);
            });

            it('should set cursor position to input length when value is 0', () => {
                (currencyComponent as any).resetCursorPosition(0);
                expect(inputElement.selectionStart).toBe(7);
                expect(inputElement.selectionEnd).toBe(7);
            });

            it('should set cursor position correctly for negative values', () => {
                (currencyComponent as any).resetCursorPosition(-2);
                expect(inputElement.selectionStart).toBe(7);
                expect(inputElement.selectionEnd).toBe(7);
            });

            it('should handle empty input correctly', () => {
                inputElement.value = '';
                (currencyComponent as any).resetCursorPosition(2);
                expect(inputElement.selectionStart).toBe(0);
                expect(inputElement.selectionEnd).toBe(0);
            });
        });

        describe('onArrowPress', () => {
            beforeEach(() => {
                currencyComponent.step = 0.1;
                currencyComponent.minvalue = 0;
                currencyComponent.maxvalue = 100;
                (currencyComponent as any).proxyModel = 10;
                currencyComponent.inputEl = { nativeElement: { value: '10' } };
                (currencyComponent as any).updateDisplayText = jest.fn();
                currencyComponent.handleChange = jest.fn();
                (currencyComponent as any).getValueInRange = jest.fn(val => val);
                (currencyComponent as any).resetValidations = jest.fn();
            });

            it('should increment value when UP key is pressed', () => {
                const event = { preventDefault: jest.fn(), target: { value: '10' } };
                currencyComponent.onArrowPress(event, 'UP');
                expect((currencyComponent as any).proxyModel).toBe(10.1);
                expect((currencyComponent as any).updateDisplayText).toHaveBeenCalled();
                expect(currencyComponent.handleChange).toHaveBeenCalledWith(10.1);
            });

            it('should decrement value when DOWN key is pressed', () => {
                const event = { preventDefault: jest.fn(), target: { value: '10' } };
                currencyComponent.onArrowPress(event, 'DOWN');
                expect((currencyComponent as any).proxyModel).toBe(9.9);
                expect((currencyComponent as any).updateDisplayText).toHaveBeenCalled();
                expect(currencyComponent.handleChange).toHaveBeenCalledWith(9.9);
            });

            it('should not change value when readonly is true', () => {
                currencyComponent.readonly = true;
                const event = { preventDefault: jest.fn(), target: { value: '10' } };
                currencyComponent.onArrowPress(event, 'UP');
                expect((currencyComponent as any).proxyModel).toBe(10);
                expect((currencyComponent as any).updateDisplayText).not.toHaveBeenCalled();
                expect(currencyComponent.handleChange).not.toHaveBeenCalled();
            });

            it('should not change value when step is 0', () => {
                currencyComponent.step = 0;
                const event = { preventDefault: jest.fn(), target: { value: '10' } };
                currencyComponent.onArrowPress(event, 'UP');
                expect((currencyComponent as any).proxyModel).toBe(10);
                expect((currencyComponent as any).updateDisplayText).not.toHaveBeenCalled();
                expect(currencyComponent.handleChange).not.toHaveBeenCalled();
            });

            it('should handle numberNotInRange scenario', () => {
                (currencyComponent as any).numberNotInRange = true;
                currencyComponent.inputEl.nativeElement.value = '150';
                (currencyComponent as any).getValueInRange = jest.fn().mockReturnValue(100);

                const event = { preventDefault: jest.fn(), target: { value: '150' } };
                currencyComponent.onArrowPress(event, 'UP');

                expect((currencyComponent as any).resetValidations).toHaveBeenCalled();
                // The proxyModel remains at 10, as it's not being updated in this scenario
                expect((currencyComponent as any).proxyModel).toBe(10);
            });
            it('should handle undefined proxyModel', () => {
                (currencyComponent as any).proxyModel = undefined;
                (currencyComponent as any).getValueInRange = jest.fn().mockReturnValue(0);

                const event = { preventDefault: jest.fn(), target: { value: '' } };
                currencyComponent.onArrowPress(event, 'UP');

                expect((currencyComponent as any).resetValidations).toHaveBeenCalled();
                expect((currencyComponent as any).proxyModel).toBe(0);
                expect((currencyComponent as any).updateDisplayText).toHaveBeenCalled();
                expect(currencyComponent.handleChange).toHaveBeenCalledWith(0);
            });

            it('should handle value at minvalue', () => {
                (currencyComponent as any).proxyModel = 0;
                currencyComponent.inputEl.nativeElement.value = '0';
                (currencyComponent as any).getValueInRange = jest.fn().mockReturnValue(0);

                const event = { preventDefault: jest.fn(), target: { value: '0' } };
                currencyComponent.onArrowPress(event, 'DOWN');

                expect((currencyComponent as any).proxyModel).toBe(0);
                expect((currencyComponent as any).updateDisplayText).toHaveBeenCalled();
                expect(currencyComponent.handleChange).toHaveBeenCalledWith(0);
            });


            it('should handle value at maxvalue', () => {
                (currencyComponent as any).proxyModel = 100;
                currencyComponent.inputEl.nativeElement.value = '100';
                (currencyComponent as any).getValueInRange = jest.fn().mockReturnValue(100);

                const event = { preventDefault: jest.fn(), target: { value: '100' } };
                currencyComponent.onArrowPress(event, 'UP');

                expect((currencyComponent as any).proxyModel).toBe(100);
                expect((currencyComponent as any).updateDisplayText).toHaveBeenCalled();
                expect(currencyComponent.handleChange).toHaveBeenCalledWith(100);
            });
        });
        describe('validate', () => {
            let control: AbstractControl;

            beforeEach(() => {
                control = new FormControl();
            });

            it('should return invalidNumber error when isInvalidNumber is true', () => {
                (currencyComponent as any).isInvalidNumber = true;
                const result = currencyComponent.validate(control);
                expect(result).toEqual({
                    invalidNumber: {
                        valid: false
                    }
                });
                expect((currencyComponent as any).validateType).toBe('');
            });

            it('should return numberNotInRange error when numberNotInRange is true', () => {
                (currencyComponent as any).isInvalidNumber = false;
                (currencyComponent as any).numberNotInRange = true;
                const result = currencyComponent.validate(control);
                expect(result).toEqual({
                    numberNotInRange: {
                        valid: false
                    }
                });
            });

            it('should return required error when show and required are true and value is empty', () => {
                (currencyComponent as any).isInvalidNumber = false;
                (currencyComponent as any).numberNotInRange = false;
                currencyComponent['show'] = true;
                currencyComponent['required'] = true;
                control.setValue('');
                const result = currencyComponent.validate(control);
                expect(result).toEqual({ required: true });
            });

            it('should return null when show and required are true and value is 0', () => {
                (currencyComponent as any).isInvalidNumber = false;
                (currencyComponent as any).numberNotInRange = false;
                currencyComponent['show'] = true;
                currencyComponent['required'] = true;
                control.setValue(0);
                const result = currencyComponent.validate(control);
                expect(result).toBeNull();
            });

            it('should return null when all validations pass', () => {
                (currencyComponent as any).isInvalidNumber = false;
                (currencyComponent as any).numberNotInRange = false;
                currencyComponent['show'] = true;
                currencyComponent['required'] = true;
                control.setValue(10);
                const result = currencyComponent.validate(control);
                expect(result).toBeNull();
            });

            it('should set validateType to empty string when validation occurs', () => {
                (currencyComponent as any).isInvalidNumber = false;
                (currencyComponent as any).numberNotInRange = false;
                currencyComponent.validate(control);
                expect((currencyComponent as any).validateType).toBe('');
            });
        });
        describe('onBackspace', () => {
            it('should set isDefaultQuery to false', () => {
                (currencyComponent as any).isDefaultQuery = true;
                currencyComponent.onBackspace({});
                expect((currencyComponent as any).isDefaultQuery).toBe(false);
            });
        });

        describe('onEnter', () => {
            it('should set datavalue to the event target value', () => {
                const event = { target: { value: '100' } };
                currencyComponent.onEnter(event);
                expect(currencyComponent.datavalue).toBe(100);
            });
        });

        describe('onModelChange', () => {
            it('should set datavalue when inputmode is NATURAL', () => {
                currencyComponent.inputmode = 'natural';
                currencyComponent.onModelChange('100');
                expect(currencyComponent.datavalue).toBe(100);
            });

            it('should set datavalue when inputmode is FINANCIAL and updateOn is blur', () => {
                currencyComponent.inputmode = 'financial';
                currencyComponent.ngModelOptions = { updateOn: 'blur', standalone: true };
                currencyComponent.onModelChange('100');
                expect(currencyComponent.datavalue).toBe(100);
            });

            it('should not set datavalue when inputmode is FINANCIAL and updateOn is not blur', () => {
                currencyComponent.inputmode = 'financial';
                currencyComponent.ngModelOptions = { updateOn: 'change', standalone: true };
                (currencyComponent as any).datavalue = '50';
                currencyComponent.onModelChange('100');
                expect(currencyComponent.datavalue).toBe(50);
            });
        });

        describe('onPropertyChange', () => {
            beforeEach(() => {
                jest.spyOn((currencyComponent as any), 'isValid');
                jest.spyOn(currencyComponent, 'isNaturalCurrency');
                jest.spyOn(currencyComponent, 'checkForTrailingZeros');
                jest.spyOn(currencyComponent, 'onInputChange');
                // Assuming the component extends a base class with onPropertyChange
                jest.spyOn(Object.getPrototypeOf(currencyComponent), 'onPropertyChange');
            });

            it('should call isValid when key is maxvalue', () => {
                currencyComponent.onPropertyChange('maxvalue', 100);
                expect((currencyComponent as any).isValid).toHaveBeenCalledWith(100);
            });

            it('should call checkForTrailingZeros when key is datavalue and isNaturalCurrency returns true', () => {
                (currencyComponent.isNaturalCurrency as jest.Mock).mockReturnValue(true);
                currencyComponent.onPropertyChange('datavalue', 100);
                expect(currencyComponent.checkForTrailingZeros).toHaveBeenCalledWith({ type: 'blur' });
            });

            it('should call onInputChange when key is datavalue and isNaturalCurrency returns false', () => {
                (currencyComponent.isNaturalCurrency as jest.Mock).mockReturnValue(false);
                currencyComponent.onPropertyChange('datavalue', 100);
                expect(currencyComponent.onInputChange).toHaveBeenCalledWith(100);
            });

            it('should call super.onPropertyChange for other keys (alternative approach)', () => {
                const superOnPropertyChange = Object.getPrototypeOf(currencyComponent).onPropertyChange as jest.Mock;
                currencyComponent.onPropertyChange('someOtherKey', 'value');
                const calls = superOnPropertyChange.mock.calls;
                const hasExpectedCall = calls.some(call =>
                    call[0] === 'someOtherKey' && call[1] === 'value' && call[2] === undefined
                );
                expect(hasExpectedCall).toBe(true);
            });
        });
    });
});
