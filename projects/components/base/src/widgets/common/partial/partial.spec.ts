import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import { PartialDirective } from './partial.directive';
import { App, Viewport, ViewportEvent } from '@wm/core';
import { StylableComponent } from '../base/stylable.component';
import { mockApp } from '../../../test/util/component-test-util';

@Component({
    template: '<div wmPartial></div>',
    standalone: false
})
class TestComponent { }

describe('PartialDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let directive: PartialDirective;
    let viewportMock: jest.Mocked<Viewport>;

    beforeEach(() => {
        viewportMock = {
            subscribe: jest.fn()
        } as unknown as jest.Mocked<Viewport>;

        TestBed.configureTestingModule({
            declarations: [TestComponent, PartialDirective],
            providers: [
                { provide: Viewport, useValue: viewportMock },
                { provide: 'EXPLICIT_CONTEXT', useValue: null },
                { provide: App, useValue: mockApp }
            ]
        });

        fixture = TestBed.createComponent(TestComponent);
        directive = fixture.debugElement.children[0].injector.get(PartialDirective);
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should register resize and orientation change listeners', () => {
        expect(viewportMock.subscribe).toHaveBeenCalledWith(ViewportEvent.RESIZE, expect.any(Function));
        expect(viewportMock.subscribe).toHaveBeenCalledWith(ViewportEvent.ORIENTATION_CHANGE, expect.any(Function));
    });

    it('should call callback on resize', () => {
        const callbackSpy = jest.spyOn(directive as any, 'callback');
        const resizeCallback = viewportMock.subscribe.mock.calls[0][1];
        resizeCallback({ someData: 'resizeData' });
        expect(callbackSpy).toHaveBeenCalledWith('resize', { someData: 'resizeData' });
    });

    it('should call callback on orientation change', () => {
        const callbackSpy = jest.spyOn(directive as any, 'callback');
        const orientationCallback = viewportMock.subscribe.mock.calls[1][1];
        orientationCallback({ someData: 'orientationData' });
        expect(callbackSpy).toHaveBeenCalledWith('orientationchange', { someData: 'orientationData' });
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
});
