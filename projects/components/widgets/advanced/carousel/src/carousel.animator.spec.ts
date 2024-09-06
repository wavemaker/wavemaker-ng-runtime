import { NgZone } from '@angular/core';
import { CarouselAnimator } from './carousel.animator';
import { CarouselDirective } from './carousel.directive';

// Mock SwipeAnimation
jest.mock('@swipey', () => ({
    SwipeAnimation: class MockSwipeAnimation {
        init() { }
        bounds() { }
        context() { }
        animation() { }
        onUpper() { }
        onLower() { }
        onAnimation() { }
        threshold() { }
    }
}));

describe('CarouselAnimator', () => {
    let carouselAnimator: CarouselAnimator;
    let mockCarouselDirective: jest.Mocked<CarouselDirective>;
    let mockNgZone: jest.Mocked<NgZone>;
    let mockJQuery: jest.Mock;
    let mockJQueryInstance: any;
    let leftControlClickHandler: Function;
    let rightControlClickHandler: Function;

    beforeEach(() => {
        // Create a more robust mock for jQuery
        mockJQueryInstance = {
            find: jest.fn().mockReturnThis(),
            each: jest.fn().mockImplementation(function (callback) {
                callback.call(this);
                return this;
            }),
            on: jest.fn().mockImplementation((event, handler) => {
                if (event === 'click') {
                    if (handler.toString().includes('left.carousel-control')) {
                        leftControlClickHandler = handler;
                    } else if (handler.toString().includes('right.carousel-control')) {
                        rightControlClickHandler = handler;
                    }
                }
                return mockJQueryInstance;
            }),
            append: jest.fn().mockReturnThis(),
            width: jest.fn().mockReturnValue(100),
            eq: jest.fn().mockReturnThis(),
            addClass: jest.fn().mockReturnThis(),
            removeClass: jest.fn().mockReturnThis(),
            filter: jest.fn().mockReturnThis(),
            css: jest.fn().mockReturnThis(),
            add: jest.fn().mockReturnThis(),
            attr: jest.fn().mockReturnThis()
        };
        Object.setPrototypeOf(mockJQueryInstance, Array.prototype);

        mockJQuery = jest.fn().mockReturnValue(mockJQueryInstance);
        (global as any).$ = mockJQuery;

        // Mock CarouselDirective
        mockCarouselDirective = {
            getNativeElement: jest.fn().mockReturnValue(document.createElement('div')),
            onChangeCB: jest.fn()
        } as any;

        // Mock NgZone
        mockNgZone = {
            runOutsideAngular: jest.fn(callback => callback())
        } as any;

        carouselAnimator = new CarouselAnimator(mockCarouselDirective, 5000, mockNgZone);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create an instance', () => {
        expect(carouselAnimator).toBeTruthy();
    });

    it('should initialize with correct properties', () => {
        expect(mockJQuery).toHaveBeenCalledWith(mockCarouselDirective.getNativeElement());
        expect(mockNgZone.runOutsideAngular).toHaveBeenCalled();
    });

    it('should handle bounds correctly', () => {
        const bounds = carouselAnimator.bounds();
        expect(bounds).toEqual({
            'lower': -100,
            'center': 0,
            'upper': 100
        });
    });

    it('should return correct animation configuration', () => {
        const animation = carouselAnimator.animation();
        expect(animation).toHaveLength(1);
        expect(animation[0].css).toBeDefined();
    });

    it('should start and stop interval correctly', () => {
        jest.useFakeTimers();
        const setIntervalSpy = jest.spyOn(global, 'setInterval');
        const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

        carouselAnimator.start();
        expect(setIntervalSpy).toHaveBeenCalledTimes(1);
        expect(setIntervalSpy).toHaveBeenLastCalledWith(expect.any(Function), 5000);

        carouselAnimator.stop();
        expect(clearIntervalSpy).toHaveBeenCalled();

        jest.useRealTimers();
        setIntervalSpy.mockRestore();
        clearIntervalSpy.mockRestore();
    });

    it('should pause and resume animation', () => {
        carouselAnimator.pause();
        expect((carouselAnimator as any)._animationPaused).toBe(true);

        carouselAnimator.resume();
        expect((carouselAnimator as any)._animationPaused).toBe(false);
    });

    it('should return correct threshold', () => {
        expect(carouselAnimator.threshold()).toBe(5);
    });

    it('should set active item correctly', () => {
        const setActiveItemSpy = jest.spyOn(carouselAnimator as any, 'setActiveItem');
        (carouselAnimator as any).setActiveItem();
        expect(setActiveItemSpy).toHaveBeenCalled();
    });

    describe('getTarget', () => {
        beforeEach(() => {
            carouselAnimator['_items'] = mockJQueryInstance;
            carouselAnimator['_items'].length = 5;
        });

        it('should return correct items when _activeIndex is in the middle', () => {
            carouselAnimator['_activeIndex'] = 2;

            carouselAnimator['getTarget']();

            expect(mockJQueryInstance.eq).toHaveBeenCalledWith(2);
            expect(mockJQueryInstance.eq).toHaveBeenCalledWith(1);
            expect(mockJQueryInstance.eq).toHaveBeenCalledWith(3);
            expect(mockJQueryInstance.add).toHaveBeenCalledTimes(2);
        });

        it('should handle wrap-around when _activeIndex is at the start', () => {
            carouselAnimator['_activeIndex'] = 0;

            carouselAnimator['getTarget']();

            expect(mockJQueryInstance.eq).toHaveBeenCalledWith(0);
            expect(mockJQueryInstance.eq).toHaveBeenCalledWith(4);
            expect(mockJQueryInstance.eq).toHaveBeenCalledWith(1);
            expect(mockJQueryInstance.add).toHaveBeenCalledTimes(2);
        });

        it('should handle wrap-around when _activeIndex is at the end', () => {
            carouselAnimator['_activeIndex'] = 4;

            carouselAnimator['getTarget']();

            expect(mockJQueryInstance.eq).toHaveBeenCalledWith(4);
            expect(mockJQueryInstance.eq).toHaveBeenCalledWith(3);
            expect(mockJQueryInstance.eq).toHaveBeenCalledWith(0);
            expect(mockJQueryInstance.add).toHaveBeenCalledTimes(2);
        });
    });

    describe('resetTransition', () => {
        it('should reset CSS properties for transition and transform', () => {
            const mockTarget = mockJQuery();
            jest.spyOn(carouselAnimator as any, 'getTarget').mockReturnValue(mockTarget);

            carouselAnimator['resetTransition']();

            expect(mockTarget.css).toHaveBeenCalledWith({
                '-webkit-transition': 'none',
                '-webkit-transform': '',
                'transition': 'none',
                'transform': ''
            });
        });
    });

    describe('onUpper', () => {
        it('should decrease active index and reset swiping', () => {
            carouselAnimator['_activeIndex'] = 2;
            carouselAnimator['_swiping'] = true;

            jest.spyOn(carouselAnimator as any, 'resetTransition').mockImplementation();
            jest.spyOn(carouselAnimator as any, 'setActiveItem').mockImplementation();

            carouselAnimator.onUpper();

            expect(carouselAnimator['_activeIndex']).toBe(1);
            expect(carouselAnimator['_swiping']).toBe(false);
            expect(carouselAnimator['resetTransition']).toHaveBeenCalled();
            expect(carouselAnimator['setActiveItem']).toHaveBeenCalled();
        });
    });

    describe('onLower', () => {
        it('should increase active index and reset swiping', () => {
            carouselAnimator['_activeIndex'] = 2;
            carouselAnimator['_swiping'] = true;

            jest.spyOn(carouselAnimator as any, 'resetTransition').mockImplementation();
            jest.spyOn(carouselAnimator as any, 'setActiveItem').mockImplementation();

            carouselAnimator.onLower();

            expect(carouselAnimator['_activeIndex']).toBe(3);
            expect(carouselAnimator['_swiping']).toBe(false);
            expect(carouselAnimator['resetTransition']).toHaveBeenCalled();
            expect(carouselAnimator['setActiveItem']).toHaveBeenCalled();
        });
    });

    describe('onAnimation', () => {
        it('should update indexes and set aria labels', () => {
            carouselAnimator['_items'] = [{}, {}, {}];
            carouselAnimator['_activeIndex'] = 1;
            carouselAnimator['_oldIndex'] = 0;

            carouselAnimator.onAnimation();

            expect(mockCarouselDirective.onChangeCB).toHaveBeenCalledWith(1, 0);
            expect(carouselAnimator['_oldIndex']).toBe(1);
            expect(mockJQueryInstance.attr).toHaveBeenCalledTimes(2);
        });
    });

    describe('start', () => {
        beforeEach(() => {
            // Ensure goToLower is mocked before each test
            carouselAnimator.goToLower = jest.fn();
        });

        it('should start the interval and call goToLower', () => {
            jest.useFakeTimers();
            carouselAnimator['_swiping'] = false;
            carouselAnimator['_pauseCaroselTill'] = 0;

            carouselAnimator.start();

            // Fast-forward time
            jest.advanceTimersByTime(5001);

            // Check if goToLower was called with the correct argument
            expect(carouselAnimator.goToLower).toHaveBeenCalledWith(600);
            expect(mockNgZone.runOutsideAngular).toHaveBeenCalled();

            // Clear the timer to prevent memory leaks
            jest.clearAllTimers();
        });

        it('should not call goToLower if swiping', () => {
            jest.useFakeTimers();
            carouselAnimator['_swiping'] = true;
            carouselAnimator['_pauseCaroselTill'] = 0;

            carouselAnimator.start();

            jest.advanceTimersByTime(5001);

            expect(carouselAnimator.goToLower).not.toHaveBeenCalled();

            jest.clearAllTimers();
        });

        it('should not call goToLower if paused', () => {
            jest.useFakeTimers();
            carouselAnimator['_swiping'] = false;
            carouselAnimator['_pauseCaroselTill'] = Date.now() + 10000; // Pause for 10 seconds

            carouselAnimator.start();

            jest.advanceTimersByTime(5001);

            expect(carouselAnimator.goToLower).not.toHaveBeenCalled();

            jest.clearAllTimers();
        });
    });

    describe('pause', () => {
        it('should pause animation and start if not already started', () => {
            jest.spyOn(carouselAnimator, 'start').mockImplementation();
            carouselAnimator['_intervalId'] = null;

            carouselAnimator.pause();

            expect(carouselAnimator['_animationPaused']).toBe(true);
            expect(carouselAnimator.start).toHaveBeenCalled();
        });
    });

    describe('context', () => {
        it('should return the width context', () => {
            carouselAnimator['_width'] = 500;

            const result = carouselAnimator.context();

            expect(result).toEqual({ w: 500 });
        });
    });

    describe('constructor', () => {

        beforeEach(() => {
            carouselAnimator.goToLower = jest.fn();
            carouselAnimator.goToUpper = jest.fn();
        });
        it('should initialize properties and bind events', () => {
            jest.spyOn(CarouselAnimator.prototype, 'init').mockImplementation();
            jest.spyOn((CarouselAnimator as any).prototype, 'setActiveItem').mockImplementation();
            jest.spyOn(CarouselAnimator.prototype, 'start').mockImplementation();

            carouselAnimator = new CarouselAnimator(mockCarouselDirective, 5000, mockNgZone);

            expect(carouselAnimator['_$el']).toBeDefined();
            expect(carouselAnimator['_items']).toBeDefined();
            expect(carouselAnimator['_indicators']).toBeDefined();
            expect(CarouselAnimator.prototype.init).toHaveBeenCalled();
            expect((CarouselAnimator as any).prototype.setActiveItem).toHaveBeenCalled();
            expect(CarouselAnimator.prototype.start).toHaveBeenCalled();
            expect(mockJQueryInstance.find).toHaveBeenCalledWith('>.carousel-inner');
            expect(mockJQueryInstance.find).toHaveBeenCalledWith('>.carousel-indicators');
            expect(mockJQueryInstance.find).toHaveBeenCalledWith('>.left.carousel-control');
            expect(mockJQueryInstance.find).toHaveBeenCalledWith('>.right.carousel-control');
            expect(mockJQueryInstance.on).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockJQueryInstance.append).toHaveBeenCalledWith('<span class="sr-only">Previous</span>');
        });

        it('should bind click events for indicators', () => {
            carouselAnimator = new CarouselAnimator(mockCarouselDirective, 5000, mockNgZone);

            const indicatorClickHandler = mockJQueryInstance.on.mock.calls.find(call => call[0] === 'click')[1];
            indicatorClickHandler();

            expect(carouselAnimator['setActiveItem']).toHaveBeenCalled();
            expect(mockCarouselDirective.onChangeCB).toHaveBeenCalled();
        });

    });
}); 