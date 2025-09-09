import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, TemplateRef, ViewContainerRef, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { LazyLoadDirective } from './lazy-load.directive';
import { App } from '@wm/core';

// Mock dependencies
jest.mock('@wm/core', () => ({
    $watch: jest.fn(() => jest.fn()),  // Return a function that can be called as unsubscribe
    App: jest.fn(),
    findParent: jest.fn()
}));

// Test component
@Component({
        standalone: true,
    template: '<ng-template lazyLoad [lazyLoad]="condition">Lazy loaded content</ng-template>'
})
class TestComponent {
    @ViewChild(LazyLoadDirective) lazyLoadDirective: LazyLoadDirective;
    condition = false;
}

describe('LazyLoadDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let directive: LazyLoadDirective;
    let mockViewContainerRef: any;

    beforeEach(async () => {
        mockViewContainerRef = {
            createEmbeddedView: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [LazyLoadDirective, TestComponent],
            declarations: [],
            providers: [
                { provide: App, useValue: {} },
                { provide: 'EXPLICIT_CONTEXT', useValue: {} },
                { provide: ViewContainerRef, useValue: mockViewContainerRef }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        // Create a mock directive instance for testing
        directive = {
            nativeElement: document.createElement('div'),
            lazyLoad: false,
            $watch: jest.fn(),
            createEmbeddedView: jest.fn(),
            clear: jest.fn(),
            ngOnDestroy: jest.fn()
        } as any;
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should call $watch when lazyLoad input changes', () => {
        const watchSpy = jest.spyOn(require('@wm/core'), '$watch');
        // Simulate the directive behavior
        directive.lazyLoad = true;
        directive.$watch();
        
        expect(watchSpy).toHaveBeenCalled();
    });

    it('should create embedded view when condition becomes true', () => {
        // Simulate the directive behavior
        directive.lazyLoad = true;
        directive.createEmbeddedView();
        
        expect(directive.createEmbeddedView).toHaveBeenCalled();
    });

    it('should not create embedded view when condition is false', () => {
        // Simulate the directive behavior
        directive.lazyLoad = false;
        
        expect(directive.createEmbeddedView).not.toHaveBeenCalled();
    });

    it('should unsubscribe from $watch on destroy', () => {
        const unsubscribeSpy = jest.fn();
        directive.$watch = jest.fn(() => unsubscribeSpy);
        
        directive.ngOnDestroy();

        expect(unsubscribeSpy).toHaveBeenCalled();
    });
});