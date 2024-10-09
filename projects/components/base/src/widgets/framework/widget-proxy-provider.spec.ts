import { WidgetProxyProvider } from './widget-proxy-provider';
import { BaseComponent } from '../common/base/base.component';
import { globalPropertyChangeHandler } from './property-change-handler';

// Mock dependencies
jest.mock('./property-change-handler', () => ({
    globalPropertyChangeHandler: jest.fn(),
}));
jest.mock('./styler', () => ({
    propNameCSSKeyMap: {
        color: 'color',
        backgroundColor: 'background-color',
    },
}));

interface MockBaseComponent extends BaseComponent {
    testMethod: jest.Mock;
    testProperty: string;
    ngOnInit: jest.Mock;
    color: string;
}

let mockInstance: MockBaseComponent;

describe('WidgetProxyProvider', () => {
    let mockInstance: MockBaseComponent;
    let mockWidgetSubType: string;
    let mockPropsByWidgetSubType: Map<string, any>;

    beforeEach(() => {
        mockInstance = {
            testMethod: jest.fn(),
            testProperty: 'initial value',
            ngOnInit: jest.fn(),
            color: 'black',
        } as MockBaseComponent;
        mockWidgetSubType = 'testWidget';
        mockPropsByWidgetSubType = new Map([
            ['testProp', 'testValue'],
        ]);

        // Reset mocks
        jest.clearAllMocks();
    });

    describe('create method', () => {
        it('should return a proxy-like object when Proxy is supported', () => {
            const result = WidgetProxyProvider.create(mockInstance, mockWidgetSubType, mockPropsByWidgetSubType);
            expect(typeof result).toBe('object');
            expect(result).not.toBe(mockInstance);

            // Check if the result has the same properties as mockInstance
            expect(result.testMethod).toBeDefined();
            expect(result.testProperty).toBe('initial value');

            // Check if setting a property triggers globalPropertyChangeHandler
            result.testProperty = 'new value';
            expect(globalPropertyChangeHandler).toHaveBeenCalledWith(mockInstance, 'testProperty', 'new value');
        });

        it('should call globalPropertyChangeHandler when setting a property', () => {
            const proxy = WidgetProxyProvider.create(mockInstance, mockWidgetSubType, mockPropsByWidgetSubType);
            proxy.testProperty = 'new value';
            expect(globalPropertyChangeHandler).toHaveBeenCalledWith(mockInstance, 'testProperty', 'new value');
        });

        it('should return the correct value when getting a property', () => {
            const proxy = WidgetProxyProvider.create(mockInstance, mockWidgetSubType, mockPropsByWidgetSubType);
            expect(proxy.testProperty).toBe('initial value');
        });
    });
    describe('create method (IE11 fallback)', () => {
        let originalProxy: any;
        let originalRAF: any;

        beforeEach(() => {
            originalProxy = (window as any).Proxy;
            (window as any).Proxy = undefined;

            originalRAF = window.requestAnimationFrame;
            (window as any).requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
        });

        afterEach(() => {
            (window as any).Proxy = originalProxy;
            window.requestAnimationFrame = originalRAF;
        });

        it('should bind methods to the correct context', (done) => {
            const proxy = WidgetProxyProvider.create(mockInstance, mockWidgetSubType, mockPropsByWidgetSubType);

            setTimeout(() => {
                proxy.testMethod();
                expect(mockInstance.testMethod).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should bind Angular lifecycle methods in IE11 fallback', (done) => {
            const proxy = WidgetProxyProvider.create(mockInstance, mockWidgetSubType, mockPropsByWidgetSubType);

            setTimeout(() => {
                proxy.ngOnInit();
                expect(mockInstance.ngOnInit).toHaveBeenCalled();
                expect(mockInstance.ngOnInit).toBe(proxy.ngOnInit);
                done();
            }, 0);
        });

        it('should define setters and getters for styles', () => {
            const proxy = WidgetProxyProvider.create(mockInstance, mockWidgetSubType, mockPropsByWidgetSubType);

            proxy.color = 'red';
            expect(globalPropertyChangeHandler).toHaveBeenCalledWith(mockInstance, 'color', 'red');

            expect(proxy.color).toBe('black');
        });

        it('should define setters and getters for props', () => {
            const proxy = WidgetProxyProvider.create(mockInstance, mockWidgetSubType, mockPropsByWidgetSubType);

            proxy.testProp = 'new value';
            expect(globalPropertyChangeHandler).toHaveBeenCalledWith(mockInstance, 'testProp', 'new value');

            // The getter should return the value from the instance, not from mockPropsByWidgetSubType
            expect(proxy.testProp).toBe(undefined);
        });
    });
});