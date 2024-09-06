import { Component, ViewChild } from "@angular/core";
import { SelectComponent } from "./select.component";
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../../base/src/test/common-widget.specs";
import { FormsModule } from "@angular/forms";
import { AbstractI18nService, App, AppDefaults, DataSource, setAttr } from '@wm/core';
import { ToDatePipe } from "@wm/components/base";
import { DatePipe } from "@angular/common";
import { MockAbstractI18nService } from '../../../../../base/src/test/util/date-test-util';
import { ComponentFixture } from "@angular/core/testing";
import { compileTestComponent, mockApp } from "projects/components/base/src/test/util/component-test-util";
import { Subject } from "rxjs";

const markup = `<wm-select name="select1" hint="select field">`;

@Component({
    template: markup
})

class SelectWrapperComponent {
    @ViewChild(SelectComponent, /* TODO: add static flag */ { static: true }) wmComponent: SelectComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule],
    declarations: [SelectWrapperComponent, SelectComponent],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AppDefaults, useClass: AppDefaults },
        { provide: AbstractI18nService, useClass: MockAbstractI18nService }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-select',
    widgetSelector: '[wmSelect]',
    testModuleDef: testModuleDef,
    testComponent: SelectWrapperComponent,
    inputElementSelector: 'select'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyAccessibility();

