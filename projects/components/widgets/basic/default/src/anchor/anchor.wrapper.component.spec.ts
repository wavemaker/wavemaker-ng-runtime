import {Component, ViewChild} from "@angular/core";
import {AnchorComponent} from "./anchor.component";
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../../base/src/test/common-widget.specs";
import {ComponentsTestModule} from "../../../../../base/src/test/components.test.module";

const markup = `<a wmAnchor data-identifier="anchor" #wm_anchor1="wmAnchor" [attr.aria-label]="wm_anchor1.hint || wm_anchor1.caption || 'Link'" hint="Link" tabindex="0" badgevalue="" name="anchor1"></a>`;

@Component({
    template: markup
})

class AnchorWrapperComponent {
    @ViewChild(AnchorComponent, /* TODO: add static flag */ {static: true}) wmComponent: AnchorComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [ComponentsTestModule],
    declarations: [AnchorWrapperComponent, AnchorComponent],
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-anchor',
    widgetSelector: '[wmAnchor]',
    testModuleDef: testModuleDef,
    testComponent: AnchorWrapperComponent,
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();
