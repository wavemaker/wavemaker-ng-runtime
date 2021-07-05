import {Component, ViewChild} from "@angular/core";
import {App} from "@wm/core";
import {IframeComponent} from "./iframe.component";
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../../base/src/test/common-widget.specs";

let mockApp = {};

const markup = `<div wmIframe name="iframe1" iframesrc="//bing.com" hint="iframe"></div>`;

@Component({
    template: markup
})

class IframeWrapperComponent {
    @ViewChild(IframeComponent, /* TODO: add static flag */ {static: true}) wmComponent: IframeComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [],
    declarations: [IframeWrapperComponent, IframeComponent],
    providers: [
        {provide: App, useValue: mockApp},
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-iframe',
    widgetSelector: '[wmIframe]',
    testModuleDef: testModuleDef,
    testComponent: IframeWrapperComponent,
    inputElementSelector: 'iframe'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();
