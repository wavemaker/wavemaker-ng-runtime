import { ShowInDeviceDirective } from './show-in-device.directive';
import { TemplateRef, ViewContainerRef, Injector } from '@angular/core';

jest.mock('@wm/core', () => ({
    isLargeTabletLandscape: jest.fn(),
    isLargeTabletPortrait: jest.fn(),
}));

describe('ShowInDeviceDirective', () => {
    let directive: ShowInDeviceDirective;
    let viewContainerRef: ViewContainerRef;
    let templateRef: TemplateRef<any>;
    let injector: Injector;

    beforeEach(() => {
        viewContainerRef = {
            createEmbeddedView: jest.fn(),
            clear: jest.fn(),
        } as unknown as ViewContainerRef;

        templateRef = {} as TemplateRef<any>;

        injector = {
            _lView: [null, null, null, null, null, null, null, null, {}],
        } as unknown as Injector;

        // Mock window.matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });

        // Mock getComputedStyle
        Object.defineProperty(window, 'getComputedStyle', {
            value: () => ({
                getPropertyValue: (prop: string) => {
                    const values = {
                        '--screen-lg': '1200px',
                        '--screen-md': '992px',
                        '--screen-sm': '768px',
                        '--screen-lg-tab-landscape': '1366px',
                        '--screen-lg-tab-portrait': '1024px',
                    };
                    return values[prop] || '';
                },
            }),
        });

        directive = new ShowInDeviceDirective(viewContainerRef, injector, templateRef, null);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should set devices when wmShowInDevice input changes', () => {
        directive.wmShowInDevice = 'lg,md';
        expect((directive as any).devices).toEqual(['lg', 'md']);
    });

    it('should create embedded view for large screen', () => {
        window.matchMedia = jest.fn().mockImplementation(query => ({
            matches: query === '(min-width: 1200px)',
            media: query,
        }));

        directive.wmShowInDevice = 'lg';
        (directive as any).onResize();

        expect(viewContainerRef.createEmbeddedView).toHaveBeenCalled();
    });

    it('should create embedded view for tablet landscape', () => {
        window.matchMedia = jest.fn().mockImplementation(query => ({
            matches: query === '(min-width: 992px) and (max-width: 1199px)',
            media: query,
        }));

        directive.wmShowInDevice = 'md';
        (directive as any).onResize();

        expect(viewContainerRef.createEmbeddedView).toHaveBeenCalled();
    });

    it('should create embedded view for tablet portrait', () => {
        window.matchMedia = jest.fn().mockImplementation(query => ({
            matches: query === '(min-width: 768px) and (max-width: 991px)',
            media: query,
        }));

        directive.wmShowInDevice = 'sm';
        (directive as any).onResize();

        expect(viewContainerRef.createEmbeddedView).toHaveBeenCalled();
    });

    it('should create embedded view for mobile', () => {
        window.matchMedia = jest.fn().mockImplementation(query => ({
            matches: query === '(max-width: 767px)',
            media: query,
        }));

        directive.wmShowInDevice = 'xs';
        (directive as any).onResize();

        expect(viewContainerRef.createEmbeddedView).toHaveBeenCalled();
    });

    it('should always create embedded view for "all" devices', () => {
        directive.wmShowInDevice = 'all';
        (directive as any).onResize();

        expect(viewContainerRef.createEmbeddedView).toHaveBeenCalled();
    });

    it('should clear view when no matching device', () => {
        window.matchMedia = jest.fn().mockImplementation(() => ({
            matches: false,
            media: '',
        }));

        directive.wmShowInDevice = 'lg';
        (directive as any).onResize();

        expect(viewContainerRef.clear).toHaveBeenCalled();
    });

    it('should remove event listener on destroy', () => {
        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
        directive.ngOnDestroy();
        expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
});