import {Component, ViewChild} from "@angular/core";
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../../base/src/test/common-widget.specs";
import {LabelDirective} from "./label.directive";
import {App} from "@wm/core";
import {SanitizePipe} from "@wm/components/base";

let mockApp = {
    subscribe: () => { return () => {}}
};

const markup = `<label wmLabel #wm_label1="wmLabel" [attr.aria-label]="wm_label1.hint || 'Label text'" hint="Label text"  name="label1" paddingright="0.5em" paddingleft="0.5em"></label>
`;

@Component({
    template: markup
})

class LabelWrapperDirective {
    @ViewChild(LabelDirective, /* TODO: add static flag */ {static: true}) wmComponent: LabelDirective
}

const testModuleDef: ITestModuleDef = {
    imports: [],
    declarations: [LabelWrapperDirective, LabelDirective],
    providers: [
        {provide: App, useValue: mockApp},
        {provide: SanitizePipe, useClass: SanitizePipe},
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-label',
    widgetSelector: '[wmLabel]',
    testModuleDef: testModuleDef,
    testComponent: LabelWrapperDirective,
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();
