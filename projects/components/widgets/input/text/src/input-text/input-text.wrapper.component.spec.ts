import { Component, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { App, AppDefaults } from "@wm/core";
import { ToDatePipe } from "@wm/components/base";
import { DatePipe } from "@angular/common";
import { InputTextComponent } from "./input-text.component";
import {
    ComponentTestBase,
    ITestComponentDef,
    ITestModuleDef
} from "../../../../../base/src/test/common-widget.specs";
import { IMaskModule } from "angular-imask";
import { ComponentFixture, fakeAsync, tick } from "@angular/core/testing";
import { compileTestComponent, mockApp } from "projects/components/base/src/test/util/component-test-util";

const markup = `<wm-input name="text1">`;

@Component({
    template: markup,
    standalone: true
})

class InputTextWrapperComponent {
    @ViewChild(InputTextComponent, /* TODO: add static flag */ { static: true }) wmComponent: InputTextComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule, IMaskModule, InputTextComponent],
    declarations: [],
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
    testComponent: InputTextWrapperComponent,
    inputElementSelector: 'input.app-textbox'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyAccessibility();
TestBase.verifyStyles();
TestBase.verifyPropsInitialization();


describe('InputTextComponent', () => {
    let wrapperComponent: InputTextWrapperComponent;
    let component: InputTextComponent;
    let fixture: ComponentFixture<InputTextWrapperComponent>;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, InputTextWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        component = wrapperComponent.wmComponent;
    });

    it('should create the InputTextComponent', () => {
        expect(component).toBeTruthy();
    });
    it('should update maskVal and call checkForDisplayFormat when displayformat changes', () => {
        component.displayformat = '(999) 999-9999';
        const newDisplayFormat = '(999) 999-9999';
        component && component.onPropertyChange('displayformat', newDisplayFormat, '');

        expect(component.maskVal).toBe(newDisplayFormat);
    });
    it('should update lazy when showdisplayformaton changes', () => {
        component && component.onPropertyChange('showdisplayformaton', 'keypress', '');
        expect(component['lazy']).toBe(true);
        component && component.onPropertyChange('showdisplayformaton', 'blur', 'keypress');
        expect(component['lazy']).toBe(false);
    });
    it('should return false when no displayformat is set', () => {
        component.displayformat = '';
        expect(component.mask).toBe(false);
    });
    it('should set isFocused to true on focus event', () => {
        component.displayformat = '(999) 999-9999';
        component.checkForDisplayFormat({ type: 'focus' });
        expect(component.isFocused).toBe(true);
    });

    it('should set isFocused to true when datavalue is present', () => {
        component.displayformat = '(999) 999-9999';
        component.datavalue = '1234567890';
        component.checkForDisplayFormat();
        expect(component.isFocused).toBe(true);
    });

    it('should set isFocused to false when no focus event and no datavalue', () => {
        component.displayformat = '(999) 999-9999';
        component.datavalue = '';
        component.checkForDisplayFormat();
        expect(component.isFocused).toBe(false);
    });

    describe('checkForDisplayFormat', () => {
        beforeEach(() => {
            component.displayformat = '(999) 999-9999';
            component.imask = {
                maskRef: {
                    updateOptions: jest.fn(),
                    value: '',
                    cursorPos: 0,
                    updateCursor: jest.fn()
                }
            } as any;
            component.inputEl = { nativeElement: { value: '' } } as any;
        });
        it('should set isFocused to true on focus event', () => {
            component.checkForDisplayFormat({ type: 'focus' });
            expect(component.isFocused).toBe(true);
        });

        it('should set isFocused to true when datavalue is present', () => {
            component.datavalue = '1234567890';
            component.checkForDisplayFormat();
            expect(component.isFocused).toBe(true);
        });

        it('should set isFocused to false when no focus event and no datavalue', () => {
            component.datavalue = '';
            component.checkForDisplayFormat();
            expect(component.isFocused).toBe(false);
        });

        it('should update maskRef options when not focused and maskRef exists', () => {
            component.isFocused = false;
            component.checkForDisplayFormat();
            expect(component.imask.maskRef.updateOptions).toHaveBeenCalledWith({ lazy: true });
        });

        it('should set maskRef value to datavalue when not focused, no datavalue, and maskRef value exists', () => {
            component.isFocused = false;
            component.datavalue = '';
            component.imask.maskRef.value = 'some value';
            component.checkForDisplayFormat();
            expect(component.imask.maskRef.value).toBe('');
        });

        it('should not update cursor position when enteredMaskVal equals cursorPos', fakeAsync(() => {
            component.isFocused = true;
            component.imask.maskRef.value = '(123) 456-78__';
            component.imask.maskRef.cursorPos = 12;
            component.checkForDisplayFormat();
            tick(51);
            expect(component.imask.maskRef.updateCursor).not.toHaveBeenCalled();
        }));

        it('should update options and input value when displayformat is not set but imask exists', () => {
            component.displayformat = '';
            component.datavalue = '1234567890';
            component.checkForDisplayFormat();
            expect(component.imask.maskRef.updateOptions).toHaveBeenCalledWith({ lazy: true });
            expect(component.inputEl.nativeElement.value).toBe('1234567890');
        });

        it('should do nothing when displayformat is not set and imask does not exist', () => {
            component.displayformat = '';
            component.imask = undefined;
            component.checkForDisplayFormat();
            expect(component.inputEl.nativeElement.value).toBe('');
        });
    });
});
