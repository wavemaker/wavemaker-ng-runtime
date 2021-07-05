import {Component, ViewChild} from "@angular/core";
import {ColorPickerComponent} from "./color-picker.component";
import {FormsModule} from "@angular/forms";
import {App} from "@wm/core";
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../base/src/test/common-widget.specs";
import {ColorPickerModule} from "ngx-color-picker";

let mockApp = {};

const markup = `<div wmColorPicker name="colorpicker1" hint="colorpicker">`;

@Component({
    template: markup
})

class ColorPickerWrapperComponent {
    @ViewChild(ColorPickerComponent, /* TODO: add static flag */ {static: true}) wmComponent: ColorPickerComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule, ColorPickerModule],
    declarations: [ColorPickerWrapperComponent, ColorPickerComponent],
    providers: [
        {provide: App, useValue: mockApp},
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-colorpicker',
    widgetSelector: '[wmColorPicker]',
    testModuleDef: testModuleDef,
    testComponent: ColorPickerWrapperComponent,
    inputElementSelector: 'input.app-textbox'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();
