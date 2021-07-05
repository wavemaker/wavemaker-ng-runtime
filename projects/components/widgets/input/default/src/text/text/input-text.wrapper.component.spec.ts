import {Component, ViewChild} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {App, AppDefaults} from "@wm/core";
import {ToDatePipe} from "@wm/components/base";
import {DatePipe} from "@angular/common";
import {InputTextComponent} from "./input-text.component";
import {
    ComponentTestBase,
    ITestComponentDef,
    ITestModuleDef
} from "../../../../../../base/src/test/common-widget.specs";
import {IMaskModule} from "angular-imask";

let mockApp = {};

const markup = `<wm-input name="text1">`;

@Component({
    template: markup
})

class InputTextWrapperComponent {
    @ViewChild(InputTextComponent, /* TODO: add static flag */ {static: true}) wmComponent: InputTextComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule, IMaskModule],
    declarations: [InputTextWrapperComponent, InputTextComponent],
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
    testComponent: InputTextWrapperComponent,
    inputElementSelector: 'input.app-textbox'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyAccessibility();
