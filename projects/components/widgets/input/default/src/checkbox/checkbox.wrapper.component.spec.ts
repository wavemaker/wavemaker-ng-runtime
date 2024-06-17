import {Component, ViewChild} from "@angular/core";
import {CheckboxComponent} from "./checkbox.component";
import {waitForAsync, ComponentFixture} from "@angular/core/testing";
import {compileTestComponent, getHtmlSelectorElement} from "../../../../../base/src/test/util/component-test-util";
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../../base/src/test/common-widget.specs";
import {FormsModule} from "@angular/forms";
import {AbstractI18nService, App, AppDefaults} from "@wm/core";
import { CheckboxsetComponent } from "../checkboxset/checkboxset.component";
import { check } from "yargs";
import { ToDatePipe } from "@wm/components/base";
import { DatePipe } from "@angular/common";
import { MockAbstractI18nService } from "projects/components/base/src/test/util/date-test-util";

let mockApp = {
    subscribe: () => { return () => {}}
};

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

const checkboxSetMarkup = `<div wmCheckboxset hint="checkbox" caption="Label" required itemsperrow="3" name="checkbox1" tabindex="1"></div>`;
@Component({
    template: checkboxSetMarkup
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
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();

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