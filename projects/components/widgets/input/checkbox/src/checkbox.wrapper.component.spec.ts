import { Component, ElementRef, ViewChild } from "@angular/core";
import { CheckboxComponent, unStringify } from "./checkbox.component";
import { waitForAsync, ComponentFixture } from "@angular/core/testing";
import { compileTestComponent, getHtmlSelectorElement, mockApp } from "../../../../base/src/test/util/component-test-util";
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../base/src/test/common-widget.specs";
import { mockApp } from "projects/components/base/src/test/util/component-test-util";
import { App } from "@wm/core";
import { FormsModule } from "@angular/forms";
import { App } from "@wm/core";

const markup = `<div wmCheckbox hint="checkbox" caption="Label" name="checkbox1" tabindex="1"></div>`;

@Component({
    template: markup,
    standalone: true
})

class CheckboxWrapperComponent {
    @ViewChild(CheckboxComponent, /* TODO: add static flag */ { static: true }) wmComponent: CheckboxComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule, CheckboxComponent,],
    declarations: [],
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
        if (checkboxComponent) {
            fixture.detectChanges();
        }
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

    describe('handleEvent', () => {
        let mockNativeElement: { querySelector: jest.Mock };
        let mockCheckboxEl: { nativeElement: HTMLElement };
        let mockCallback: jest.Mock;
        let mockLocals: any;

        beforeEach(() => {
            mockNativeElement = {
                querySelector: jest.fn().mockReturnValue(document.createElement('label'))
            };
            mockCheckboxEl = {
                nativeElement: document.createElement('input')
            };
            mockCallback = jest.fn();
            mockLocals = {};

            (checkboxComponent as any)['nativeElement'] = mockNativeElement as any;
            checkboxComponent['checkboxEl'] = mockCheckboxEl as any;

            // Mock the super.handleEvent method
            jest.spyOn(Object.getPrototypeOf(CheckboxComponent.prototype), 'handleEvent').mockImplementation();
        });

        it('should not call super.handleEvent for "change" event', () => {
            checkboxComponent['handleEvent'](document.createElement('div'), 'change', mockCallback, mockLocals);

            expect(Object.getPrototypeOf(CheckboxComponent.prototype).handleEvent).not.toHaveBeenCalled();
        });

        it('should not call super.handleEvent for "blur" event', () => {
            checkboxComponent['handleEvent'](document.createElement('div'), 'blur', mockCallback, mockLocals);

            expect(Object.getPrototypeOf(CheckboxComponent.prototype).handleEvent).not.toHaveBeenCalled();
        });

        it('should call super.handleEvent with label element for "tap" event', () => {
            const mockNode = document.createElement('div');
            checkboxComponent['handleEvent'](mockNode, 'tap', mockCallback, mockLocals);

            expect(mockNativeElement.querySelector).toHaveBeenCalledWith('label');
            expect(Object.getPrototypeOf(CheckboxComponent.prototype).handleEvent)
                .toHaveBeenCalledWith(expect.any(HTMLLabelElement), 'tap', mockCallback, mockLocals);
        });

        it('should call super.handleEvent with checkbox element for other events', () => {
            const mockNode = document.createElement('div');
            checkboxComponent['handleEvent'](mockNode, 'click', mockCallback, mockLocals);

            expect(Object.getPrototypeOf(CheckboxComponent.prototype).handleEvent)
                .toHaveBeenCalledWith(mockCheckboxEl.nativeElement, 'click', mockCallback, mockLocals);
        });
    });


    describe('datavalue', () => {
        beforeEach(() => {
            checkboxComponent['_checkedvalue'] = 'checked';
            checkboxComponent['_uncheckedvalue'] = 'unchecked';
            jest.spyOn((checkboxComponent as any), 'updatePrevDatavalue');
        });

        describe('getter', () => {
            it('should return _checkedvalue when proxyModel is true', () => {
                checkboxComponent['proxyModel'] = true;
                expect(checkboxComponent.datavalue).toBe('checked');
            });

            it('should return _uncheckedvalue when proxyModel is false', () => {
                checkboxComponent['proxyModel'] = false;
                expect(checkboxComponent.datavalue).toBe('unchecked');
            });

            it('should return undefined when proxyModel is undefined', () => {
                checkboxComponent['proxyModel'] = undefined;
                expect(checkboxComponent.datavalue).toBeUndefined();
            });
        });

        describe('setter', () => {
            it('should set proxyModel to true when value equals _checkedvalue', () => {
                checkboxComponent.datavalue = 'checked';
                expect(checkboxComponent['proxyModel']).toBe(true);
                expect(checkboxComponent['updatePrevDatavalue']).toHaveBeenCalledWith('checked');
            });

            it('should set proxyModel to false when value equals _uncheckedvalue', () => {
                checkboxComponent.datavalue = 'unchecked';
                expect(checkboxComponent['proxyModel']).toBe(false);
                expect(checkboxComponent['updatePrevDatavalue']).toHaveBeenCalledWith('unchecked');
            });

            it('should set proxyModel to undefined when value is undefined', () => {
                checkboxComponent.datavalue = undefined;
                expect(checkboxComponent['proxyModel']).toBeUndefined();
                expect(checkboxComponent['updatePrevDatavalue']).toHaveBeenCalledWith(undefined);
            });

            it('should set proxyModel to undefined when value is an empty string', () => {
                checkboxComponent.datavalue = '';
                expect(checkboxComponent['proxyModel']).toBeUndefined();
                expect(checkboxComponent['updatePrevDatavalue']).toHaveBeenCalledWith(undefined);
            });

            it('should set proxyModel to false when value is defined but not equal to _checkedvalue', () => {
                checkboxComponent.datavalue = 'some other value';
                expect(checkboxComponent['proxyModel']).toBe(false);
                expect(checkboxComponent['updatePrevDatavalue']).toHaveBeenCalledWith('unchecked');
            });
        });
    });
});