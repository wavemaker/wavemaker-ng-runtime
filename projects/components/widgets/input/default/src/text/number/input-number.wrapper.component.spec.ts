import {Component, ViewChild} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {App, AppDefaults} from "@wm/core";
import {ToDatePipe} from "@wm/components/base";
import {DatePipe} from "@angular/common";
import {
    ComponentTestBase,
    ITestComponentDef,
    ITestModuleDef
} from "../../../../../../base/src/test/common-widget.specs";
import {IMaskModule} from "angular-imask";
import {InputNumberComponent} from "./input-number.component";

let mockApp = {
    subscribe: () => { return () => {}}
};

const markup = `<wm-input type="number" name="text1" hint="number field">`;

@Component({
    template: markup
})

class InputNumberWrapperComponent {
    @ViewChild(InputNumberComponent, /* TODO: add static flag */ {static: true}) wmComponent: InputNumberComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule, IMaskModule],
    declarations: [InputNumberWrapperComponent, InputNumberComponent],
    providers: [
        {provide: App, useValue: mockApp},
        {provide: ToDatePipe, useClass: ToDatePipe},
        {provide: DatePipe, useClass: DatePipe},
        {provide: AppDefaults, useClass: AppDefaults}
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-input',
    widgetSelector: '[wmInput]',
    testModuleDef: testModuleDef,
    testComponent: InputNumberWrapperComponent,
    inputElementSelector: 'input.app-textbox'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyAccessibility();
