import { DatePipe } from "@angular/common";
import { Component, ViewChild } from "@angular/core";
import { ComponentFixture, waitForAsync } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { ToDatePipe } from "@wm/components/base";
import { App, AppDefaults, AbstractI18nService } from "@wm/core";
import { ITestModuleDef, ITestComponentDef, ComponentTestBase } from "projects/components/base/src/test/common-widget.specs";
import { mockApp, compileTestComponent, getHtmlSelectorElement } from "projects/components/base/src/test/util/component-test-util";
import { MockAbstractI18nService } from "projects/components/base/src/test/util/date-test-util";
import { CheckboxsetComponent } from "./checkboxset.component";


const markup = `<div wmCheckboxset hint="checkboxset1" caption="Label" required itemsperrow="3" name="checkboxset1" tabindex="1"></div>`;
@Component({
    template: markup
})

class checkboxSetWrapperComponent {
    @ViewChild(CheckboxsetComponent, /* TODO: add static flag */ {static: true}) wmComponent: CheckboxsetComponent
}


const checkboxSetModuleDef: ITestModuleDef = {
    imports: [FormsModule],
    declarations: [checkboxSetWrapperComponent, CheckboxsetComponent],
    providers: [
        {provide: App, useValue: mockApp},
        {provide: ToDatePipe, useClass: ToDatePipe},
        { provide: DatePipe, useClass: DatePipe },
        { provide: AppDefaults, useClass: AppDefaults },
        { provide: AbstractI18nService, useClass: MockAbstractI18nService }
    ]
};

const checkboxSetcomponentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-checkboxset',
    widgetSelector: '[wmCheckboxset]',
    testModuleDef: checkboxSetModuleDef,
    testComponent: checkboxSetWrapperComponent,
    inputElementSelector: 'input'
};

const checkboxTestBase: ComponentTestBase = new ComponentTestBase(checkboxSetcomponentDef);
checkboxTestBase.verifyPropsInitialization();
checkboxTestBase.verifyCommonProperties();
checkboxTestBase.verifyStyles();
checkboxTestBase.verifyAccessibility();

describe('CheckboxSet component', () => {
    let wrapperComponent: checkboxSetWrapperComponent;
    let checkboxsetComponent: CheckboxsetComponent;
    let fixture: ComponentFixture<checkboxSetWrapperComponent>;
    beforeEach(waitForAsync(() => {
        fixture = compileTestComponent(checkboxSetModuleDef, checkboxSetWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        checkboxsetComponent = wrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create checkboxset component', () => {
        expect(wrapperComponent).toBeTruthy();
    });

    it('should have datavalue as false by default', () => {
        expect(checkboxsetComponent.datavalue).toBeFalsy();
    });

    it('should check checkbox  on keyboard enter', () => {
        expect(checkboxsetComponent.datavalue).toBeFalsy();
        const checkboxElement = getHtmlSelectorElement(fixture, '[wmCheckboxset]');
        checkboxElement.triggerEventHandler('keydown.enter', { preventDefault: () => {}});
        fixture.whenStable().then(() => {
            expect(checkboxsetComponent.datavalue).toBeTruthy();
        });
    });
   
});