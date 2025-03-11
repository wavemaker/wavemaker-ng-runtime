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
import {InputEmailComponent} from "./input-email.component";
import { mockApp } from "projects/components/base/src/test/util/component-test-util";

const markup = `<wm-input type="email" name="text1" hint="email field">`;

@Component({
    template: markup
})

class InputEmailWrapperComponent {
    @ViewChild(InputEmailComponent, /* TODO: add static flag */ {static: true}) wmComponent: InputEmailComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule, IMaskModule, InputEmailComponent],
    declarations: [InputEmailWrapperComponent],
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
    testComponent: InputEmailWrapperComponent,
    inputElementSelector: 'input.app-textbox'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyAccessibility();
