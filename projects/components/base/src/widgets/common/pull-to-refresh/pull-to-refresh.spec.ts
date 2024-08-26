import { PullToRefresh } from './pull-to-refresh';
import { isIos, setCSS } from '@wm/core';

// Mock dependencies
jest.mock('@swipey');
jest.mock('@wm/core');

describe('PullToRefresh', () => {
  let pullToRefresh: PullToRefresh;
  let mockEl: any;
  let mockApp: any;
  let mockOnPullToRefresh: jest.Mock;

  beforeEach(() => {
    // Mock jQuery
    (global as any).$ = jest.fn().mockReturnValue({
      prepend: jest.fn(),
      find: jest.fn().mockReturnValue({
        addClass: jest.fn(),
        show: jest.fn(),
        hide: jest.fn(),
        removeClass: jest.fn(),
      }),
      // Add this line to mock the array-like behavior of jQuery objects
      0: {
        iscroll: {
          y: 0
        }
      }
    });

    mockEl = $('<div>');
    mockApp = {
      subscribe: jest.fn(),
    };
    mockOnPullToRefresh = jest.fn();

    (isIos as jest.Mock).mockReturnValue(false);

    pullToRefresh = new PullToRefresh(mockEl, mockApp, mockOnPullToRefresh);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('constructor initializes properly', () => {
    expect(mockEl.prepend).toHaveBeenCalledWith('<div class="refresh-container"></div>');
    expect(pullToRefresh['infoContainer']).toBeDefined();
  });

  test('threshold returns 10', () => {
    expect(pullToRefresh.threshold()).toBe(10);
  });


  test('bounds returns correct values when scroll is at top', () => {
    const mockEvent = {} as any;
    const mockD = 0;
    const result = pullToRefresh.bounds(mockEvent, mockD);
    expect(result).toEqual({
      lower: 0,
      center: 0,
      upper: 150,
      strict: true,
    });
  });

  test('bounds returns undefined values when scroll is not at top', () => {
    const mockEvent = {} as any;
    const mockD = 0;

    // Mock scroll position not at top
    (pullToRefresh['$el'][0] as any).iscroll.y = -10;

    const result = pullToRefresh.bounds(mockEvent, mockD);
    expect(result).toEqual({
      lower: undefined,
      upper: undefined,
    });
  });

  test('bounds returns undefined values when $d is negative', () => {
    const mockEvent = {} as any;
    const mockD = -1;

    const result = pullToRefresh.bounds(mockEvent, mockD);
    expect(result).toEqual({
      lower: undefined,
      upper: undefined,
    });
  });

  test('bounds initializes spinner for iOS', () => {
    (isIos as jest.Mock).mockReturnValue(true);
    pullToRefresh = new PullToRefresh(mockEl, mockApp, mockOnPullToRefresh);

    const mockEvent = {} as any;
    const mockD = 0;

    const result = pullToRefresh.bounds(mockEvent, mockD);

    expect(result).toEqual({
      lower: 0,
      center: 0,
      upper: 0,
      strict: false,
    });
    expect(pullToRefresh['spinner']).toBeDefined();
  });

  test('context returns object with spin function', () => {
    const context = pullToRefresh.context();
    expect(context).toHaveProperty('spin');
    expect(typeof context['spin']).toBe('function');
  });

  test('animation returns correct object for Android', () => {
    const result = pullToRefresh.animation();
    expect(result).toHaveProperty('target');
    expect(result).toHaveProperty('css');
  });

  test('animation returns correct object for iOS', () => {
    (isIos as jest.Mock).mockReturnValue(true);
    const result = pullToRefresh.animation();
    expect(result).toHaveProperty('css');
    expect(result.css).toHaveProperty('transform');
    expect(result.css).toHaveProperty('spin');
  });

  test('onAnimation starts spinner and calls onPullToRefresh', () => {
    const mockSpinner = {
      start: jest.fn(),
      stop: jest.fn(),
      setRotation: jest.fn(),
    };
    pullToRefresh['spinner'] = mockSpinner;

    pullToRefresh.onAnimation();

    expect(mockSpinner.start).toHaveBeenCalled();
    expect(mockOnPullToRefresh).toHaveBeenCalled();
  });

  test('stopAnimation stops spinner and hides infoContainer', () => {
    jest.useFakeTimers();

    const mockSpinner = {
      start: jest.fn(),
      stop: jest.fn(),
      setRotation: jest.fn(),
    };
    pullToRefresh['spinner'] = mockSpinner;

    pullToRefresh.stopAnimation();

    jest.runAllTimers();

    expect(mockSpinner.stop).toHaveBeenCalled();
    expect(pullToRefresh['infoContainer'].hide).toHaveBeenCalled();
    expect(setCSS).toHaveBeenCalledTimes(2);
  });

  test('wait sets runAnimation to true', () => {
    pullToRefresh.wait();
    expect(pullToRefresh['runAnimation']).toBe(true);
  });

  describe('subscribe method', () => {
    beforeEach(() => {
      pullToRefresh['animationInProgress'] = false;
      pullToRefresh['count'] = 0;
      pullToRefresh.wait = jest.fn();
      pullToRefresh.stopAnimation = jest.fn();
    });

    test('should set up subscription correctly', () => {
      pullToRefresh['subscribe']();
      expect(mockApp.subscribe).toHaveBeenCalledWith('toggle-variable-state', expect.any(Function));
    });

    test('should increment count and call wait when data.active is true and animation is in progress', () => {
      pullToRefresh['subscribe']();
      const callback = mockApp.subscribe.mock.calls[0][1];

      pullToRefresh['animationInProgress'] = true;
      callback({ active: true });

      expect(pullToRefresh['count']).toBe(1);
      expect(pullToRefresh.wait).toHaveBeenCalled();
    });

    test('should decrement count when data.active is false and count is greater than 0', () => {
      pullToRefresh['subscribe']();
      const callback = mockApp.subscribe.mock.calls[0][1];

      pullToRefresh['count'] = 2;
      callback({ active: false });

      expect(pullToRefresh['count']).toBe(1);
    });

    test('should call stopAnimation when count becomes 0 and animation is in progress', () => {
      pullToRefresh['subscribe']();
      const callback = mockApp.subscribe.mock.calls[0][1];

      pullToRefresh['animationInProgress'] = true;
      pullToRefresh['count'] = 1;
      callback({ active: false });

      expect(pullToRefresh['count']).toBe(0);
      expect(pullToRefresh.stopAnimation).toHaveBeenCalled();
    });

    test('should not call stopAnimation when count is not 0', () => {
      pullToRefresh['subscribe']();
      const callback = mockApp.subscribe.mock.calls[0][1];

      pullToRefresh['animationInProgress'] = true;
      pullToRefresh['count'] = 2;
      callback({ active: false });

      expect(pullToRefresh['count']).toBe(1);
      expect(pullToRefresh.stopAnimation).not.toHaveBeenCalled();
    });

    test('should not call stopAnimation when animation is not in progress', () => {
      pullToRefresh['subscribe']();
      const callback = mockApp.subscribe.mock.calls[0][1];

      pullToRefresh['animationInProgress'] = false;
      pullToRefresh['count'] = 1;
      callback({ active: false });

      expect(pullToRefresh['count']).toBe(0);
      expect(pullToRefresh.stopAnimation).not.toHaveBeenCalled();
    });

    test('should store cancelSubscription function', () => {
      const mockCancelFunction = jest.fn();
      mockApp.subscribe.mockReturnValue(mockCancelFunction);

      pullToRefresh['subscribe']();

      expect(pullToRefresh['cancelSubscription']).toBe(mockCancelFunction);
    });
  });

  describe('Spinner functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('bounds initializes AndroidSpinner when not iOS', () => {
      const mockEvent = {} as any;
      const mockD = 0;

      pullToRefresh.bounds(mockEvent, mockD);

      expect(mockEl.find('.android-spinner')).toBeDefined();
    });

    test('bounds initializes IOSSpinner when iOS', () => {
      (isIos as jest.Mock).mockReturnValue(true);
      pullToRefresh = new PullToRefresh(mockEl, mockApp, mockOnPullToRefresh);

      const mockEvent = {} as any;
      const mockD = 0;

      pullToRefresh.bounds(mockEvent, mockD);

      expect(mockEl.find('.ios-spinner')).toBeDefined();
    });
  });
});