import {Component, ViewChild} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {App, AppDefaults} from "@wm/core";
import {ToDatePipe} from "@wm/components/base";
import {DatePipe} from "@angular/common";
import {
    ComponentTestBase,
    ITestComponentDef,
    ITestModuleDef
} from "../../../../../../base/src/test/common-widget.specs";
import {IMaskModule} from "angular-imask";
import {InputNumberComponent} from "./input-number.component";
import { ComponentFixture } from "@angular/core/testing";
import { compileTestComponent } from "projects/components/base/src/test/util/component-test-util";

let mockApp = {
    subscribe: () => { return () => {}}
};

const markup = `<wm-input type="number" name="text1" hint="number field">`;

@Component({
    template: markup
})

class InputNumberWrapperComponent {
    @ViewChild(InputNumberComponent, /* TODO: add static flag */ {static: true}) wmComponent: InputNumberComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule, IMaskModule],
    declarations: [InputNumberWrapperComponent, InputNumberComponent],
    providers: [
        {provide: App, useValue: mockApp},
        {provide: ToDatePipe, useClass: ToDatePipe},
        {provide: DatePipe, useClass: DatePipe},
        {provide: AppDefaults, useClass: AppDefaults}
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
    
});