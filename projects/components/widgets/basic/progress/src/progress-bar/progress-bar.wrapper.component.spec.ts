import {Component, ViewChild} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {App} from "@wm/core";
import {ProgressBarComponent} from "./progress-bar.component";
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../../base/src/test/common-widget.specs";

let mockApp = {};

const markup = `<div wmProgressBar name="progress_bar1" hint="Progress bar">`;

@Component({
    template: markup
})

class ProgressBarWrapperComponent {
    @ViewChild(ProgressBarComponent, /* TODO: add static flag */ {static: true}) wmComponent: ProgressBarComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule],
    declarations: [ProgressBarWrapperComponent, ProgressBarComponent],
    providers: [
        {provide: App, useValue: mockApp},
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-progress-bar',
    widgetSelector: '[wmProgressBar]',
    testModuleDef: testModuleDef,
    testComponent: ProgressBarWrapperComponent,
    inputElementSelector: 'div.progress-bar'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();
