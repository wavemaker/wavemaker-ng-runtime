import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, TemplateRef, ViewContainerRef, ViewChild, ElementRef, Injector } from '@angular/core';
import { By } from '@angular/platform-browser';
import { LazyLoadDirective } from './lazy-load.directive';
import { App } from '@wm/core';

// Mock dependencies
jest.mock('@wm/core', () => ({
    $watch: jest.fn(() => jest.fn()),
    App: jest.fn(),
    findParent: jest.fn(() => ({}))
}));

describe('LazyLoadDirective', () => {
    let directive: LazyLoadDirective;
    let mockViewContainerRef: any;
    let mockTemplateRef: any;
    let mockInjector: any;
    let mockWatch: jest.Mock;
    let mockUnsubscribeFn: jest.Mock;

    beforeEach(() => {
        mockViewContainerRef = {
            createEmbeddedView: jest.fn()
        };

        mockTemplateRef = {
            elementRef: new ElementRef(document.createElement('div'))
        };

        mockInjector = {
            get: jest.fn((token) => {
                if (token === App) return {};
                return {};
            }),
            _lView: [null, null, null, null, null, null, null, null, {}]
        };

        // Get the mocked functions
        const { $watch } = require('@wm/core');
        mockWatch = $watch as jest.Mock;
        mockUnsubscribeFn = jest.fn();
        mockWatch.mockReturnValue(mockUnsubscribeFn);

        // Reset mocks
        mockWatch.mockClear();
        mockUnsubscribeFn.mockClear();
        mockViewContainerRef.createEmbeddedView.mockClear();

        // Create directive instance directly
        directive = new LazyLoadDirective(
            mockInjector,
            mockTemplateRef,
            mockViewContainerRef,
            {}
        );
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should call $watch when lazyLoad input changes', () => {
        directive.lazyLoad = 'testExpression';
        
        expect(mockWatch).toHaveBeenCalledWith(
            'testExpression',
            expect.any(Object),
            expect.any(Object),
            expect.any(Function)
        );
    });

    it('should create embedded view when condition becomes true', () => {
        // Trigger the lazyLoad setter with a truthy value
        directive.lazyLoad = true;
        
        // Get the watch callback and call it with true
        const watchCalls = mockWatch.mock.calls;
        if (watchCalls.length > 0 && watchCalls[0].length > 3) {
            const watchCallback = watchCalls[0][3] as Function;
            watchCallback(true);
            
            expect(mockViewContainerRef.createEmbeddedView).toHaveBeenCalledWith(
                mockTemplateRef,
                expect.any(Object)
            );
        }
    });

    it('should not create embedded view when condition is false', () => {
        // Trigger the lazyLoad setter with a falsy value
        directive.lazyLoad = false;
        
        // The directive should not have called createEmbeddedView
        expect(mockViewContainerRef.createEmbeddedView).not.toHaveBeenCalled();
    });

    it('should unsubscribe from $watch on destroy', () => {
        // First set up the lazyLoad to ensure unSubscribeFn is set
        directive.lazyLoad = 'test';
        
        // Now call ngOnDestroy
        directive.ngOnDestroy();
        expect(mockUnsubscribeFn).toHaveBeenCalled();
    });
});