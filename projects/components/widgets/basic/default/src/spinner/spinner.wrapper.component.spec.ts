import {Component, ViewChild} from "@angular/core";
import {SpinnerComponent} from "./spinner.component";
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../../base/src/test/common-widget.specs";
import {App, AppDefaults} from "@wm/core";
import {ImagePipe, ToDatePipe, TrustAsPipe} from "@wm/components/base";
import {DatePipe} from "@angular/common";

let mockApp = {
    subscribe: () => { return () => {}}
};

const markup = `<div wmSpinner #wm_spinner1="wmSpinner" [attr.aria-label]="wm_spinner1.hint || 'Loading...'" hint="Loading..." name="spinner1">`;

@Component({
    template: markup
})

class SpinnerWrapperComponent {
    @ViewChild(SpinnerComponent, /* TODO: add static flag */ {static: true}) wmComponent: SpinnerComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [],
    declarations: [SpinnerWrapperComponent, SpinnerComponent, ImagePipe, TrustAsPipe],
    providers: [
        {provide: App, useValue: mockApp},
        {provide: ToDatePipe, useClass: ToDatePipe},
        {provide: DatePipe, useClass: DatePipe},
        {provide: AppDefaults, useClass: AppDefaults},
        {provide: ImagePipe, useClass: ImagePipe},
        {provide: TrustAsPipe, useClass: TrustAsPipe}
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-spinner',
    widgetSelector: '[wmSpinner]',
    testModuleDef: testModuleDef,
    testComponent: SpinnerWrapperComponent,
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();
