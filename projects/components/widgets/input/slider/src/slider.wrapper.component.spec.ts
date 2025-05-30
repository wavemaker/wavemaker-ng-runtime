import { Component, ViewChild } from "@angular/core";
import { SliderComponent } from "./slider.component";
import { FormsModule, NgModel } from "@angular/forms";
import { App, AppDefaults } from "@wm/core";
import { ToDatePipe } from "@wm/components/base";
import { DatePipe } from "@angular/common";
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../base/src/test/common-widget.specs";
import { compileTestComponent, mockApp } from "projects/components/base/src/test/util/component-test-util";
import { ComponentFixture } from "@angular/core/testing";

const markup = `<div wmSlider name="slider1" hint="slider" tabindex="1">`;

@Component({
    template: markup
})

class SliderWrapperComponent {
    @ViewChild(SliderComponent, /* TODO: add static flag */ { static: true }) wmComponent: SliderComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule, SliderComponent],
    declarations: [SliderWrapperComponent],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AppDefaults, useClass: AppDefaults }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-slider',
    widgetSelector: '[wmSlider]',
    testModuleDef: testModuleDef,
    testComponent: SliderWrapperComponent,
    inputElementSelector: 'input.range-input'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();

describe('SliderComponent', () => {
    let wrapperComponent: SliderWrapperComponent;
    let component: SliderComponent;
    let fixture: ComponentFixture<SliderWrapperComponent>

    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, SliderWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        component = wrapperComponent.wmComponent;
        component.ngModel = { valid: true } as NgModel;
    });

    it('should create the SliderComponent', () => {
        expect(wrapperComponent).toBeTruthy();
    });
    it('should call invokeOnChange with correct parameters', () => {
        const datavalue = 'test value';
        component.datavalue = datavalue;
        const invokeOnChangeSpy = jest.spyOn(component, 'invokeOnChange');
        component.handleChange(true);
        expect(invokeOnChangeSpy).toHaveBeenCalledWith(
            datavalue,
            { type: 'change' },
            true
        );
    });
    describe('handleEvent', () => {
        let node: HTMLElement;
        let callback: jest.Mock;
        let locals: any;

        beforeEach(() => {
            node = document.createElement('div');
            callback = jest.fn();
            locals = {};
            jest.spyOn(Object.getPrototypeOf(component), 'handleEvent');
        });

        afterEach(() => {
            jest.clearAllMocks(); // Clear all mock calls after each test
        });

        it('should call super.handleEvent for events other than "change" and "blur"', () => {
            component['handleEvent'](node, 'focus', callback, locals);
            expect(Object.getPrototypeOf(component).handleEvent).toHaveBeenCalledWith(node, 'focus', callback, locals);
        });
    });
});