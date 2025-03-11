import { Component, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { App, AppDefaults } from "@wm/core";
import { ToDatePipe } from "@wm/components/base";
import { DatePipe } from "@angular/common";
import {
    ComponentTestBase,
    ITestComponentDef,
    ITestModuleDef
} from "../../../../../../base/src/test/common-widget.specs";
import { IMaskModule } from "angular-imask";
import { InputColorComponent } from "./input-color.component";
import { mockApp } from "projects/components/base/src/test/util/component-test-util";

const markup = `<wm-input type="color" name="text1" hint="colorpicker">`;

@Component({
    template: markup
})

class InputColorWrapperComponent {
    @ViewChild(InputColorComponent, /* TODO: add static flag */ { static: true }) wmComponent: InputColorComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule, IMaskModule, InputColorComponent],
    declarations: [InputColorWrapperComponent],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AppDefaults, useClass: AppDefaults }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-input',
    widgetSelector: '[wmInput]',
    testModuleDef: testModuleDef,
    testComponent: InputColorWrapperComponent,
    inputElementSelector: 'input.app-textbox'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyAccessibility();
