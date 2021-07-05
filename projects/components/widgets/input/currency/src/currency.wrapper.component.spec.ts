import {Component, ViewChild} from "@angular/core";
import {CurrencyComponent} from "./currency.component";
import {FormsModule} from "@angular/forms";
import {AbstractI18nService, App, AppDefaults} from "@wm/core";
import {ToDatePipe, TrailingZeroDecimalPipe} from "@wm/components/base";
import {DatePipe, DecimalPipe} from "@angular/common";
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../base/src/test/common-widget.specs";

let mockApp = {};

const markup = `<div wmCurrency name="currency1" hint="currency" tabindex="1">`;

class MockAbstractI18nService {
    public getSelectedLocale() {
        return 'en';
    }
}

@Component({
    template: markup
})

class CurrencyWrapperComponent {
    @ViewChild(CurrencyComponent, /* TODO: add static flag */ {static: true}) wmComponent: CurrencyComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule],
    declarations: [CurrencyWrapperComponent, CurrencyComponent],
    providers: [
        {provide: App, useValue: mockApp},
        {provide: ToDatePipe, useClass: ToDatePipe},
        {provide: DatePipe, useClass: DatePipe},
        {provide: AppDefaults, useClass: AppDefaults},
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
