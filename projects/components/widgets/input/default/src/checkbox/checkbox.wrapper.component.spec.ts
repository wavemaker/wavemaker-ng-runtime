import {Component, ViewChild} from "@angular/core";
import {CheckboxComponent} from "./checkbox.component";
import {waitForAsync, ComponentFixture} from "@angular/core/testing";
import {compileTestComponent, getHtmlSelectorElement, mockApp} from "../../../../../base/src/test/util/component-test-util";
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../../base/src/test/common-widget.specs";
import {FormsModule} from "@angular/forms";
import {App} from "@wm/core";

const markup = `<div wmCheckbox hint="checkbox" caption="Label" name="checkbox1" tabindex="1"></div>`;


@Component({
    template: markup
})

class CheckboxWrapperComponent {
    @ViewChild(CheckboxComponent, /* TODO: add static flag */ {static: true}) wmComponent: CheckboxComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule],
    declarations: [CheckboxWrapperComponent, CheckboxComponent],
    providers: [
        {provide: App, useValue: mockApp},
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-checkbox',
    widgetSelector: '[wmCheckbox]',
    testModuleDef: testModuleDef,
    testComponent: CheckboxWrapperComponent,
    inputElementSelector: 'input'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();

describe('Checkbox component', () => {
    let wrapperComponent: CheckboxWrapperComponent;
    let checkboxComponent: CheckboxComponent;
    let fixture: ComponentFixture<CheckboxWrapperComponent>;
    beforeEach(waitForAsync(() => {
        fixture = compileTestComponent(testModuleDef, CheckboxWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        checkboxComponent = wrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create checkbox component', () => {
        expect(wrapperComponent).toBeTruthy();
    });

    it('should have datavalue as false by default', () => {
        expect(checkboxComponent.datavalue).toBeFalsy();
    });

    it('should check checkbox  on keyboard enter', () => {
        expect(checkboxComponent.datavalue).toBeFalsy();
        const checkboxElement = getHtmlSelectorElement(fixture, '[wmCheckbox]');
        checkboxElement.triggerEventHandler('keydown.enter', { preventDefault: () => {}});
        fixture.whenStable().then(() => {
            expect(checkboxComponent.datavalue).toBeTruthy();
        });
    });
});