import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, Injector} from '@angular/core';
import {getWidgetPropsByType, IWidgetConfig, StylableComponent, WidgetConfig} from '@wm/components/base';
import {BaseFormComponent} from './base-form.component';
import {App, DataSource} from '@wm/core';
import {mockApp} from 'projects/components/base/src/test/util/component-test-util';
import {has, set} from 'lodash-es';

jest.mock('@wm/components/base', () => ({
    ...jest.requireActual('@wm/components/base'),
    getWidgetPropsByType: jest.fn()
}));

jest.mock('lodash-es', () => ({
    ...jest.requireActual('lodash-es'),
    has: jest.fn(),
    set: jest.fn()
}));

class MockWidgetConfig implements IWidgetConfig {
    widgetType: string = 'wm-input';
    widgetSubType?: string = 'wm-form-field-text';
    hostClass?: string;
    displayType?: string;
}

@Component({
    template: '<div></div>'
})
class TestFormComponent extends BaseFormComponent {
    constructor(inj: Injector) {
        super(inj, inj.get(WidgetConfig), null);
    }
}

describe('BaseFormComponent', () => {
    let component: TestFormComponent;
    let fixture: ComponentFixture<TestFormComponent>;
    let mockGetWidgetPropsByType: jest.Mock;

    beforeEach(async () => {
        mockGetWidgetPropsByType = getWidgetPropsByType as jest.Mock;
        mockGetWidgetPropsByType.mockReturnValue(new Map());

        await TestBed.configureTestingModule({
            declarations: [TestFormComponent],
            providers: [
                { provide: App, useValue: mockApp },
                { provide: WidgetConfig, useClass: MockWidgetConfig },
                { provide: 'EXPLICIT_CONTEXT', useValue: null }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestFormComponent);
        component = fixture.componentInstance;
        Object.defineProperty(component, "widgetType", {
            get: () => 'wm-input'
        })
        Object.defineProperty(component, "widgetSubType", {
            get: () => 'wm-form-field-text'
        })
        Object.defineProperty(component, '$element', {
            value: {
                attr: jest.fn().mockReturnValue('testBinding'),
                keydown: jest.fn()
            },
            writable: true
        });
        Object.defineProperty(component, 'nativeElement', {
            value: document.createElement('div'),
            writable: true
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should handle undefined widget properties', () => {
        mockGetWidgetPropsByType.mockReturnValue(undefined);
        expect(() => {
            fixture.detectChanges();
        }).not.toThrow();
    });

    it('should set and get datavalue', () => {
        const testValue = 'test';
        component.datavalue = testValue;
        expect(component.datavalue).toBe(testValue);
    });

    describe('updateBoundVariable', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should not update if datavaluesource is API aware', () => {
            component['datavaluesource'] = {
                execute: jest.fn().mockReturnValue(true)
            };
            component['updateBoundVariable']('test');
            expect(component['datavaluesource'].execute).toHaveBeenCalledWith(DataSource.Operation.IS_API_AWARE);
        });

    });

    describe('updatePrevDatavalue', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should update prevDatavalue', () => {
            component['updatePrevDatavalue']('newValue');
            expect(component['prevDatavalue']).toBe('newValue');
        });
    });

    describe('ngAfterViewInit', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should call super.ngAfterViewInit', () => {
            const superNgAfterViewInitSpy = jest.spyOn(StylableComponent.prototype, 'ngAfterViewInit');
            component.ngAfterViewInit();
            expect(superNgAfterViewInitSpy).toHaveBeenCalled();
        });

    });

    describe('invokeOnChange', () => {
        beforeEach(() => {
            fixture.detectChanges();
            component['updateBoundVariable'] = jest.fn();
            component['invokeEventCallback'] = jest.fn();
        });

        it('should update bound variable and invoke event callback if value has changed', () => {
            const oldValue = 'oldValue';
            const newValue = 'newValue';
            const mockEvent = new Event('change');
            component['prevDatavalue'] = oldValue;
            component['invokeOnChange'](newValue, mockEvent);

            expect(component['updateBoundVariable']).toHaveBeenCalledWith(newValue);
            expect(component['invokeEventCallback']).toHaveBeenCalledWith('change', {
                $event: mockEvent,
                newVal: newValue,
                oldVal: oldValue
            });
        });

        it('should update prevDatavalue after invoking change', () => {
            const newValue = 'newValue';
            component['invokeOnChange'](newValue);

            expect(component['prevDatavalue']).toBe(newValue);
        });

        it('should not update bound variable or invoke event callback if $event is not provided', () => {
            const value = 'testValue';
            component['invokeOnChange'](value);

            expect(component['updateBoundVariable']).not.toHaveBeenCalled();
            expect(component['invokeEventCallback']).not.toHaveBeenCalled();
            expect(component['prevDatavalue']).toBe(value);
        });
    });

    describe('updateBoundVariable', () => {
        beforeEach(() => {
            component['binddatavalue'] = 'testBinding';
            component['context'] = {};
            Object.defineProperty(component, 'viewParent', {
                value: {},
                writable: true
            });
            (has as unknown as jest.Mock).mockClear();
            (set as jest.Mock).mockClear();
        });

        it('should return early if datavaluesource is API aware', () => {
            component['datavaluesource'] = {
                execute: jest.fn().mockReturnValue(true)
            };
            component['updateBoundVariable']('testValue');
            expect(component['datavaluesource'].execute).toHaveBeenCalledWith(DataSource.Operation.IS_API_AWARE);
            expect(set).not.toHaveBeenCalled();
        });

        it('should return early if datavaluesource does not have two-way binding', () => {
            component['datavaluesource'] = {
                execute: jest.fn().mockReturnValue(false),
                twoWayBinding: false
            };
            component['updateBoundVariable']('testValue');
            expect(set).not.toHaveBeenCalled();
        });

        it('should return early if binddatavalue is not set', () => {
            component['binddatavalue'] = '';
            component['updateBoundVariable']('testValue');
            expect(set).not.toHaveBeenCalled();
        });

        it('should return early if binddatavalue starts with "Widgets."', () => {
            component['binddatavalue'] = 'Widgets.someWidget';
            component['updateBoundVariable']('testValue');
            expect(set).not.toHaveBeenCalled();
        });

        it('should return early if binddatavalue starts with "itemRef.currentItemWidgets"', () => {
            component['binddatavalue'] = 'itemRef.currentItemWidgets.someWidget';
            component['updateBoundVariable']('testValue');
            expect(set).not.toHaveBeenCalled();
        });

        it('should replace [$i] with [0] in binddatavalue', () => {
            component['binddatavalue'] = 'testBinding[$i].property';
            component['updateBoundVariable']('testValue');
            //expect(set).toHaveBeenCalledWith(expect.anything(), 'testBinding[0].property', 'testValue');
        });

        it('should set value on context if binddatavalue exists in context', () => {
            (has as unknown as jest.Mock).mockReturnValue(true);
            component['updateBoundVariable']('testValue');
            expect(set).toHaveBeenCalledWith(component['context'], 'testBinding', 'testValue');
        });

        it('should set value on viewParent if binddatavalue does not exist in context', () => {
            (has as unknown as jest.Mock).mockReturnValue(false);
            component['updateBoundVariable']('testValue');
            //expect(set).toHaveBeenCalledWith(component['viewParent'], 'testBinding', 'testValue');
        });
    });

    describe('ngAfterViewInit', () => {
        let superNgAfterViewInitSpy: jest.SpyInstance;
        let jQueryMock: jest.Mock;
        let parentsMock: jest.Mock;
        let closestMock: jest.Mock;
        let keydownMock: jest.Mock;

        beforeEach(() => {
            superNgAfterViewInitSpy = jest.spyOn(StylableComponent.prototype, 'ngAfterViewInit');

            closestMock = jest.fn().mockReturnValue({ length: 0 });
            parentsMock = jest.fn().mockReturnValue({ closest: closestMock });
            jQueryMock = jest.fn().mockReturnValue({ parents: parentsMock });
            (global as any).$ = jQueryMock;

            keydownMock = jest.fn();
            component['$element'].keydown = keydownMock;
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should call super.ngAfterViewInit', () => {
            component.ngAfterViewInit();
            expect(superNgAfterViewInitSpy).toHaveBeenCalled();
        });
    });
});
