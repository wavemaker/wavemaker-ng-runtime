import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { SmoothScrollDirective } from './smooth-scroll.directive';
import { App, isKitkatDevice, isMobileApp } from '@wm/core';
import { mockApp } from '../../../test/util/component-test-util';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    isMobileApp: jest.fn(),
    isKitkatDevice: jest.fn()
}));

// Test component
@Component({
    template: '<div wmSmoothscroll="true"></div>'
})
class TestComponent { }

describe('SmoothScrollDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let directiveElement: DebugElement;
    let directive: SmoothScrollDirective;
    let jQueryMock
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TestComponent, SmoothScrollDirective],
            providers: [
                { provide: App, useValue: mockApp }
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        directiveElement = fixture.debugElement.query(By.directive(SmoothScrollDirective));
        directive = directiveElement.injector.get(SmoothScrollDirective);


        // Mock IScroll
        (global as any).IScroll = jest.fn().mockImplementation(() => ({
            on: jest.fn(),
            refresh: jest.fn(),
            destroy: jest.fn(),
            _scrolling: false,
            wrapper: {
                children: [{ classList: [] }],
                scrollHeight: 0,
                clientHeight: 0,
                contains: jest.fn()
            },
            _events: {},
            maxScrollY: 0,
            options: {}
        }));

        // Mock jQuery
        jQueryMock = jest.fn().mockReturnValue({
            wrapAll: jest.fn(),
            offset: jest.fn().mockReturnValue({ top: 0 }),
            css: jest.fn()
        });
        (global as any).$ = jQueryMock;

        // Mock refreshIscrolls function
        (global as any).refreshIscrolls = jest.fn();

        // Mock includes function
        (global as any).includes = jest.fn().mockReturnValue(false);

        // Mock document.activeElement
        Object.defineProperty(document, 'activeElement', {
            value: { tagName: 'INPUT', clientHeight: 20, scrollIntoView: jest.fn() },
            writable: true
        });

        // Mock window.innerHeight
        Object.defineProperty(window, 'innerHeight', {
            value: 1000,
            writable: true
        });
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should apply smooth scroll when enabled', () => {
        const applySmoothScrollSpy = jest.spyOn(directive as any, 'applySmoothScroll');
        directive.wmSmoothscroll = true;
        expect(applySmoothScrollSpy).toHaveBeenCalled();
    });

    it('should destroy smooth scroll when disabled', () => {
        const destroySpy = jest.fn();
        (directive as any)._smoothScrollInstance = { destroy: destroySpy };
        directive.wmSmoothscroll = false;
        expect(destroySpy).toHaveBeenCalled();
    });

    it('should destroy IScroll in ngOnDestroy', () => {
        const destroySpy = jest.fn();
        (directive as any)._smoothScrollInstance = { destroy: destroySpy };
        directive.ngOnDestroy();
        expect(destroySpy).toHaveBeenCalled();
    });

    describe('refreshIScroll', () => {
        let refreshIScrollSpy: jest.SpyInstance;

        beforeEach(() => {
            refreshIScrollSpy = jest.spyOn(directive as any, 'refreshIScroll');
            (directive as any)._smoothScrollInstance = {
                iScroll: new (global as any).IScroll(),
                destroy: jest.fn()
            };
            (directive as any)._$el = [{ iscroll: { maxScrollY: 0 } }];
            jQueryMock.mockClear();
            (global as any).refreshIscrolls.mockClear();
        });

        it('should not refresh if iScroll is scrolling', () => {
            (directive as any)._smoothScrollInstance.iScroll._scrolling = true;
            (directive as any).refreshIScroll();
            expect(refreshIScrollSpy).toHaveBeenCalled();
            expect((directive as any)._smoothScrollInstance.iScroll.refresh).not.toHaveBeenCalled();
        });

        it('should not refresh if waiting time has not elapsed', () => {
            (directive as any)._waitRefreshTill = Date.now() + 1000;
            (directive as any).refreshIScroll();
            expect(refreshIScrollSpy).toHaveBeenCalled();
            expect((directive as any)._smoothScrollInstance.iScroll.refresh).not.toHaveBeenCalled();
        });

        it('should only refresh iScroll when lastScrollY has not changed', () => {
            (directive as any)._lastScrollY = 100;
            (directive as any)._$el[0].iscroll.maxScrollY = 100;
            (directive as any).refreshIScroll();
            expect((directive as any)._smoothScrollInstance.iScroll.refresh).toHaveBeenCalled();
        });

        it('should update _waitRefreshTill after refreshing', () => {
            const now = Date.now();
            Date.now = jest.fn(() => now);
            (directive as any).refreshIScroll();
            expect((directive as any)._waitRefreshTill).toBe(now + 500);
        });

        it('should add smoothscroll-container when content is scrollable', () => {
            const mockWrapper = {
                children: [{ classList: [] }],
                scrollHeight: 100,
                clientHeight: 50
            };
            (directive as any)._smoothScrollInstance.iScroll.wrapper = mockWrapper;
            (global as any).includes.mockReturnValue(false);
            const applySmoothScrollSpy = jest.spyOn(directive as any, 'applySmoothScroll').mockReturnValue({});

            (directive as any).refreshIScroll();

            expect(jQueryMock).toHaveBeenCalledWith(mockWrapper.children);
            expect(applySmoothScrollSpy).toHaveBeenCalled();
        });
    });


    describe('ngOnInit', () => {
        it('should subscribe to "no-iscroll" event', () => {
            const mockSubscribe = jest.fn().mockReturnValue(jest.fn());
            (directive as any).app = { subscribe: mockSubscribe };

            directive.ngOnInit();

            expect(mockSubscribe).toHaveBeenCalledWith('no-iscroll', expect.any(Function));
            expect((directive as any).cancelSubscription).toBeDefined();
        });

        it('should add element to pendingIscrolls when "no-iscroll" event is triggered', () => {
            const mockEl = document.createElement('div');
            let subscribeCb: (el: any) => void;
            const mockSubscribe = jest.fn().mockImplementation((event, cb) => {
                subscribeCb = cb;
                return jest.fn();
            });
            (directive as any).app = { subscribe: mockSubscribe };
            (directive as any).pendingIscrolls = [];

            directive.ngOnInit();
            subscribeCb(mockEl);

            expect((directive as any).pendingIscrolls).toContain(mockEl);
        });
    });

    describe('ngDoCheck', () => {
        beforeEach(() => {
            (directive as any)._isEnabled = true;
            (directive as any).applySmoothScroll = jest.fn().mockReturnValue({});
            (directive as any).refreshIScroll = jest.fn();
        });

        it('should apply smooth scroll if enabled and not initialized', () => {
            (directive as any)._smoothScrollInstance = null;
            directive.ngDoCheck();
            expect((directive as any).applySmoothScroll).toHaveBeenCalled();
        });

        it('should refresh IScroll if enabled and already initialized', () => {
            (directive as any)._smoothScrollInstance = {};
            directive.ngDoCheck();
            expect((directive as any).refreshIScroll).toHaveBeenCalled();
        });

        it('should destroy smooth scroll if disabled and initialized', () => {
            (directive as any)._isEnabled = false;
            (directive as any)._smoothScrollInstance = { destroy: jest.fn() };
            directive.ngDoCheck();
            expect((directive as any)._smoothScrollInstance.destroy).toHaveBeenCalled();
        });
    });

    describe('ngOnDestroy', () => {
        it('should destroy smooth scroll instance if it exists', () => {
            const mockDestroy = jest.fn();
            (directive as any)._smoothScrollInstance = { destroy: mockDestroy };
            directive.ngOnDestroy();
            expect(mockDestroy).toHaveBeenCalled();
        });

        it('should call cancelSubscription if it exists', () => {
            const mockCancelSubscription = jest.fn();
            (directive as any).cancelSubscription = mockCancelSubscription;
            directive.ngOnDestroy();
            expect(mockCancelSubscription).toHaveBeenCalled();
        });
    });

    describe('wmSmoothscroll setter', () => {
        beforeEach(() => {
            (directive as any).applySmoothScroll = jest.fn().mockReturnValue({});
            (directive as any).ngOnDestroy = jest.fn();
        });

        it('should enable smooth scroll when set to true', () => {
            directive.wmSmoothscroll = true;
            expect((directive as any)._isEnabled).toBe(true);
            expect((directive as any).applySmoothScroll).toHaveBeenCalled();
        });

        it('should enable smooth scroll when set to "true"', () => {
            directive.wmSmoothscroll = 'true';
            expect((directive as any)._isEnabled).toBe(true);
            expect((directive as any).applySmoothScroll).toHaveBeenCalled();
        });

        it('should disable smooth scroll when set to false', () => {
            directive.wmSmoothscroll = false;
            expect((directive as any)._isEnabled).toBe(false);
            expect((directive as any).ngOnDestroy).toHaveBeenCalled();
        });

        it('should not apply smooth scroll if already initialized', () => {
            (directive as any)._smoothScrollInstance = {};
            directive.wmSmoothscroll = true;
            expect((directive as any).applySmoothScroll).not.toHaveBeenCalled();
        });
    });


    describe('applySmoothScroll', () => {
        beforeEach(() => {
            (isMobileApp as jest.Mock).mockReturnValue(true);
            (isKitkatDevice as jest.Mock).mockReturnValue(false);

            // Properly mock _$el
            (directive as any)._$el = jest.fn().mockReturnValue({
                addClass: jest.fn(),
                0: {
                    children: [{}],
                    iscroll: {},
                    onscroll: null
                }
            });
            (directive as any)._$el[0] = (directive as any)._$el()[0];

            (directive as any).app = {
                notify: jest.fn()
            };
            (directive as any).pendingIscrolls = [];
        });

        it('should return null if not mobile app', () => {
            (isMobileApp as jest.Mock).mockReturnValue(false);
            const result = (directive as any).applySmoothScroll();
            expect(result).toBeNull();
        });

        it('should return null if Kitkat device', () => {
            (isKitkatDevice as jest.Mock).mockReturnValue(true);
            const result = (directive as any).applySmoothScroll();
            expect(result).toBeNull();
        });

        it('should return null if no children', () => {
            (directive as any)._$el[0].children = [];
            const result = (directive as any).applySmoothScroll();
            expect(result).toBeNull();
        });
    });

});