import {Component, ViewChild} from "@angular/core";
import {IconComponent} from "./icon.component";
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../../base/src/test/common-widget.specs";
import {ComponentsTestModule} from "../../../../../base/src/test/components.test.module";

const markup = `<span wmIcon name="icon1" caption="star" hint="icon"></span>`;

@Component({
    template: markup
})

class IconWrapperComponent {
    @ViewChild(IconComponent, /* TODO: add static flag */ {static: true}) wmComponent: IconComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [ComponentsTestModule],
    declarations: [IconWrapperComponent, IconComponent]
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
TestBase.verifyAccessibility();
