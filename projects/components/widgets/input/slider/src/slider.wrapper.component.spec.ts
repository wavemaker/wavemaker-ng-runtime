import {Component, ViewChild} from "@angular/core";
import {SliderComponent} from "./slider.component";
import {FormsModule} from "@angular/forms";
import {App, AppDefaults} from "@wm/core";
import {ToDatePipe} from "@wm/components/base";
import {DatePipe} from "@angular/common";
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../base/src/test/common-widget.specs";

let mockApp = {};

const markup = `<div wmSlider name="slider1" hint="slider">`;

@Component({
    template: markup
})

class SliderWrapperComponent {
    @ViewChild(SliderComponent, /* TODO: add static flag */ {static: true}) wmComponent: SliderComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule],
    declarations: [SliderWrapperComponent, SliderComponent],
    providers: [
        {provide: App, useValue: mockApp},
        {provide: ToDatePipe, useClass: ToDatePipe},
        {provide: DatePipe, useClass: DatePipe},
        {provide: AppDefaults, useClass: AppDefaults}
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-slider',
    widgetSelector: '[wmSlider]',
    testModuleDef: testModuleDef,
    testComponent: SliderWrapperComponent,
    inputElementSelector: 'input.range-input'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();
