import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {AbstractI18nService, App, setPipeProvider} from '@wm/core';
import {Component, ViewChild} from '@angular/core';
import {NumberComponent} from './number.component';
import {FormsModule} from '@angular/forms';
import {DecimalPipe, registerLocaleData} from '@angular/common';
import {TrailingZeroDecimalPipe} from '@wm/components/base';
import {PipeProvider} from '../../../../../../runtime-base/src/services/pipe-provider.service';
import localePT from '@angular/common/locales/pt.js';
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../../base/src/test/common-widget.specs";
import {compileTestComponent} from "../../../../../base/src/test/util/component-test-util";
import { By } from '@angular/platform-browser';

let mockApp = {};

const markup = `<div wmNumber hint="Number" name="testnumber" tabindex="1" ngModel change.event="onChange($event, widget, newVal, oldVal)"></div>`;

class MockAbstractI18nService {
    public getSelectedLocale() {
        return 'en';
    }
}

class MockAbstractI18nServicePt {
    public getSelectedLocale() {
        return 'pt';
    }
}

@Component({
    template: markup
})

class NumberWrapperComponent {
    @ViewChild(NumberComponent, /* TODO: add static flag */ {static: true}) wmComponent: NumberComponent;
    public testDefaultValue = 123.4;

    public onChange($event, widget, newVal, oldVal) {
        console.log('Change callback triggered');
    }
    constructor(_pipeProvider: PipeProvider) {
        setPipeProvider(_pipeProvider);
    }
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule],
    declarations: [NumberWrapperComponent, NumberComponent],
    providers: [
        {provide: App, useValue: mockApp},
        {provide: AbstractI18nService, useClass: MockAbstractI18nService},
        {provide: DecimalPipe, useClass: DecimalPipe},
        {provide: TrailingZeroDecimalPipe, useClass: TrailingZeroDecimalPipe}
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-number',
    widgetSelector: '[wmNumber]',
    testModuleDef: testModuleDef,
    testComponent: NumberWrapperComponent,
    inputElementSelector: 'input.app-textbox'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();

describe('NumberComponent', () => {
    let wrapperComponent: NumberWrapperComponent;
    let numberComponent: NumberComponent;
    let fixture: ComponentFixture<NumberWrapperComponent>;

    beforeEach(waitForAsync(() => {
        fixture = compileTestComponent(testModuleDef, NumberWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        numberComponent = wrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create the Number Component', () => {
        expect(wrapperComponent).toBeTruthy() ;
    });

    it('should display the default value in english language', () => {
        numberComponent.datavalue = wrapperComponent.testDefaultValue;
        fixture.detectChanges();
        // check for the number display value
        expect((numberComponent as any).transformNumber(numberComponent.datavalue)).toEqual(fixture.debugElement.nativeElement.querySelector('input').value);
    });

    it('should not invoke change callback when datavalue is set null and does not have previous value', () => {
        numberComponent.datavalue = null;
        jest.spyOn(wrapperComponent, 'onChange');
        expect((numberComponent as any).prevDatavalue).toEqual(undefined);
        expect(wrapperComponent.onChange).not.toHaveBeenCalled();
    });

    it('should not invoke change callback when datavalue is set null, has previous value and isDefaultQuery is true - WMS-20953', () => {
        (numberComponent as any).prevDatavalue = 123
        numberComponent.datavalue = null;
        jest.spyOn(wrapperComponent, 'onChange');

        expect(wrapperComponent.onChange).not.toHaveBeenCalled();
    });

    it('should invoke change callback when datavalue is modified', () => {
        jest.spyOn(wrapperComponent, 'onChange');

        const input = fixture.debugElement.query(By.css('.app-number-input')).nativeElement;
        const options = { 'key': '2', 'keyCode': 50, 'code': 'Digit2' };
        input.dispatchEvent(new KeyboardEvent('keypress', options));

        // previous value undefined, current value is present
        numberComponent.datavalue = 123;
        expect(wrapperComponent.onChange).toHaveBeenCalledTimes(1);

        // previous value present, current value is undefined
        numberComponent.datavalue = null;
        expect(wrapperComponent.onChange).toHaveBeenCalledTimes(2);

    });
});
describe('NumberComponent with Localization', () => {
    let wrapperComponent: NumberWrapperComponent;
    let numberComponent: NumberComponent;
    let fixture: ComponentFixture<NumberWrapperComponent>;


    beforeEach(waitForAsync(() => {
        // register the selected locale language
        registerLocaleData(localePT);
        fixture = compileTestComponent(testModuleDef, NumberWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        numberComponent = wrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create the Number Component', () => {
        expect(wrapperComponent).toBeTruthy() ;
    });

    it('should display the default value in portugues language', () => {
        numberComponent.datavalue = wrapperComponent.testDefaultValue;
        fixture.detectChanges();
        // check for the number display value(In portugues language the default value 123.4 should display as 123,4)
        expect((numberComponent as any).transformNumber(numberComponent.datavalue)).toEqual(fixture.debugElement.nativeElement.querySelector('input').value);
    });

});
