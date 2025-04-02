import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, TemplateRef, ViewContainerRef, ViewChild } from '@angular/core';
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
    template: '<ng-template [lazyLoad]="condition">Lazy loaded content</ng-template>'
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
            imports: [LazyLoadDirective],
            declarations: [TestComponent],
            providers: [
                { provide: App, useValue: {} },
                { provide: 'EXPLICIT_CONTEXT', useValue: {} },
                { provide: ViewContainerRef, useValue: mockViewContainerRef }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        directive = component.lazyLoadDirective;
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should call $watch when lazyLoad input changes', () => {
        const watchSpy = jest.spyOn(require('@wm/core'), '$watch');
        component.condition = true;
        fixture.detectChanges();

        expect(watchSpy).toHaveBeenCalled();
    });

    it('should create embedded view when condition becomes true', () => {
        const watchCallback = (require('@wm/core').$watch as jest.Mock).mock.calls[0][3];

        watchCallback(true);

        expect(mockViewContainerRef.createEmbeddedView).not.toHaveBeenCalled();
    });

    it('should not create embedded view when condition is false', () => {
        const watchCallback = (require('@wm/core').$watch as jest.Mock).mock.calls[0][3];

        watchCallback(false);

        expect(mockViewContainerRef.createEmbeddedView).not.toHaveBeenCalled();
    });

    it('should unsubscribe from $watch on destroy', () => {
        const unsubscribeSpy = jest.fn();
        (require('@wm/core').$watch as jest.Mock).mockReturnValue(unsubscribeSpy);

        component.condition = true;
        fixture.detectChanges();

        directive.ngOnDestroy();

        expect(unsubscribeSpy).toHaveBeenCalled();
    });
});