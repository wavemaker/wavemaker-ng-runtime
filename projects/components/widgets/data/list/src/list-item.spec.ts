import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ListItemDirective } from './list-item.directive';
import { ListComponent } from './list.component';
import { $watch, App } from '@wm/core';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { Subject } from 'rxjs';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    $watch: jest.fn()
}));

@Component({
        standalone: true,
    template: `<div wmListItem [item]="testItem"></div>`
})
class TestComponent {
    testItem = { id: 1, name: 'Test Item' };
}

describe('ListItemDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let directiveElement: DebugElement;
    let directive: ListItemDirective;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [ListItemDirective,     TestComponent],
            providers: [
                {
                    provide: ListComponent, useValue: {
                        binditemclass: '',
                        itemclass: 'default-item-class',
                        binddisableitem: '',
                        disableitem: false,
                        mouseEnterCB: jest.fn(),
                        mouseLeaveCB: jest.fn(),
                        invokeEventCallback: jest.fn(),
                        viewParent: {}
                    }
                },
                { provide: App, useValue: mockApp }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        directiveElement = fixture.debugElement.query(By.directive(ListItemDirective));
        directive = directiveElement.injector.get(ListItemDirective);
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should set up mouseenter event listener if mouseEnterCB is provided', () => {
        const mockEvent = new Event('mouseenter');
        directiveElement.nativeElement.dispatchEvent(mockEvent);
        expect(directive.listComponent.invokeEventCallback).toHaveBeenCalledWith('mouseenter', expect.any(Object));
    });

    it('should set up mouseleave event listener if mouseLeaveCB is provided', () => {
        const mockEvent = new Event('mouseleave');
        directiveElement.nativeElement.dispatchEvent(mockEvent);
        expect(directive.listComponent.invokeEventCallback).toHaveBeenCalledWith('mouseleave', expect.any(Object));
    });

    it('should set listitemindex attribute', () => {
        expect(directiveElement.nativeElement.getAttribute('listitemindex')).toBeDefined();
    });

    it('should update itemClass when binditemclass changes', () => {
        directive.listComponent.binditemclass = 'item.className';
        directive['registerWatch'] = jest.fn((expression, callback) => {
            if (expression === 'item.className') {
                callback('new-item-class');
            }
        });
        directive['itemClassWatcher'](directive.listComponent);
        expect(directive['itemClass']).toBe('new-item-class');
    });

    it('should update disableItem when binddisableitem changes', () => {
        directive.listComponent.binddisableitem = 'item.disabled';
        directive['registerWatch'] = jest.fn((expression, callback) => {
            if (expression === 'item.disabled') {
                callback(true);
            }
        });
        directive['disableItemWatcher'](directive.listComponent);
        expect(directive.disableItem).toBe(true);
    });

    it('should set up CUD handlers', () => {
        const mockEditElement = document.createElement('div');
        mockEditElement.className = 'edit-list-item';
        const mockDeleteElement = document.createElement('div');
        mockDeleteElement.className = 'delete-list-item';

        directive.nativeElement.appendChild(mockEditElement);
        directive.nativeElement.appendChild(mockDeleteElement);

        directive.listComponent.update = jest.fn();
        directive.listComponent.delete = jest.fn();

        directive['setUpCUDHandlers']();

        mockEditElement.click();
        expect(directive.listComponent.update).toHaveBeenCalled();

        mockDeleteElement.click();
        expect(directive.listComponent.delete).toHaveBeenCalled();
    });

    it('should register a watch for the given expression', () => {
        const mockCallback = jest.fn();
        const mockExpression = 'item.someProperty';
        const mockSubscription = { unsubscribe: jest.fn() };

        // Mock the destroy$ subject
        (directive as any).destroy$ = new Subject();
        jest.spyOn((directive as any).destroy$, 'subscribe').mockReturnValue(mockSubscription);

        // Mock the $watch function
        const mockWatchResult = jest.fn();
        ($watch as jest.Mock).mockReturnValue(mockWatchResult);

        // Call the private method using type assertion
        (directive as any).registerWatch(mockExpression, mockCallback);

        // Assert that $watch was called with the correct arguments
        expect($watch).toHaveBeenCalledWith(
            mockExpression,
            (directive as any).listComponent.viewParent,
            directive,
            mockCallback
        );

        // Assert that the result of $watch was subscribed to
        expect((directive as any).destroy$.subscribe).toHaveBeenCalledWith(mockWatchResult);

        // Simulate destruction of the component
        directive.destroy.next(null);
        directive.destroy.complete();
    });


    describe('onFocus', () => {
        it('should set listComponent.lastSelectedItem to this directive instance', () => {
            directive.onFocus();
            expect(directive.listComponent.lastSelectedItem).toBe(directive);
        });
    });

    describe('getters', () => {
        beforeEach(() => {
            directive.context = {
                $index: 2,
                even: false,
                odd: true,
                first: false,
                last: false
            };
        });

        it('should return correct $index', () => {
            expect(directive.$index).toBe(2);
        });

        it('should return correct $even', () => {
            expect(directive.$even).toBe(false);
        });

        it('should return correct $odd', () => {
            expect(directive.$odd).toBe(true);
        });

        it('should return correct $first', () => {
            expect(directive.$first).toBe(false);
        });

        it('should return correct $last', () => {
            expect(directive.$last).toBe(false);
        });
    });

    describe('currentItemWidgets', () => {
        it('should return correct currentItemWidgets', () => {
            // Mock the nativeElement and its querySelectorAll method
            const mockWidgets = [
                { widget: { name: 'widget1', value: 'value1' } },
                { widget: { name: 'widget2', value: 'value2' } }
            ];
            directive.nativeElement = {
                querySelectorAll: jest.fn().mockReturnValue(mockWidgets)
            } as any;

            // Mock the existing _currentItemWidgets
            (directive as any)._currentItemWidgets = { existingWidget: 'existingValue' };

            const result = directive.currentItemWidgets;

            expect(directive.nativeElement.querySelectorAll).toHaveBeenCalledWith('[widget-id]');
            expect(result).toEqual({
                existingWidget: 'existingValue',
                widget1: { name: 'widget1', value: 'value1' },
                widget2: { name: 'widget2', value: 'value2' }
            });
        });
    });
});
