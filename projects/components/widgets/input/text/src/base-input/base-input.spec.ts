import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, NgModel} from '@angular/forms';
import {Component, ElementRef, Injector} from '@angular/core';
import {IWidgetConfig, WidgetConfig} from '@wm/components/base';
import {BaseInput} from './base-input';
import {addClass, App} from '@wm/core';
import {mockApp} from 'projects/components/base/src/test/util/component-test-util';
import {BaseFormCustomComponent} from '@wm/components/input/base-form-custom';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    addClass: jest.fn(),
    styler: jest.fn()
}));
class MockWidgetConfig implements IWidgetConfig {
    widgetType: string = 'wm-input';
    widgetSubType?: string = 'text';
    hostClass?: string;
    displayType?: string;
}
class MockNgModel {
    update = { next: jest.fn() };
    valid = true;
}
// Mock Injector
class MockInjector extends Injector {
    get(token: any): any {
        if (token === WidgetConfig) {
            return new MockWidgetConfig();
        }
        if (token === App) return mockApp;
        if (token === NgModel) return new MockNgModel();
        return null;
    }
}

@Component({
    template: '<input [(ngModel)]="value">'
})
class TestInputComponent extends BaseInput {
    inputEl: ElementRef;
    ngModel: NgModel;

    constructor(inj: Injector) {
        super(inj, inj.get(WidgetConfig), null);
    }

    protected initWidget() { }
    protected setInitProps(): void { }
}

