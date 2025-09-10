import { TestBed } from '@angular/core/testing';
import { ElementRef, Injector, ViewContainerRef } from '@angular/core';
import { PartialDirective } from './partial.directive';
import { App, Viewport, ViewportEvent } from '@wm/core';
import { StylableComponent } from '../base/stylable.component';
import { mockApp } from '../../../test/util/component-test-util';

describe('PartialDirective', () => {
    let directive: PartialDirective;
    let viewportMock: jest.Mocked<Viewport>;
    let mockInjector: Injector;
    let mockElementRef: ElementRef;
    let mockViewContainerRef: ViewContainerRef;

    beforeEach(() => {
        viewportMock = {
            subscribe: jest.fn()
        } as unknown as jest.Mocked<Viewport>;

        mockElementRef = { nativeElement: document.createElement('div') } as ElementRef;
        mockViewContainerRef = {} as ViewContainerRef;

        mockInjector = {
            get: jest.fn((token) => {
                if (token === ElementRef) return mockElementRef;
                if (token === App) return mockApp;
                if (token === ViewContainerRef) return mockViewContainerRef;
                return null;
            }),
            _lView: [null, null, null, null, null, null, null, null, { index: 0 }],
            _tNode: {
                attrs: ['attr1', 'value1', 'attr2', 'value2']
            }
        } as any;

        // Create directive instance directly
        directive = new PartialDirective(
            mockInjector,
            viewportMock,
            null
        );
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should subscribe to viewport events on construction', () => {
        // The directive should have subscribed to RESIZE and ORIENTATION_CHANGE events
        expect(viewportMock.subscribe).toHaveBeenCalledWith(ViewportEvent.RESIZE, expect.any(Function));
        expect(viewportMock.subscribe).toHaveBeenCalledWith(ViewportEvent.ORIENTATION_CHANGE, expect.any(Function));
    });

    it('should call callback on attach', () => {
        const callbackSpy = jest.spyOn(directive as any, 'callback');
        directive.ngOnAttach();
        expect(callbackSpy).toHaveBeenCalledWith('attach');
    });

    it('should call callback on detach', () => {
        const callbackSpy = jest.spyOn(directive as any, 'callback');
        directive.ngOnDetach();
        expect(callbackSpy).toHaveBeenCalledWith('detach');
    });

    it('should call callback on destroy', () => {
        const callbackSpy = jest.spyOn(directive as any, 'callback');
        const superDestroySpy = jest.spyOn(StylableComponent.prototype, 'ngOnDestroy');
        directive.ngOnDestroy();
        expect(callbackSpy).toHaveBeenCalledWith('destroy');
        expect(superDestroySpy).toHaveBeenCalled();
    });

    it('should call invokeEventCallback when callback is called', () => {
        const invokeEventCallbackSpy = jest.spyOn(directive, 'invokeEventCallback');
        
        directive.ngOnAttach();
        expect(invokeEventCallbackSpy).toHaveBeenCalledWith('attach', expect.any(Object));
    });
});