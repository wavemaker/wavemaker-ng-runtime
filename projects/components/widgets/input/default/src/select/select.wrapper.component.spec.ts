import {Component, ViewChild} from "@angular/core";
import {SelectComponent} from "./select.component";
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../../base/src/test/common-widget.specs";
import {FormsModule} from "@angular/forms";
import {AbstractI18nService, App, AppDefaults} from '@wm/core';
import {ToDatePipe} from "@wm/components/base";
import {DatePipe} from "@angular/common";
import {MockAbstractI18nService} from '../../../../../base/src/test/util/date-test-util';

let mockApp = {};

const markup = `<wm-select name="select1" hint="select field">`;

@Component({
    template: markup
})

class SelectWrapperComponent {
    @ViewChild(SelectComponent, /* TODO: add static flag */ {static: true}) wmComponent: SelectComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule],
    declarations: [SelectWrapperComponent, SelectComponent],
    providers: [
        {provide: App, useValue: mockApp},
        {provide: ToDatePipe, useClass: ToDatePipe},
        {provide: DatePipe, useClass: DatePipe},
        {provide: AppDefaults, useClass: AppDefaults},
        {provide: AbstractI18nService, useClass: MockAbstractI18nService}
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-select',
    widgetSelector: '[wmSelect]',
    testModuleDef: testModuleDef,
    testComponent: SelectWrapperComponent,
    inputElementSelector: 'select'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyAccessibility();
