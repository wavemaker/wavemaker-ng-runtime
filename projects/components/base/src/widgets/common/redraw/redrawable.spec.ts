import { RedrawableDirective } from './redrawable.directive';
import { WidgetRef } from '../../framework/types';

interface MockWidgetRef extends WidgetRef {
    $element: any;
    redraw?: jest.Mock;
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
            redraw: jest.fn()
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
    });
});