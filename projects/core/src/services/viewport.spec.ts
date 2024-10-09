
import { isAndroid, isAndroidTablet, isIos, Viewport, ViewportEvent } from '@wm/core';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    isAndroid: jest.fn(),
    isAndroidTablet: jest.fn(),
    isIos: jest.fn(),
}));

describe('Viewport Service', () => {
    let viewport: Viewport;
    let eventNotifierSpy: jest.SpyInstance;
    let mockElement: HTMLElement;

    beforeEach(() => {
        window.matchMedia = jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn()
        }));
        // Create a mock element and append it to the document body
        mockElement = document.createElement('div');
        mockElement.className = 'wm-app';
        document.body.appendChild(mockElement);

        // Set mock values for clientWidth and clientHeight
        Object.defineProperty(mockElement, 'clientWidth', {
            value: 1024,
            writable: true,
        });
        Object.defineProperty(mockElement, 'clientHeight', {
            value: 768,
            writable: true,
        });

        viewport = new Viewport();
        eventNotifierSpy = jest.spyOn(viewport._eventNotifier, 'notify');
        jest.spyOn(window, 'getComputedStyle').mockReturnValue({
            getPropertyValue: (prop: string) => {
                if (prop === '--screen-xs') return '480';
                if (prop === '--screen-sm') return '768';
                if (prop === '--screen-lg') return '1200';
                return '';
            },
        } as CSSStyleDeclaration);
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.body.removeChild(mockElement);
    });

    it('should initialize with correct default values', () => {
        expect(viewport.orientation.isPortrait).toBeDefined();
        expect(viewport.orientation.isLandscape).toBeDefined();
        expect(viewport.isMobileType).toBe(false);
    });

    it('should set screen type correctly based on screen width and height', () => {
        (viewport as any).setScreenType();

        expect(viewport.isTabletType).toBe(true);
        expect(viewport.isMobileType).toBe(false);
    });

    it('should notify on orientation change', () => {
        const mockEvent = { matches: true } as MediaQueryListEvent;
        (viewport as any).orientationChange(mockEvent, false);

        expect(viewport.orientation.isPortrait).toBe(true);
        expect(viewport.orientation.isLandscape).toBe(false);
        expect(eventNotifierSpy).toHaveBeenCalledWith(ViewportEvent.ORIENTATION_CHANGE, {
            $event: mockEvent,
            data: { isPortrait: true, isLandscape: false },
        });
    });

    it('should notify on resize', () => {
        const mockEvent = new Event('resize');
        const setScreenTypeSpy = jest.spyOn((viewport as any), 'setScreenType');
        const orientationChangeSpy = jest.spyOn((viewport as any), 'orientationChange');

        (viewport as any).resizeFn(mockEvent);

        expect(setScreenTypeSpy).toHaveBeenCalled();
        expect(orientationChangeSpy).toHaveBeenCalledWith(mockEvent, expect.any(Boolean));
        expect(eventNotifierSpy).toHaveBeenCalledWith(ViewportEvent.RESIZE, {
            $event: mockEvent,
            data: { screenWidth: (viewport as any).screenWidth, screenHeight: (viewport as any).screenHeight },
        });
    });

    it('should update selectedViewPort and set screen type', () => {
        const selectedViewPort = { deviceCategory: 'Smartphone' };
        const setScreenTypeSpy = jest.spyOn((viewport as any), 'setScreenType');

        viewport.update(selectedViewPort);

        expect((viewport as any).selectedViewPort).toBe(selectedViewPort);
        expect(setScreenTypeSpy).toHaveBeenCalled();
    });

    it('should subscribe to events correctly', () => {
        const callback = jest.fn();
        const subscribeSpy = jest.spyOn(viewport._eventNotifier, 'subscribe');

        viewport.subscribe(ViewportEvent.RESIZE, callback);

        expect(subscribeSpy).toHaveBeenCalledWith(ViewportEvent.RESIZE, callback);
    });

    it('should clean up on destroy', () => {
        const destroySpy = jest.spyOn(viewport._eventNotifier, 'destroy');
        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

        viewport.ngOnDestroy();

        expect(destroySpy).toHaveBeenCalled();
        expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', (viewport as any).resizeFn);
    });

    it('should set screen type correctly based on device category "Tab"', () => {
        (viewport as any).selectedViewPort = { deviceCategory: 'Tab' };
        (viewport as any).setScreenType();

        expect(viewport.isTabletType).toBe(true);
        expect(viewport.isMobileType).toBe(false);
    });

    it('should set screen type correctly based on device category "Smartphone"', () => {
        (viewport as any).selectedViewPort = { deviceCategory: 'Smartphone' };
        (viewport as any).setScreenType();

        expect(viewport.isTabletType).toBe(false);
        expect(viewport.isMobileType).toBe(true);
    });

    it('should set screen type to "Tablet" based on screen width and height', () => {
        Object.defineProperty(mockElement, 'clientWidth', { value: 1300 });
        Object.defineProperty(mockElement, 'clientHeight', { value: 800 });

        (viewport as any).setScreenType();

        expect(viewport.isTabletType).toBe(false);
        expect(viewport.isMobileType).toBe(false);
    });

    it('should set screen type to "Mobile" based on screen width and height', () => {
        Object.defineProperty(mockElement, 'clientWidth', { value: 400 });
        Object.defineProperty(mockElement, 'clientHeight', { value: 800 });

        (viewport as any).setScreenType();

        expect(viewport.isTabletType).toBe(false);
        expect(viewport.isMobileType).toBe(true);
    });

    it('should handle Android or iOS tablet detection correctly', () => {
        (isAndroid as jest.Mock).mockReturnValue(true);
        (isIos as jest.Mock).mockReturnValue(false);
        (isAndroidTablet as jest.Mock).mockReturnValue(true);

        Object.defineProperty(mockElement, 'clientWidth', { value: 900 });
        Object.defineProperty(mockElement, 'clientHeight', { value: 1200 });

        (viewport as any).setScreenType();

        expect(viewport.isTabletType).toBe(true);
        expect(viewport.isMobileType).toBe(false);
    });

    it('should handle default mobile detection correctly when screen width is less than tab width', () => {
        Object.defineProperty(mockElement, 'clientWidth', { value: 600 });
        Object.defineProperty(mockElement, 'clientHeight', { value: 800 });

        (viewport as any).setScreenType();

        expect(viewport.isTabletType).toBe(false);
        expect(viewport.isMobileType).toBe(true);
    });

    it('should set orientation correctly based on media query', () => {
        const mockQueryList = {
            matches: true, // Simulate portrait mode
            addEventListener: jest.fn(),
        };

        jest.spyOn(window, 'matchMedia').mockReturnValue(mockQueryList as any);

        // Reinitialize viewport to apply the mocked matchMedia
        viewport = new Viewport();

        expect(viewport.orientation.isPortrait).toBe(true);
        expect(viewport.orientation.isLandscape).toBe(false);
        expect(mockQueryList.addEventListener).toHaveBeenCalledWith(
            'change',
            expect.any(Function)
        );
    });

    it('should set landscape orientation when media query does not match', () => {
        const mockQueryList = {
            matches: false, // Simulate landscape mode
            addEventListener: jest.fn(),
        };

        jest.spyOn(window, 'matchMedia').mockReturnValue(mockQueryList as any);

        // Reinitialize viewport to apply the mocked matchMedia
        viewport = new Viewport();

        expect(viewport.orientation.isPortrait).toBe(false);
        expect(viewport.orientation.isLandscape).toBe(true);
        expect(mockQueryList.addEventListener).toHaveBeenCalledWith(
            'change',
            expect.any(Function)
        );
    });

    it('should add event listener for orientation change', () => {
        const mockQueryList = {
            matches: true, // Simulate portrait mode
            addEventListener: jest.fn(),
        };

        jest.spyOn(window, 'matchMedia').mockReturnValue(mockQueryList as any);

        // Reinitialize viewport to apply the mocked matchMedia
        viewport = new Viewport();

        // Check that addEventListener is called
        expect(mockQueryList.addEventListener).toHaveBeenCalledWith(
            'change',
            expect.any(Function)
        );

        // Simulate the change event being triggered
        const mockEvent = {
            matches: false,
        } as MediaQueryListEvent;

        // Extract the listener function that was attached
        const addEventListenerCallback = mockQueryList.addEventListener.mock.calls[0][1];
        addEventListenerCallback(mockEvent);

        // Verify that the orientation change was handled
        expect(viewport.orientation.isPortrait).toBe(false);
        expect(viewport.orientation.isLandscape).toBe(true);
    })
});

