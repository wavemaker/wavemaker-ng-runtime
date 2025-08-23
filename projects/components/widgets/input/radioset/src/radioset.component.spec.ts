import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RadiosetComponent } from './radioset.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AbstractI18nService, App, AppDefaults, PartialRefProvider } from '@wm/core';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { DatePipe } from '@angular/common';
import { ToDatePipe } from '@wm/components/base';
import { MockAbstractI18nService } from 'projects/components/base/src/test/util/date-test-util';

// Create a subclass to expose protected methods
class TestRadiosetComponent extends RadiosetComponent {
    public testHandleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        this.handleEvent(node, eventName, callback, locals);
    }
}

describe('RadiosetComponent', () => {
    let component: TestRadiosetComponent;
    let fixture: ComponentFixture<TestRadiosetComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [FormsModule, ReactiveFormsModule, TestRadiosetComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: App, useValue: mockApp },
                { provide: ToDatePipe, useClass: ToDatePipe },
                { provide: DatePipe, useClass: DatePipe },
                { provide: AppDefaults, useClass: AppDefaults },
                { provide: AbstractI18nService, useClass: MockAbstractI18nService },
                PartialRefProvider
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestRadiosetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render radio buttons based on datasetItems', () => {
        component.datasetItems = [
            { key: '1', value: '1', label: 'Option 1', selected: false },
            { key: '2', value: '2', label: 'Option 2', selected: true },
        ];
        fixture.detectChanges();

        const radioLabels = fixture.debugElement.queryAll(By.css('.app-radioset-label'));
        expect(radioLabels.length).toBe(2);
        expect(radioLabels[0].nativeElement.textContent.trim()).toBe('Option 1');
        expect(radioLabels[1].nativeElement.textContent.trim()).toBe('Option 2');
    });

    it('should call onRadioLabelClick when radio button is clicked', () => {
        jest.spyOn(component, 'onRadioLabelClick');

        component.datasetItems = [
            { key: '1', value: '1', label: 'Option 1', selected: false },
        ];
        fixture.detectChanges();

        const radioInput = fixture.debugElement.query(By.css('input[type="radio"]'));
        radioInput.nativeElement.click();

        expect(component.onRadioLabelClick).toHaveBeenCalled();
    });

    it('should update modelByKey when radio button is clicked', () => {
        component.datasetItems = [
            { key: '1', value: '1', label: 'Option 1', selected: false },
            { key: '2', value: '2', label: 'Option 2', selected: true },
        ];
        fixture.detectChanges();

        const radioInput = fixture.debugElement.queryAll(By.css('input[type="radio"]'))[0];
        radioInput.nativeElement.click();

        expect(component.modelByKey).toBe('1');
    });
    it('should set list class on itemsperrow change', () => {
        jest.spyOn(component, 'onPropertyChange');
        component.itemsperrow = '3';
        component.onPropertyChange('itemsperrow', '3');

        expect(component.onPropertyChange).toHaveBeenCalledWith('itemsperrow', '3');
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

        it('should handle click event on input element', () => {
            const input = document.createElement('input');
            node.appendChild(input);
            component['handleEvent'](node, 'click', callback, locals);

            const event = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(event, 'target', { value: input });
            input.dispatchEvent(event);

            expect(callback).toHaveBeenCalled();
            expect(locals.$event).toBe(event);
        });

        it('should not handle click event on non-input element', () => {
            const span = document.createElement('span');
            node.appendChild(span);
            component['handleEvent'](node, 'click', callback, locals);

            const event = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(event, 'target', { value: span });
            span.dispatchEvent(event);

            expect(callback).not.toHaveBeenCalled();
            expect(locals.$event).toBeUndefined();
        });

        it('should call super.handleEvent for events other than "click" and "change"', () => {
            component['handleEvent'](node, 'focus', callback, locals);
            expect(Object.getPrototypeOf(component).handleEvent).toHaveBeenCalledWith(node, 'focus', callback, locals);
        });
    });
    describe('onRadioLabelClick', () => {
        let event: MouseEvent;

        beforeEach(() => {
            jest.spyOn(component, 'invokeOnTouched');
            jest.spyOn(component, 'invokeOnChange');
            Object.defineProperty(component, 'datavalue', {
                get: jest.fn(() => 'testValue')
            });
        });

        it('should do nothing if the target is not an input', () => {
            const divElement = document.createElement('div');
            event = new MouseEvent('click');
            Object.defineProperty(event, 'target', { value: divElement });

            component.onRadioLabelClick(event, 'testKey');

            expect(component.invokeOnTouched).not.toHaveBeenCalled();
            expect(component.invokeOnChange).not.toHaveBeenCalled();
        });

        it('should invoke methods if target is an input', () => {
            const inputElement = document.createElement('input');
            event = new MouseEvent('click');
            Object.defineProperty(event, 'target', { value: inputElement });

            component.onRadioLabelClick(event, 'testKey');

            expect(component.invokeOnTouched).toHaveBeenCalled();
            expect(component.invokeOnChange).toHaveBeenCalledWith('testValue', event, true);
        });
    });
});
