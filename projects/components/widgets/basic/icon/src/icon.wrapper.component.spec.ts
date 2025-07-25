import {Component, ViewChild} from "@angular/core";
import {IconComponent} from "./icon.component";
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../base/src/test/common-widget.specs";
import {mockApp} from "projects/components/base/src/test/util/component-test-util";
import {App} from "@wm/core";

const markup = `<span wmIcon name="icon1" caption="star" hint="icon"></span>`;

@Component({
    template: markup
})

class IconWrapperComponent {
    @ViewChild(IconComponent, /* TODO: add static flag */ { static: true }) wmComponent: IconComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [IconComponent],
    declarations: [IconWrapperComponent,],
    providers: [
        { provide: App, useValue: mockApp },
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-icon',
    widgetSelector: '[wmIcon]',
    testModuleDef: testModuleDef,
    testComponent: IconWrapperComponent,
    inputElementSelector: 'i'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
