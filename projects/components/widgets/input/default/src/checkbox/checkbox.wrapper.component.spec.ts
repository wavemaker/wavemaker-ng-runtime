import { Component, ElementRef, ViewChild } from "@angular/core";
import { CheckboxComponent, unStringify } from "./checkbox.component";
import { waitForAsync, ComponentFixture } from "@angular/core/testing";
import { compileTestComponent, getHtmlSelectorElement, mockApp } from "../../../../../base/src/test/util/component-test-util";
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../../base/src/test/common-widget.specs";
import { FormsModule } from "@angular/forms";
import { App } from "@wm/core";

const markup = `<div wmCheckbox hint="checkbox" caption="Label" name="checkbox1" tabindex="1"></div>`;

@Component({
    template: markup
})

class CheckboxWrapperComponent {
    @ViewChild(CheckboxComponent, /* TODO: add static flag */ { static: true }) wmComponent: CheckboxComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule],
    declarations: [CheckboxWrapperComponent, CheckboxComponent],
    providers: [
        { provide: App, useValue: mockApp },
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
        checkboxElement.triggerEventHandler('keydown.enter', { preventDefault: () => { } });
        fixture.whenStable().then(() => {
            expect(checkboxComponent.datavalue).toBeTruthy();
        });
    });
    describe('onPropertyChange method', () => {
        beforeEach(() => {
            checkboxComponent['_onChange'] = jest.fn();
            jest.spyOn(Object.getPrototypeOf(CheckboxComponent.prototype), 'onPropertyChange').mockImplementation(() => { });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should not call _onChange when key is tabindex', () => {
            checkboxComponent.onPropertyChange('tabindex', '2', '1');
            expect(checkboxComponent['_onChange']).not.toHaveBeenCalled();
        });

        it('should call _onChange when key is required', () => {
            checkboxComponent.onPropertyChange('required', true, false);
            expect(checkboxComponent['_onChange']).toHaveBeenCalledWith(checkboxComponent.datavalue);
        });

        it('should update _caption when key is caption', () => {
            checkboxComponent.onPropertyChange('caption', 'New Caption', 'Old Caption');
            expect(checkboxComponent['_caption']).toBe('New Caption');

            checkboxComponent.onPropertyChange('caption', '', 'Old Caption');
            expect(checkboxComponent['_caption']).toBe('&nbsp;');
        });

        it('should update _checkedvalue when key is checkedvalue', () => {
            checkboxComponent.onPropertyChange('checkedvalue', 'true', 'false');
            expect(checkboxComponent['_checkedvalue']).toBe(true);
        });

        it('should update _uncheckedvalue when key is uncheckedvalue', () => {
            checkboxComponent.onPropertyChange('uncheckedvalue', 'false', 'true');
            expect(checkboxComponent['_uncheckedvalue']).toBe(false);
        });

        it('should update datavalue and call _onChange when key is datavalue', () => {
            checkboxComponent.onPropertyChange('datavalue', 'true', 'false');
            expect(checkboxComponent.datavalue).toBe(true);
            expect(checkboxComponent['_onChange']).toHaveBeenCalledWith(true);
        });

        it('should call super.onPropertyChange for other keys', () => {
            checkboxComponent.onPropertyChange('someOtherKey', 'newValue', 'oldValue');
            expect(Object.getPrototypeOf(CheckboxComponent.prototype).onPropertyChange)
                .toHaveBeenCalledWith('someOtherKey', 'newValue', 'oldValue');
        });
    });
    describe('unStringify function', () => {
        it('should return defaultVal when input is null', () => {
            expect(unStringify(null, 'default')).toBe('default');
        });

        it('should return true for true or "true"', () => {
            expect(unStringify(true)).toBe(true);
            expect(unStringify('true')).toBe(true);
        });

        it('should return false for false or "false"', () => {
            expect(unStringify(false)).toBe(false);
            expect(unStringify('false')).toBe(false);
        });

        it('should return a number if the input can be parsed as an integer', () => {
            expect(unStringify('123')).toBe(123);
            expect(unStringify('-456')).toBe(-456);
        });

        it('should return the original value if it cannot be converted', () => {
            expect(unStringify('hello')).toBe('hello');
        });
    });
});