import { Component, ViewChild } from "@angular/core";
import { ColorPickerComponent } from "./color-picker.component";
import { FormsModule } from "@angular/forms";
import { addClass, App, removeClass } from "@wm/core";
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../base/src/test/common-widget.specs";
import { ColorPickerDirective } from "ngx-color-picker";
import { AUTOCLOSE_TYPE } from "@wm/components/base";
import { compileTestComponent, mockApp } from "projects/components/base/src/test/util/component-test-util";
import { ComponentFixture } from "@angular/core/testing";

jest.mock("@wm/core", () => ({
    ...jest.requireActual("@wm/core"),
    addClass: jest.fn(),
    removeClass: jest.fn(),
}));

const markup = `<div wmColorPicker name="colorpicker1" hint="colorpicker" tabindex="1">`;

@Component({
    template: markup
})

class ColorPickerWrapperComponent {
    @ViewChild(ColorPickerComponent, { static: true }) wmComponent: ColorPickerComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule, ColorPickerDirective, ColorPickerComponent],
    declarations: [ColorPickerWrapperComponent],
    providers: [
        { provide: App, useValue: mockApp },
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-colorpicker',
    widgetSelector: '[wmColorPicker]',
    testModuleDef: testModuleDef,
    testComponent: ColorPickerWrapperComponent,
    inputElementSelector: 'input.app-textbox'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();

describe('wm-colorpicker: Component Specific Tests', () => {
    let wrapperComponent: ColorPickerWrapperComponent;
    let wmComponent: ColorPickerComponent;
    let fixture: ComponentFixture<ColorPickerWrapperComponent>;

    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, ColorPickerWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        wmComponent = wrapperComponent.wmComponent;
        fixture.detectChanges();

        // Clear mock calls before each test
        (addClass as jest.Mock).mockClear();
        (removeClass as jest.Mock).mockClear()
    });

    it('should create color picker component', () => {
        expect(wrapperComponent).toBeTruthy();
        expect(wmComponent).toBeTruthy();
    });

    it('should handle color picker open', () => {
        wmComponent.autoclose = AUTOCLOSE_TYPE.ALWAYS;
        const container = document.createElement('div');
        container.classList.add('color-picker');
        wmComponent.nativeElement.appendChild(container);

        wmComponent.cpDirective = { closeDialog: jest.fn() } as any;

        wmComponent.colorPickerOpen('');
        container.click();

        expect(wmComponent.cpDirective.closeDialog).toHaveBeenCalled();
    });

    it('should open color picker', () => {
        wmComponent.cpDirective = { openDialog: jest.fn() } as any;
        wmComponent.open();
        expect(wmComponent.cpDirective.openDialog).toHaveBeenCalled();
    });

    it('should close color picker', () => {
        wmComponent.cpDirective = { closeDialog: jest.fn() } as any;
        wmComponent.close();
        expect(wmComponent.cpDirective.closeDialog).toHaveBeenCalled();
    });

    it('should handle change event', () => {
        jest.spyOn(wmComponent, 'invokeOnChange');
        wmComponent.ngModel = { valid: true } as any;
        wmComponent.handleChange(true);
        expect(wmComponent.invokeOnChange).toHaveBeenCalledWith(wmComponent.datavalue, { type: 'change' }, true);
    });

    it('should handle property change for datavalue', () => {
        jest.spyOn(wmComponent as any, '_onChange');
        (wmComponent as any).onPropertyChange('datavalue', '#ff0000', '#000000');
        expect((wmComponent as any)._onChange).toHaveBeenCalledWith('#ff0000');
    });

    it('should handle property change for required', () => {
        jest.spyOn(wmComponent as any, '_onChange');
        (wmComponent as any).onPropertyChange('required', true, false);
        expect((wmComponent as any)._onChange).toHaveBeenCalledWith(wmComponent.datavalue);
    });

    describe('handleEvent', () => {
        let superHandleEvent: jest.SpyInstance;

        beforeEach(() => {
            // Mock the super.handleEvent method
            superHandleEvent = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(wmComponent)), 'handleEvent');

            // Mock the inputEl
            wmComponent['inputEl'] = { nativeElement: document.createElement('input') } as any;
        });

        afterEach(() => {
            superHandleEvent.mockRestore();
        });

        it('should not call super.handleEvent for "change" event', () => {
            const mockCallback = jest.fn();
            const mockLocals = {};

            (wmComponent as any).handleEvent(document.createElement('div'), 'change', mockCallback, mockLocals);

            expect(superHandleEvent).not.toHaveBeenCalled();
        });

        it('should not call super.handleEvent for "blur" event', () => {
            const mockCallback = jest.fn();
            const mockLocals = {};

            (wmComponent as any).handleEvent(document.createElement('div'), 'blur', mockCallback, mockLocals);

            expect(superHandleEvent).not.toHaveBeenCalled();
        });

        it('should call super.handleEvent for events other than "change" and "blur"', () => {
            const mockCallback = jest.fn();
            const mockLocals = {};

            (wmComponent as any).handleEvent(document.createElement('div'), 'click', mockCallback, mockLocals);

            expect(superHandleEvent).toHaveBeenCalledWith(
                wmComponent['inputEl'].nativeElement,
                'click',
                mockCallback,
                mockLocals
            );
        });
    });

    describe('colorPickerToggleChange', () => {
        let mockColorPickerContainer: HTMLElement;

        beforeEach(() => {
            mockColorPickerContainer = document.createElement('div');
            jest.spyOn(wmComponent.nativeElement, 'querySelector').mockReturnValue(mockColorPickerContainer);
        });

        it('should add "hidden" class when isOpen is false', () => {
            wmComponent.colorPickerToggleChange(false);
            expect(addClass).toHaveBeenCalledWith(mockColorPickerContainer, 'hidden');
            expect(removeClass).not.toHaveBeenCalled();
        });

        it('should remove "hidden" class when isOpen is true', () => {
            wmComponent.colorPickerToggleChange(true);
            expect(removeClass).toHaveBeenCalledWith(mockColorPickerContainer, 'hidden');
            expect(addClass).not.toHaveBeenCalled();
        });

        it('should not modify classes if color picker container is not found', () => {
            (wmComponent.nativeElement.querySelector as jest.Mock).mockReturnValue(null);
            wmComponent.colorPickerToggleChange(true);
            expect(addClass).not.toHaveBeenCalled();
            expect(removeClass).not.toHaveBeenCalled();
        });
    });

    describe('onPropertyChange', () => {
        beforeEach(() => {
            jest.spyOn(wmComponent as any, '_onChange');
            jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(wmComponent)), 'onPropertyChange');
        });

        it('should return early for tabindex', () => {
            (wmComponent as any).onPropertyChange('tabindex', 2, 1);
            expect((wmComponent as any)._onChange).not.toHaveBeenCalled();
            expect(Object.getPrototypeOf(Object.getPrototypeOf(wmComponent)).onPropertyChange).not.toHaveBeenCalled();
        });

        describe('autoclose property', () => {
            it('should set outsideclick to true for OUTSIDECLICK', () => {
                (wmComponent as any).onPropertyChange('autoclose', AUTOCLOSE_TYPE.OUTSIDECLICK, AUTOCLOSE_TYPE.DISABLED);
                expect(wmComponent.outsideclick).toBe(true);
                expect(Object.getPrototypeOf(Object.getPrototypeOf(wmComponent)).onPropertyChange).toHaveBeenCalledWith('autoclose', AUTOCLOSE_TYPE.OUTSIDECLICK, AUTOCLOSE_TYPE.DISABLED);
            });

            it('should set outsideclick to true for ALWAYS', () => {
                (wmComponent as any).onPropertyChange('autoclose', AUTOCLOSE_TYPE.ALWAYS, AUTOCLOSE_TYPE.DISABLED);
                expect(wmComponent.outsideclick).toBe(true);
                expect(Object.getPrototypeOf(Object.getPrototypeOf(wmComponent)).onPropertyChange).toHaveBeenCalledWith('autoclose', AUTOCLOSE_TYPE.ALWAYS, AUTOCLOSE_TYPE.DISABLED);
            });

            it('should set outsideclick to false for other values', () => {
                (wmComponent as any).onPropertyChange('autoclose', AUTOCLOSE_TYPE.DISABLED, AUTOCLOSE_TYPE.ALWAYS);
                expect(wmComponent.outsideclick).toBe(false);
                expect(Object.getPrototypeOf(Object.getPrototypeOf(wmComponent)).onPropertyChange).toHaveBeenCalledWith('autoclose', AUTOCLOSE_TYPE.DISABLED, AUTOCLOSE_TYPE.ALWAYS);
            });
        });

        it('should call super.onPropertyChange for other properties', () => {
            (wmComponent as any).onPropertyChange('someOtherProp', 'newValue', 'oldValue');
            expect((wmComponent as any)._onChange).not.toHaveBeenCalled();
            expect(Object.getPrototypeOf(Object.getPrototypeOf(wmComponent)).onPropertyChange).toHaveBeenCalledWith('someOtherProp', 'newValue', 'oldValue');
        });
    });
});
