import { RedrawableDirective } from './redrawable.directive';
import { WidgetRef } from '../../framework/types';

interface MockWidgetRef extends WidgetRef {
    $element: any;
    redraw?: jest.Mock;
    widgetType : string;
    Widgets  : any
}

describe('RedrawableDirective', () => {
    let directive: RedrawableDirective;
    let mockWidget: MockWidgetRef;
    let mockElement: any;

    beforeEach(() => {
        mockElement = {
            closest: jest.fn().mockReturnThis(),
            find: jest.fn().mockReturnThis(),
            hasClass: jest.fn()
        };

        mockWidget = {
            $element: mockElement,
            redraw: jest.fn(),
            widgetType : 'wm-widget'
        } as MockWidgetRef;

        directive = new RedrawableDirective(mockWidget);
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should set up redraw function', () => {
        expect(typeof directive.redraw).toBe('function');
    });

    describe('redraw function', () => {
        it('should not call widget.redraw if tab is not active', () => {
            mockElement.closest.mockImplementation((selector) => {
                if (selector === '[wmtabpane]') {
                    return { length: 1, hasClass: jest.fn().mockReturnValue(false) };
                }
                return { length: 0, find: jest.fn().mockReturnThis() };
            });

            directive.redraw();

            expect(mockWidget.redraw).not.toHaveBeenCalled();
        });

        it('should not call widget.redraw if accordion is not active', () => {
            mockElement.closest.mockImplementation((selector) => {
                if (selector === '[wmtabpane]') {
                    return { length: 0 };
                }
                if (selector === '[wmaccordionpane]') {
                    return {
                        find: jest.fn().mockReturnValue({
                            length: 1,
                            hasClass: jest.fn().mockReturnValue(false)
                        })
                    };
                }
                return mockElement;
            });

            directive.redraw();

            expect(mockWidget.redraw).not.toHaveBeenCalled();
        });

        it('should call widget.redraw if tab is active', () => {
            mockElement.closest.mockImplementation((selector) => {
                if (selector === '[wmtabpane]') {
                    return { length: 1, hasClass: jest.fn().mockReturnValue(true) };
                }
                return { length: 0, find: jest.fn().mockReturnThis() };
            });

            directive.redraw();

            expect(mockWidget.redraw).toHaveBeenCalled();
        });

        it('should call widget.redraw if accordion is active', () => {
            mockElement.closest.mockImplementation((selector) => {
                if (selector === '[wmtabpane]') {
                    return { length: 0 };
                }
                if (selector === '[wmaccordionpane]') {
                    return {
                        find: jest.fn().mockReturnValue({
                            length: 1,
                            hasClass: jest.fn().mockReturnValue(true)
                        })
                    };
                }
                return mockElement;
            });

            directive.redraw();

            expect(mockWidget.redraw).toHaveBeenCalled();
        });

        it('should not throw if widget.redraw is undefined', () => {
            mockElement.closest.mockImplementation((selector) => {
                if (selector === '[wmtabpane]') {
                    return { length: 1, hasClass: jest.fn().mockReturnValue(true) };
                }
                return { length: 0, find: jest.fn().mockReturnThis() };
            });

            delete mockWidget.redraw;

            expect(() => directive.redraw()).not.toThrow();
        });

        it('should call innerWidget.redraw for each widget in prefab', () => {
            const innerWidget1 = { redraw: jest.fn() };
            const innerWidget2 = { redraw: jest.fn() };

            mockElement.closest.mockImplementation((selector) => {
                if (selector === '[wmtabpane]') {
                    return {
                        length: 1,
                        hasClass: jest.fn().mockReturnValue(true)
                    };
                }
                return {
                    length: 0,
                    find: jest.fn().mockReturnThis(),
                    hasClass: jest.fn().mockReturnValue(false)
                };
            });

            mockWidget.widgetType = 'wm-prefab-custom';
            mockWidget.Widgets = {
                widget1: innerWidget1,
                widget2: innerWidget2
            };

            delete mockWidget.redraw;

            directive.redraw();

            expect(innerWidget1.redraw).toHaveBeenCalled();
            expect(innerWidget2.redraw).toHaveBeenCalled();
        });

    });
});