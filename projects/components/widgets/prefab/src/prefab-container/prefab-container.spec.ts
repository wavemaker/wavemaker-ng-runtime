import { Component, DebugElement, Injector } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PrefabContainerDirective } from './prefab-container.directive';
import { App, Viewport, ViewportEvent } from '@wm/core';
import { StylableComponent } from '@wm/components/base';
import { of } from 'rxjs';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';

// Define a test component to host the directive
@Component({
        standalone: true,
    template: `<div wmPrefabContainer></div>`
})
class TestComponent { }

describe('PrefabContainerDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let directiveElement: DebugElement;
    let directive: PrefabContainerDirective;
    let viewportMock: jest.Mocked<Viewport>;
    let injectorMock: jest.Mocked<Injector>;

    beforeEach(async () => {
        viewportMock = {
            subscribe: jest.fn(),
        } as unknown as jest.Mocked<Viewport>;

        injectorMock = {
            get: jest.fn(),
        } as jest.Mocked<Injector>;

        // Mock Viewport subscription behavior
        viewportMock.subscribe.mockImplementation((event): any => {
            if (event === ViewportEvent.RESIZE) {
                return of({ width: 800 });
            }
            if (event === ViewportEvent.ORIENTATION_CHANGE) {
                return of({ orientation: 'landscape' });
            }
        });

        await TestBed.configureTestingModule({
            declarations: [],
            imports: [PrefabContainerDirective,     TestComponent],
            providers: [
                { provide: App, useValue: mockApp },
                { provide: Viewport, useValue: viewportMock },
                { provide: Injector, useValue: injectorMock },
                { provide: 'EXPLICIT_CONTEXT', useValue: null }
            ]
        }).compileComponents();

        // Create the test fixture and component instance
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;

        // Find the element with the directive applied
        directiveElement = fixture.debugElement.query(By.directive(PrefabContainerDirective));
        directive = directiveElement.injector.get(PrefabContainerDirective);

        fixture.detectChanges(); // Trigger initial data binding
    });

    it('should create the directive instance', () => {
        expect(directive).toBeTruthy();
        expect(directive instanceof StylableComponent).toBe(true);
    });

    it('should subscribe to Viewport resize and orientation change events', () => {
        expect(viewportMock.subscribe).toHaveBeenCalledWith(ViewportEvent.RESIZE, expect.any(Function));
        expect(viewportMock.subscribe).toHaveBeenCalledWith(ViewportEvent.ORIENTATION_CHANGE, expect.any(Function));
    });

    it('should call the callback function on attach', () => {
        const callbackSpy = jest.spyOn<any, any>(directive, 'callback');
        directive.ngOnAttach();
        expect(callbackSpy).toHaveBeenCalledWith('attach');
    });

    it('should call the callback function on detach', () => {
        const callbackSpy = jest.spyOn<any, any>(directive, 'callback');
        directive.ngOnDetach();
        expect(callbackSpy).toHaveBeenCalledWith('detach');
    });

    it('should call the callback function on destroy', () => {
        const callbackSpy = jest.spyOn<any, any>(directive, 'callback');
        directive.ngOnDestroy();
        expect(callbackSpy).toHaveBeenCalledWith('destroy');
    });

    it('should invoke event callback on viewport resize', () => {
        const invokeEventCallbackSpy = jest.spyOn(directive, 'invokeEventCallback');

        // Simulate the resize event callback
        const resizeCallback = viewportMock.subscribe.mock.calls.find(call => call[0] === ViewportEvent.RESIZE)?.[1];
        if (resizeCallback) {
            resizeCallback({ width: 800 });
        }

        expect(invokeEventCallbackSpy).toHaveBeenCalledWith('resize', expect.objectContaining({ width: 800 }));
    });

    it('should invoke event callback on viewport orientation change', () => {
        const invokeEventCallbackSpy = jest.spyOn(directive, 'invokeEventCallback');

        // Simulate the orientation change event callback
        const orientationCallback = viewportMock.subscribe.mock.calls.find(call => call[0] === ViewportEvent.ORIENTATION_CHANGE)?.[1];
        if (orientationCallback) {
            orientationCallback({ orientation: 'landscape' });
        }

        expect(invokeEventCallbackSpy).toHaveBeenCalledWith('orientationchange', expect.objectContaining({ orientation: 'landscape' }));
    });
});
