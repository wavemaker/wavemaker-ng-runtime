import {async, ComponentFixture, TestBed} from '@angular/core/testing';
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

let mockApp = {};

const markup = `<div wmNumber hint="Number" name="testnumber" tabindex="1" ngModel></div>`;

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

    beforeEach(async(() => {
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

});
describe('NumberComponent with Localization', () => {
    let wrapperComponent: NumberWrapperComponent;
    let numberComponent: NumberComponent;
    let fixture: ComponentFixture<NumberWrapperComponent>;


    beforeEach(async(() => {
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
