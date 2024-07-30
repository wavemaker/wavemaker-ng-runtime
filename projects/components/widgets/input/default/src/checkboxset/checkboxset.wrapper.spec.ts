import { DatePipe } from "@angular/common";
import { Component, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { EventManager } from "@angular/platform-browser";
import { ToDatePipe } from "@wm/components/base";
import { App, AppDefaults, AbstractI18nService } from "@wm/core";
import { ITestModuleDef, ITestComponentDef, ComponentTestBase } from "projects/components/base/src/test/common-widget.specs";
import { mockApp, compileTestComponent, getHtmlSelectorElement } from "projects/components/base/src/test/util/component-test-util";
import { MockAbstractI18nService } from "projects/components/base/src/test/util/date-test-util";
import { CheckboxsetComponent } from "./checkboxset.component";
declare const _: any;

const markup = `<div wmCheckboxset hint="checkboxset1" caption="Label" required itemsperrow="3" name="checkboxset1" tabindex="1"></div>`;
@Component({
    template: markup
})

class checkboxSetWrapperComponent {
    @ViewChild(CheckboxsetComponent, /* TODO: add static flag */ { static: true }) wmComponent: CheckboxsetComponent
}


const checkboxSetModuleDef: ITestModuleDef = {
    imports: [FormsModule],
    declarations: [checkboxSetWrapperComponent, CheckboxsetComponent],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: ToDatePipe, useClass: ToDatePipe },
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
// checkboxTestBase.verifyPropsInitialization();  /* to be fixed for hint property issue */
// checkboxTestBase.verifyCommonProperties(); /* to be fixed for tabindex property issue */
checkboxTestBase.verifyStyles();
checkboxTestBase.verifyAccessibility();

describe('CheckboxSet component', () => {
    let wrapperComponent: checkboxSetWrapperComponent;
    let checkboxsetComponent: CheckboxsetComponent;
    let fixture: ComponentFixture<checkboxSetWrapperComponent>;
    let eventManager: EventManager;
    beforeEach(waitForAsync(() => {
        fixture = compileTestComponent(checkboxSetModuleDef, checkboxSetWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        checkboxsetComponent = wrapperComponent.wmComponent;
        eventManager = TestBed.inject(EventManager);
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
        checkboxElement.triggerEventHandler('keydown.enter', { preventDefault: () => { } });
        fixture.whenStable().then(() => {
            expect(checkboxsetComponent.datavalue).toBeTruthy();
        });
    });
    describe('onCheckboxLabelClick', () => {
        let mockEvent: { target: any; };
        let mockInputElement: HTMLInputElement;

        beforeEach(() => {
            mockInputElement = document.createElement('input');
            mockInputElement.type = 'checkbox';
            mockInputElement.value = 'test';
            mockEvent = { target: mockInputElement };

            (checkboxsetComponent as any).nativeElement = {
                querySelectorAll: jest.fn().mockReturnValue([mockInputElement])
            };
            checkboxsetComponent.invokeOnTouched = jest.fn();
            checkboxsetComponent.invokeOnChange = jest.fn();
        });

        it('should not update model if target is not input', () => {
            const nonInputEvent = { target: document.createElement('div') };
            checkboxsetComponent.onCheckboxLabelClick(nonInputEvent, 'key');
            expect(checkboxsetComponent.invokeOnChange).not.toHaveBeenCalled();
        });

        it('should invoke onTouched', () => {
            checkboxsetComponent.onCheckboxLabelClick(mockEvent, 'key');
            expect(checkboxsetComponent.invokeOnTouched).toHaveBeenCalled();
        });

        it('should invoke onChange with datavalue', () => {
            checkboxsetComponent.onCheckboxLabelClick(mockEvent, 'key');
            expect(checkboxsetComponent.invokeOnChange).toHaveBeenCalledWith(
                checkboxsetComponent.datavalue,
                expect.any(Object),
                true
            );
        });

    });

    describe('handleEvent', () => {
        it('should add event listener for click events on input elements', () => {
            const mockNode = document.createElement('div');
            const mockCallback = jest.fn();
            const addEventListenerSpy = jest.spyOn(eventManager, 'addEventListener')
                .mockImplementation((node, eventName, handler) => {
                    // Simulate the event
                    handler({ target: document.createElement('input') });
                    return () => { }; // Return a removal function
                });

            checkboxsetComponent['handleEvent'](mockNode, 'click', mockCallback, {});
            expect(addEventListenerSpy).toHaveBeenCalled();
            expect(mockCallback).toHaveBeenCalled();
        });

        it('should not call callback for click events on non-input elements', () => {
            const mockNode = document.createElement('div');
            const mockCallback = jest.fn();
            const addEventListenerSpy = jest.spyOn(eventManager, 'addEventListener')
                .mockImplementation((node, eventName, handler) => {
                    // Simulate the event on a non-input element
                    handler({ target: document.createElement('div') });
                    return () => { }; // Return a removal function
                });

            checkboxsetComponent['handleEvent'](mockNode, 'click', mockCallback, {});

            expect(addEventListenerSpy).toHaveBeenCalled();
            expect(mockCallback).not.toHaveBeenCalled();
        });

        it('should call super.handleEvent for non-click events', () => {
            const mockNode = document.createElement('div');
            const mockCallback = jest.fn();
            const superHandleEventSpy = jest.spyOn(Object.getPrototypeOf(CheckboxsetComponent.prototype), 'handleEvent');

            checkboxsetComponent['handleEvent'](mockNode, 'focus', mockCallback, {});

            expect(superHandleEventSpy).toHaveBeenCalledWith(mockNode, 'focus', mockCallback, {});
        });
    });
});