describe('BaseInput', () => {
    let component: TestInputComponent;
    let fixture: ComponentFixture<TestInputComponent>;
    let mockInjector: MockInjector;

    beforeEach(async () => {
        mockInjector = new MockInjector();

        await TestBed.configureTestingModule({
            declarations: [TestInputComponent],
            imports: [FormsModule],
            providers: [
                { provide: Injector, useValue: mockInjector },
                { provide: WidgetConfig, useClass: MockWidgetConfig },
                { provide: App, useValue: mockApp },
                { provide: NgModel, useClass: MockNgModel }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TestInputComponent);
        component = fixture.componentInstance;
        Object.defineProperty(component, "widgetType", {
            get: () => 'wm-input'
        })
        Object.defineProperty(component, "widgetSubType", {
            get: () => 'text'
        })
        component.inputEl = fixture.debugElement.query(input => input.nativeElement instanceof HTMLInputElement);
        component.ngModel = fixture.debugElement.injector.get(NgModel);

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update class on input element', () => {
        const newClass = 'test-class';
        component.class = newClass;
        (component as any).onPropertyChange('class', newClass, '');
    });

    it('should handle change event', () => {
        const newValue = 'changed value';
        const invokeOnChangeSpy = jest.spyOn(component as any, 'invokeOnChange');
        component.datavalue = newValue;
        component.handleChange(newValue);
        expect(invokeOnChangeSpy).toHaveBeenCalledWith(newValue, { type: 'change' }, component.ngModel.valid);
    });

    it('should trim datavalue if autotrim is true', () => {
        component.autotrim = true;
        component.datavalue = '  trimmed  ';
        component.handleChange(component.datavalue);
        expect(component.datavalue).toBe('trimmed');
    });

    it('should handle blur event', () => {
        const blurEvent = new Event('blur');
        const invokeOnTouchedSpy = jest.spyOn(component as any, 'invokeOnTouched');
        component.handleBlur(blurEvent);
        expect(invokeOnTouchedSpy).toHaveBeenCalledWith(blurEvent);
    });

    it('should flush view changes', () => {
        const newValue = 'flushed value';
        const ngModelUpdateSpy = jest.spyOn(component.ngModel.update, 'next');
        component.flushViewChanges(newValue);
        expect(ngModelUpdateSpy).toHaveBeenCalledWith(newValue);
    });

    it('should use the provided WidgetConfig', () => {
        const mockConfig = mockInjector.get(WidgetConfig);
        expect(mockConfig.widgetType).toBe('wm-input');
        expect(mockConfig).toBeInstanceOf(MockWidgetConfig);
    });

    describe('onPropertyChange', () => {
        it('should not update when key is tabindex', () => {
            const spy = jest.spyOn(component as any, 'onPropertyChange');
            (component as any).onPropertyChange('tabindex', 1, 0);
            expect(spy).toHaveReturnedWith(undefined);
        });

        it('should call _onChange when key is required', () => {
            const onChangeSpy = jest.spyOn(component as any, '_onChange');
            (component as any).onPropertyChange('required', true, false);
            expect(onChangeSpy).toHaveBeenCalled();
        });

        it('should update class on input element when key is class', () => {
            const oldClass = 'old-class';
            const newClass = 'new-class';
            component.inputEl.nativeElement.className = oldClass;
            const switchClassSpy = jest.spyOn(require('@wm/core'), 'switchClass');

            (component as any).onPropertyChange('class', newClass, oldClass);

            expect(switchClassSpy).toHaveBeenCalledWith(component.inputEl.nativeElement, newClass, oldClass);
        });

        it('should update oldDataValue and call _onChange when key is datavalue', () => {
            const updatePrevDatavalueSpy = jest.spyOn(component as any, 'updatePrevDatavalue');
            const onChangeSpy = jest.spyOn(component as any, '_onChange');
            const newValue = 'new value';

            (component as any).onPropertyChange('datavalue', newValue, 'old value');

            expect(updatePrevDatavalueSpy).toHaveBeenCalledWith(newValue);
            expect(onChangeSpy).toHaveBeenCalled();
        });

        it('should call super.onPropertyChange for other keys', () => {
            const superSpy = jest.spyOn((BaseFormCustomComponent as any).prototype, 'onPropertyChange');
            (component as any).onPropertyChange('someOtherKey', 'newValue', 'oldValue');
            expect(superSpy).toHaveBeenCalledWith('someOtherKey', 'newValue', 'oldValue');
        });
    });

    describe('handleEvent', () => {
        let mockNode: HTMLElement;
        let mockCallback: jest.Mock;
        let mockLocals: any;

        beforeEach(() => {
            mockNode = document.createElement('input');
            mockCallback = jest.fn();
            mockLocals = {};
        });

        it('should not call super.handleEvent for "change" event', () => {
            const superHandleEventSpy = jest.spyOn((BaseFormCustomComponent as any).prototype, 'handleEvent');
            (component as any).handleEvent(mockNode, 'change', mockCallback, mockLocals);
            expect(superHandleEventSpy).not.toHaveBeenCalled();
        });

        it('should not call super.handleEvent for "blur" event', () => {
            const superHandleEventSpy = jest.spyOn((BaseFormCustomComponent as any).prototype, 'handleEvent');
            (component as any).handleEvent(mockNode, 'blur', mockCallback, mockLocals);
            expect(superHandleEventSpy).not.toHaveBeenCalled();
        });

        it('should call super.handleEvent for other events', () => {
            const superHandleEventSpy = jest.spyOn((BaseFormCustomComponent as any).prototype, 'handleEvent');
            (component as any).handleEvent(mockNode, 'click', mockCallback, mockLocals);
            expect(superHandleEventSpy).toHaveBeenCalledWith(component.inputEl.nativeElement, 'click', mockCallback, mockLocals);
        });

        it('should use inputEl.nativeElement instead of the provided node', () => {
            const superHandleEventSpy = jest.spyOn((BaseFormCustomComponent as any).prototype, 'handleEvent');
            (component as any).handleEvent(mockNode, 'focus', mockCallback, mockLocals);
            expect(superHandleEventSpy).toHaveBeenCalledWith(component.inputEl.nativeElement, 'focus', mockCallback, mockLocals);
        });
    });

    describe('ngAfterViewInit', () => {
        let superNgAfterViewInitSpy: jest.SpyInstance;

        beforeEach(() => {
            superNgAfterViewInitSpy = jest.spyOn(BaseFormCustomComponent.prototype, 'ngAfterViewInit');
        });

        it('should call super.ngAfterViewInit', () => {
            component.ngAfterViewInit();
            expect(superNgAfterViewInitSpy).toHaveBeenCalled();
        });

        it('should add class to input element if this.class is set', () => {
            component.class = 'test-class';
            component.ngAfterViewInit();
            expect(addClass).toHaveBeenCalledWith(component.inputEl.nativeElement, 'test-class');
        });
    });
});
