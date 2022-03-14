import {Component, ViewChild} from "@angular/core";
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../../base/src/test/common-widget.specs";
import {HtmlDirective} from "./html.directive";
import {App} from "@wm/core";
import {SanitizePipe} from "@wm/components/base";

let mockApp = {};

const markup = `<div wmHtml #wm_html2="wmHtml" [attr.aria-label]="wm_html2.hint || 'HTML content'" hint="Html content"  name="html1">`;

@Component({
    template: markup
})

class HtmlWrapperDirective {
    @ViewChild(HtmlDirective, /* TODO: add static flag */ {static: true}) wmComponent: HtmlDirective
}

const testModuleDef: ITestModuleDef = {
    imports: [],
    declarations: [HtmlWrapperDirective, HtmlDirective],
    providers: [
        {provide: App, useValue: mockApp},
        {provide: SanitizePipe, useClass: SanitizePipe},
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-html',
    widgetSelector: '[wmHtml]',
    testModuleDef: testModuleDef,
    testComponent: HtmlWrapperDirective,
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();