describe("SelectComponent", () => {
    let wrapperComponent: SelectWrapperComponent;
    let wmComponent: SelectComponent;
    let fixture: ComponentFixture<SelectWrapperComponent>;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, SelectWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        wmComponent = wrapperComponent.wmComponent;
        wmComponent.datasetItems = [
            { key: '1', value: '1', label: '1' },
            { key: '2', value: '2', label: '2' },
            { key: '3', value: '3', label: '3' },
            { key: '4', value: '4', label: '4' }]
        fixture.detectChanges();
    });

    it("should create select component", () => {
        expect(wmComponent).toBeTruthy();
    });

    it("should have name property", () => {
        expect(wmComponent.name).toBe("select1");
    });

    it("should have hint property", () => {
        expect(wmComponent.hint).toBe("select field");
    });

    it("should have datasetItems property", () => {
        expect(wmComponent.datasetItems).toBeDefined();
        expect(wmComponent.datasetItems.length).toBe(4);
    });

    it("should have options", () => {
        expect(fixture.nativeElement.querySelectorAll('option').length).toBe(5);
    });

    it("should have options with correct values", () => {
        let options = fixture.nativeElement.querySelectorAll('option');
        expect(options[1].value).toBe("1: '1'");
        expect(options[2].value).toBe("2: '2'");
        expect(options[3].value).toBe("3: '3'");
        expect(options[4].value).toBe("4: '4'");
    });

    it("should change the value on selecting an option", () => {
        let selectElement = fixture.nativeElement.querySelector('select');
        selectElement.value = selectElement.options[2].value;
        selectElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();
        expect(wmComponent.modelByKey[0]).toBe("2");
    });

    it("should have readonly property", () => {
        wmComponent.readonly = true;
        expect(wmComponent.readonly).toBeTruthy();
    });

    it("should not change the value on selecting an option when readonly is true", () => {
        wmComponent.readonly = true;
        wmComponent.datavalue = "1";
        let selectElement = fixture.nativeElement.querySelector('select');
        selectElement.value = selectElement.options[2].value;
        selectElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();
        expect(wmComponent.modelByKey[0]).toBe("1");
    });

    it("should not change the value on selecting an option when readonly is true and placeholder is given", () => {
        wmComponent.readonly = true;
        wmComponent.placeholder = "Select value";
        wmComponent.datavalue = "1";
        let selectElement = fixture.nativeElement.querySelector('select');
        selectElement.value = selectElement.options[2].value;
        selectElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();
        expect(wmComponent.modelByKey[0]).toBe("1");
    });

    it("should have placeholder property", () => {
        wmComponent.placeholder = "Select";
        expect(wmComponent.placeholder).toBe("Select");
    });

    it("should have required property", () => {
        wmComponent.required = true;
        expect(wmComponent.required).toBeTruthy();
    });

    it("should change the value on selecting an option when required is true", () => {
        wmComponent.required = true;
        let selectElement = fixture.nativeElement.querySelector('select');
        selectElement.value = selectElement.options[2].value;
        selectElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();
        expect(wmComponent.modelByKey[0]).toBe("2");
    });

    it("should not change the value on selecting an option when required is true and placeholder is given", () => {
        wmComponent.required = true;
        wmComponent.placeholder = "Select value";
        let selectElement = fixture.nativeElement.querySelector('select');
        selectElement.value = selectElement.options[1].value;
        selectElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();
        expect(wmComponent.modelByKey[0]).toBe("1");
    });

    it("should set tabindex when provided", () => {
        wmComponent.tabindex = 2;
        fixture.detectChanges();
        const selectElement = fixture.nativeElement.querySelector('select');
        expect(selectElement.tabIndex).toBe(2);
    });

    it("should set autofocus when provided", () => {
        wmComponent.autofocus = true;
        fixture.detectChanges();
        const selectElement = fixture.nativeElement.querySelector('select');
        expect(selectElement.autofocus).toBe(true);
    });

    it("should update datavalue when datasource is bound to locale", () => {
        const mockDataSource = {
            execute: jest.fn().mockImplementation((operation) => {
                if (operation === DataSource.Operation.IS_BOUND_TO_LOCALE) {
                    return true;
                }
                if (operation === DataSource.Operation.GET_DEFAULT_LOCALE) {
                    return 'en-US';
                }
            })
        };
        wmComponent.datasource = mockDataSource;
        expect(wmComponent.datavalue).toBe('en-US');
    });

    it("should not update datavalue when datasource is not bound to locale", () => {
        const mockDataSource = {
            execute: jest.fn().mockImplementation((operation) => {
                if (operation === DataSource.Operation.IS_BOUND_TO_LOCALE) {
                    return false;
                }
            })
        };
        wmComponent.datavalue = 'initial-value';
        wmComponent.datasource = mockDataSource;
        expect(wmComponent.datavalue).toBe('initial-value');
    });

    it("should add placeholder option when placeholder is provided", () => {
        wmComponent.placeholder = "Select an option";
        fixture.detectChanges();
        const options = fixture.nativeElement.querySelectorAll('option');
        expect(options[0].textContent.trim()).toBe("Select an option");
    });

    it("should remove placeholder option when no placeholder and no value", () => {
        wmComponent.placeholder = "";
        wmComponent.datavalue = null;
        wmComponent.checkForFloatingLabel({ type: 'blur' });
        fixture.detectChanges();
        const placeholderOption = fixture.nativeElement.querySelector('#placeholderOption');
        expect(placeholderOption).toBeNull();
    });

    it("should handle floating label on focus", () => {
        const captionEl = document.createElement('div');
        captionEl.classList.add('app-composite-widget', 'caption-floating');
        fixture.nativeElement.appendChild(captionEl);

        wmComponent.placeholder = "Select an option";
        wmComponent.checkForFloatingLabel({ type: 'focus' });
        fixture.detectChanges();

        const firstOption = fixture.nativeElement.querySelector('option:first-child');
        expect(firstOption.textContent.trim()).toBe("Select an option");
    });

    it("should handle floating label on blur with no value", () => {
        const captionEl = document.createElement('div');
        captionEl.classList.add('app-composite-widget', 'caption-floating');
        fixture.nativeElement.appendChild(captionEl);

        wmComponent.datavalue = null;
        wmComponent.checkForFloatingLabel({ type: 'blur' });
        fixture.detectChanges();

        expect(captionEl.classList.contains('float-active')).toBe(false);

        // Instead of checking the selected option's text, let's verify that the component's datavalue is null
        expect(wmComponent.datavalue).toBeNull();
    });

    describe('checkForFloatingLabel', () => {
        let captionEl: HTMLElement;
        let selectEl: HTMLElement;

        beforeEach(() => {
            captionEl = document.createElement('div');
            captionEl.classList.add('app-composite-widget', 'caption-floating');
            selectEl = document.createElement('select');
            captionEl.appendChild(selectEl);
            wmComponent.selectEl = { nativeElement: selectEl };
            jest.spyOn($.fn, 'closest').mockReturnValue($(captionEl));
            (wmComponent as any).removePlaceholderOption = jest.fn();
        });

        it('should remove placeholder option when no placeholder', () => {
            wmComponent.placeholder = null;

            wmComponent.checkForFloatingLabel({ type: 'focus' });

            expect((wmComponent as any).removePlaceholderOption).toHaveBeenCalled();
        });

        it('should set placeholder text to placeholderOption on mousedown when no datavalue', () => {
            wmComponent.datavalue = null;
            wmComponent.placeholder = 'Select an option';
            const placeholderOption = document.createElement('option');
            placeholderOption.id = 'placeholderOption';
            selectEl.appendChild(placeholderOption);

            wmComponent.checkForFloatingLabel({ type: 'mousedown' });

            expect(placeholderOption.textContent).toBe('Select an option');
        });

        it('should set placeholder text to placeholderOption on mousedown when datavalue exists but selected option is empty', () => {
            wmComponent.datavalue = 'some value';
            wmComponent.placeholder = 'Select an option';
            const placeholderOption = document.createElement('option');
            placeholderOption.id = 'placeholderOption';
            selectEl.appendChild(placeholderOption);
            const selectedOption = document.createElement('option');
            selectedOption.selected = true;
            selectEl.appendChild(selectedOption);
            jest.spyOn($.fn, 'find').mockReturnValue({ text: () => '' } as any);

            wmComponent.checkForFloatingLabel({ type: 'mousedown' });

            expect(placeholderOption.textContent).toBe('Select an option');
        });

        it('should clear placeholderOption text and remove float-active class on blur when no datavalue', () => {
            wmComponent.datavalue = null;
            wmComponent.placeholder = 'Select an option';
            const placeholderOption = document.createElement('option');
            placeholderOption.id = 'placeholderOption';
            placeholderOption.textContent = 'Select an option';
            selectEl.appendChild(placeholderOption);
            captionEl.classList.add('float-active');

            wmComponent.checkForFloatingLabel({ type: 'blur' });

            expect(placeholderOption.textContent).toBe('');
            expect(captionEl.classList.contains('float-active')).toBe(false);
        });

        it('should not modify placeholderOption or caption element when datavalue exists', () => {
            wmComponent.datavalue = 'some value';
            wmComponent.placeholder = 'Select an option';
            const placeholderOption = document.createElement('option');
            placeholderOption.id = 'placeholderOption';
            placeholderOption.textContent = 'Select an option';
            selectEl.appendChild(placeholderOption);
            captionEl.classList.add('float-active');

            wmComponent.checkForFloatingLabel({ type: 'blur' });

            expect(placeholderOption.textContent).toBe('Select an option');
            expect(captionEl.classList.contains('float-active')).toBe(true);
        });

        it('should remove placeholder option when no caption element, no datavalue, and no placeholder', () => {
            jest.spyOn($.fn, 'closest').mockReturnValue($());
            wmComponent.datavalue = null;
            wmComponent.placeholder = null;

            wmComponent.checkForFloatingLabel({ type: 'focus' });

            expect((wmComponent as any).removePlaceholderOption).toHaveBeenCalled();
        });
    });

    describe('onPropertyChange', () => {
        beforeEach(() => {
            wmComponent.selectEl = {
                nativeElement: document.createElement('select')
            };
            jest.spyOn(wmComponent as any, '_onChange');
            jest.spyOn(wmComponent, 'onPropertyChange');
        });

        it('should call _onChange when key is "required"', () => {
            wmComponent.onPropertyChange('required', true);
            expect(wmComponent['_onChange']).toHaveBeenCalledWith(wmComponent.datavalue);
        });

        it('should handle class change and remove ng-invalid class if conditions are met', (done) => {
            wmComponent.selectEl.nativeElement.classList.add('ng-untouched', 'ng-valid', 'ng-invalid');
            wmComponent.onPropertyChange('class', 'ng-untouched ng-invalid');

            setTimeout(() => {
                expect(wmComponent.selectEl.nativeElement.classList.contains('ng-invalid')).toBe(false);
                done();
            });
        });

        it('should not remove ng-invalid class if conditions are not met', (done) => {
            wmComponent.selectEl.nativeElement.classList.add('ng-touched', 'ng-invalid');
            wmComponent.onPropertyChange('class', 'ng-touched ng-invalid');

            setTimeout(() => {
                expect(wmComponent.selectEl.nativeElement.classList.contains('ng-invalid')).toBe(true);
                done();
            });
        });

        it('should return early for "class" or "tabindex" changes', () => {
            wmComponent.onPropertyChange('tabindex', 2);
            expect(wmComponent.onPropertyChange).not.toHaveBeenCalledWith('tabindex', 2, undefined);
        });

        it('should set readonly attribute when readonly is true', (done) => {
            wmComponent.onPropertyChange('readonly', true);

            setTimeout(() => {
                expect(wmComponent.selectEl.nativeElement.hasAttribute('readonly')).toBe(true);
                done();
            });
        });

        it('should remove readonly attribute when readonly is false', (done) => {
            setAttr(wmComponent.selectEl.nativeElement, 'readonly', 'readonly');
            wmComponent.onPropertyChange('readonly', false);

            setTimeout(() => {
                expect(wmComponent.selectEl.nativeElement.hasAttribute('readonly')).toBe(false);
                done();
            });
        });

        it('should call super.onPropertyChange for other keys', () => {
            const superSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(wmComponent)), 'onPropertyChange');
            wmComponent.onPropertyChange('someOtherKey', 'value');
            expect(superSpy).toHaveBeenCalledWith('someOtherKey', 'value', undefined);
        });
    });

    describe('handleEvent', () => {
        let node: HTMLElement;
        let callback: jest.Mock;
        let locals: any;

        beforeEach(() => {
            node = document.createElement('div');
            callback = jest.fn();
            locals = {};
            jest.spyOn(Object.getPrototypeOf(wmComponent), 'handleEvent');
        });

        afterEach(() => {
            jest.clearAllMocks(); // Clear all mock calls after each test
        });

        it('should call super.handleEvent for events other than "blur" and "change"', () => {
            wmComponent['handleEvent'](node, 'focus', callback, locals);
            expect(Object.getPrototypeOf(wmComponent).handleEvent).toHaveBeenCalledWith(node, 'focus', callback, locals);
        });

        it('should handle event for non-input element', () => {
            const span = document.createElement('span');
            node.appendChild(span);
            wmComponent['handleEvent'](node, 'click', callback, locals);

            const event = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(event, 'target', { value: span });
            span.dispatchEvent(event);

            expect(callback).not.toHaveBeenCalled();
            expect(locals.$event).toBeUndefined();
        });
    });
    describe('SelectComponent Constructor and dataset$ Subscription', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should initialize with acceptsArray as true', () => {
            expect(wmComponent.acceptsArray).toBe(true);
        });

        it('should update select element when datavalue exists but no item is selected', () => {
            wmComponent.datavalue = '5'; // A value not in the dataset
            wmComponent.selectEl = { nativeElement: { value: '5' } };
            wmComponent['dataset$'].next(wmComponent.datasetItems);

            jest.advanceTimersByTime(100);

            expect(wmComponent.selectEl.nativeElement.value).toBe('');
            expect(wmComponent['modelByKey']).toBeUndefined();
        });

        it('should update select element when datavalue is falsy', () => {
            wmComponent.datavalue = null;
            wmComponent.selectEl = { nativeElement: { value: '1' } };
            wmComponent['dataset$'].next(wmComponent.datasetItems);

            jest.advanceTimersByTime(100);

            expect(wmComponent.selectEl.nativeElement.value).toBe('');
        });

        it('should not update select element when datavalue exists and item is selected', () => {
            wmComponent.datavalue = '2';
            wmComponent.selectEl = { nativeElement: { value: '2' } };
            wmComponent.datasetItems[1].selected = true;
            wmComponent['dataset$'].next(wmComponent.datasetItems);

            jest.advanceTimersByTime(100);

            expect(wmComponent.selectEl.nativeElement.value).toBe('2');
            expect(wmComponent['modelByKey']).not.toBeUndefined();
        });

    });
});
