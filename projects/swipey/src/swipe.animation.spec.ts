import { SwipeAnimation } from './swipe.animation'; // adjust import as needed

declare const $: any; // mock jQuery

class SwipeAnimationMock extends SwipeAnimation {
    public animation() {
        return [{ name: 'test' }];
    }
}

describe('SwipeAnimation', () => {
    let swipeAnimation: SwipeAnimationMock;
    let $eleMock: any;

    beforeEach(() => {
        // Mock the jQuery functions used in the class
        $.fn = {
            swipey: {
                DIRECTIONS: {
                    HORIZONTAL: 'horizontal',
                },
            },
        };

        // Mock $ele (jQuery element)
        $eleMock = {
            swipeAnimation: jest.fn(),
        };

        // Instantiate the class
        swipeAnimation = new SwipeAnimationMock();
    });

    describe('bindEvents', () => {
        it('should return "pointer" if PointerEvent is supported', () => {
            (window as any).PointerEvent = true;
            expect(swipeAnimation.bindEvents()).toEqual(['pointer']);
        });

        it('should return "touch" if PointerEvent is not supported', () => {
            (window as any).PointerEvent = false;
            expect(swipeAnimation.bindEvents()).toEqual(['touch']);
        });
    });

    describe('bounds', () => {
        it('should return an empty object', () => {
            expect(swipeAnimation.bounds()).toEqual({});
        });
    });

    describe('context', () => {
        it('should return an empty object', () => {
            expect(swipeAnimation.context()).toEqual({});
        });
    });

    describe('direction', () => {
        it('should return horizontal direction', () => {
            expect(swipeAnimation.direction()).toEqual('horizontal');
        });
    });

    describe('setGesturesEnabled and isGesturesEnabled', () => {
        it('should set and get the gestures enabled flag correctly', () => {
            swipeAnimation.setGesturesEnabled(false);
            expect(swipeAnimation.isGesturesEnabled()).toBe(false);

            swipeAnimation.setGesturesEnabled(true);
            expect(swipeAnimation.isGesturesEnabled()).toBe(true);
        });
    });

    describe('goToLower', () => {
        it('should call swipeAnimation with gotoLower', () => {
            swipeAnimation.init($eleMock); // initialize with mock
            swipeAnimation.goToLower(100);
            swipeAnimation.onLower(); // call onLower to test gotoUpper

            expect($eleMock.swipeAnimation).toHaveBeenCalledWith('gotoLower', 100);
        });
    });

    describe('goToUpper', () => {
        it('should call swipeAnimation with gotoUpper', () => {
            swipeAnimation.init($eleMock); // initialize with mock
            swipeAnimation.goToUpper(200);
            swipeAnimation.onUpper(); // call onUpper to test gotoUpper
            expect($eleMock.swipeAnimation).toHaveBeenCalledWith('gotoUpper', 200);
        });
    });

    describe('threshold', () => {
        it('should return 30', () => {
            expect(swipeAnimation.threshold()).toBe(30);
        });
    });

    describe('init', () => {
        it('should initialize swipeAnimation with correct parameters', () => {
            const $swipeTargetEleMock = {}; // mock swipe target element
            swipeAnimation.onAnimation(null, 0); // call onAnimation to test binding
            // Spy on all relevant methods and mock return values
            const animationSpy = jest.spyOn(swipeAnimation, 'animation').mockReturnValue([{ name: 'testAnimation' }]);

            // Call the init method
            swipeAnimation.init($eleMock, $swipeTargetEleMock);

            // Check that swipeAnimation was called with the expected parameters
            expect($eleMock.swipeAnimation).toHaveBeenCalledWith({
                animation: [{ name: 'testAnimation' }], // the mocked return value of animationSpy
                target: $swipeTargetEleMock,
                bounds: expect.any(Function), // function bound to `this`
                bindEvents: ['touch'], // since window.PointerEvent is false by default
                context: expect.any(Function), // function bound to `this`
                direction: 'horizontal', // directly from the method
                enableGestures: expect.any(Function), // function bound to `this`
                onAnimation: expect.any(Function), // function bound to `this`
                onLower: expect.any(Function), // function bound to `this`
                onUpper: expect.any(Function), // function bound to `this`
                threshold: 30, // threshold method return value
                disableMouse: true,
            });

            // Ensure that swipeAnimation method itself was called
            expect(animationSpy).toHaveBeenCalled();
        });
    });

});
