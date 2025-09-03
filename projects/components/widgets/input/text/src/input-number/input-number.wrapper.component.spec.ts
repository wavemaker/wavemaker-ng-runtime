import { Component, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { App, AppDefaults } from "@wm/core";
import { ToDatePipe } from "@wm/components/base";
import { DatePipe } from "@angular/common";
import {
    ComponentTestBase,
    ITestComponentDef,
    ITestModuleDef
} from "../../../../../base/src/test/common-widget.specs";
import { IMaskModule } from "angular-imask";
import { InputNumberComponent } from "./input-number.component";
import { ComponentFixture } from "@angular/core/testing";
import { compileTestComponent, mockApp } from "projects/components/base/src/test/util/component-test-util";


const markup = `<wm-input type="number" name="text1" hint="number field">`;

@Component({
    template: markup
})

class InputNumberWrapperComponent {
    @ViewChild(InputNumberComponent, { static: true }) wmComponent: InputNumberComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule, IMaskModule, InputNumberComponent],
    declarations: [InputNumberWrapperComponent],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AppDefaults, useClass: AppDefaults }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-input',
    widgetSelector: '[wmInput]',
    testModuleDef: testModuleDef,
    testComponent: InputNumberWrapperComponent,
    inputElementSelector: 'input.app-textbox'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyAccessibility();

describe('InputNumberComponent', () => {
    let wrapperComponent: InputNumberWrapperComponent;
    let inputNumberComponent: InputNumberComponent;
    let fixture: ComponentFixture<InputNumberWrapperComponent>;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, InputNumberWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        inputNumberComponent = wrapperComponent.wmComponent;
        fixture.detectChanges();
    });
    it('should create the InputNumberComponent', () => {
        expect(wrapperComponent).toBeTruthy();
    });

    it('should trigger onArrowPress method', () => {
        inputNumberComponent.step = 0;
        fixture.detectChanges();

        const onArrowPressSpyOn = jest.spyOn(inputNumberComponent, 'onArrowPress');
        const inputElement = fixture.nativeElement.querySelector('input');
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        inputElement.dispatchEvent(event);
        fixture.detectChanges();

        expect(onArrowPressSpyOn).toHaveBeenCalled();
    });

    it('should validateInputEntry method called on keypress', () => {
        const validateInputEntrySpyOn = jest.spyOn(inputNumberComponent, 'validateInputEntry');
        const inputElement = fixture.nativeElement.querySelector('input');
        inputElement.value = '1';
        const event = new KeyboardEvent('keypress', { key: '1' });
        inputElement.dispatchEvent(event);

        fixture.detectChanges();
        expect(validateInputEntrySpyOn).toHaveBeenCalled();
    });
    it('should return false when "e" is pressed and "e" already exists in the input', () => {
        const event = {
          key: 'e',
          target: { value: 'test' }
        };
        const result = inputNumberComponent.validateInputEntry(event);
        expect(result).toBe(false);
      });

    it('should allow "e" when it is not in the value', () => {
        const inputElement = fixture.nativeElement.querySelector('input');
        inputElement.value = '123';
        fixture.detectChanges();

        const event = new KeyboardEvent('keypress', { key: 'e' });
        Object.defineProperty(event, 'target', { writable: false, value: inputElement });

        const result = inputNumberComponent.validateInputEntry(event);
        expect(result).toBeUndefined();
    });

    it('should prevent default when step is 0', () => {
        const event = {
          preventDefault: jest.fn()
        };
        inputNumberComponent.step = 0;
        inputNumberComponent.onArrowPress(event);
        expect(event.preventDefault).toHaveBeenCalled();
      });
    
      it('should not prevent default when step is not 0', () => {
        const event = {
          preventDefault: jest.fn()
        };
        inputNumberComponent.step = 1;
        inputNumberComponent.onArrowPress(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
      });
});
