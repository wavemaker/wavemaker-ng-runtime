import {Component, ViewChild} from "@angular/core";
import {CurrencyComponent} from "./currency.component";
import {FormsModule} from "@angular/forms";
import {AbstractI18nService, App, AppDefaults, setPipeProvider} from "@wm/core";
import {TrailingZeroDecimalPipe} from "@wm/components/base";
import {DecimalPipe} from "@angular/common";
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../base/src/test/common-widget.specs";
import { PipeProvider } from "../../../../../runtime-base/src/services/pipe-provider.service";
import {waitForAsync, ComponentFixture} from '@angular/core/testing';
import {compileTestComponent, setInputValue} from "../../../../base/src/test/util/component-test-util";

let mockApp = {};

const markup = `<div blur.event="onBlur($event, widget)"
                 focus.event="onFocus($event, widget)"
                 change.event="onChange($event, widget, newVal, oldVal)" 
                 wmCurrency name="currency1" step="0.01" hint="currency" inputmode="natural" 
                 trailingzero="true" tabindex="1"></div>`;

class MockAbstractI18nService {
    public getSelectedLocale() {
        return 'en';
    }
}

@Component({
    template: markup
})

class CurrencyWrapperComponent {
    @ViewChild(CurrencyComponent, /* TODO: add static flag */ {static: true}) wmComponent: CurrencyComponent;

    public onChange($event, widget, newVal, oldVal) {
        console.log('Change callback triggered');
    }

    public onFocus($event, widget) {
        console.log('Focus callback triggered');
    }

    public onBlur($event, widget) {
        console.log('Blur callback triggered');
    }

    constructor(_pipeProvider: PipeProvider) {
        setPipeProvider(_pipeProvider);
    }
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule],
    declarations: [CurrencyWrapperComponent, CurrencyComponent],
    providers: [
        {provide: App, useValue: mockApp},
        {provide: AppDefaults, useValue: AppDefaults},
        {provide: AbstractI18nService, useClass: MockAbstractI18nService},
        {provide: DecimalPipe, useClass: DecimalPipe},
        {provide: TrailingZeroDecimalPipe, useClass: TrailingZeroDecimalPipe}
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
TestBase.verifyPropsInitialization();
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

        inputEl.dispatchEvent( new InputEvent(evtName));
        expect(currencyComp.displayValue).toEqual(expectedVal);
    }

    let validateInput = (options) => {
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
        fixture.detectChanges();
    }));

    it('should create the Currency Component', () => {
        expect(wrapperComponent).toBeTruthy() ;
    });

    it('should show formatted value when default value is provided and on focus should remove step formatting. Test focus and blur cb', () => {
        currencyComp.datavalue = 1234;
        currencyComp.ngModelOptions.updateOn = 'change';
    
        spyOn(wrapperComponent, 'onFocus');
        spyOn(wrapperComponent, 'onBlur');


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

        validateInput({ 'key': '7', 'keyCode': 50, 'code': 'Digit7'});     
    });

    it('should not allow user to enter decimals exceeding the limit set in step', () => {
        currencyComp.datavalue = 123.45;

        validateInput({ 'key': '7', 'keyCode': 50, 'code': 'Digit7'});     
    });

    it('should  allow user to enter decimals exceeding the limit set in step when input mode is financial', () => {
        currencyComp.inputmode = 'financial';
        currencyComp.datavalue = 123.45;

        let inputEl = getInputEl();

        const options = { 'key': '7', 'keyCode': 50, 'code': 'Digit7','target': inputEl};
        const validateVal = currencyComp.validateInputEntry(options);
        expect(validateVal).toEqual(undefined);


    });

    it('should allow user to enter value when decimal limit in datavalue is reached but change is on integral part', () => {
        let inputEl = getInputEl();
        currencyComp.datavalue = 123.45;

        let options = { 'key': '7', 'keyCode': 50, 'code': 'Digit7','target': inputEl};

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

    it('should allow plus sign only once', () => {
        currencyComp.datavalue = +123.45;
        validateInput({ 'key': '+', 'keyCode': 187, 'code': 'Equal' });

        // when positive value is entered with +, strip plus sign 
        validateOnEvt('blur', '123.45'); 
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

});
