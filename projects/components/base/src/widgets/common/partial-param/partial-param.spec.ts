import { PartialParamDirective, PartialParamHandlerDirective } from './partial-param.directive';
import { Subject } from 'rxjs';
import { $watch } from '@wm/core';

jest.mock('@wm/core', () => ({
    $watch: jest.fn()
}));

describe('PartialParamDirective', () => {
    let directive: PartialParamDirective;
    let mockPartialParamsProvider: jest.Mocked<PartialParamHandlerDirective>;

    beforeEach(() => {
        mockPartialParamsProvider = {
            registerParams: jest.fn()
        } as unknown as jest.Mocked<PartialParamHandlerDirective>;

        directive = new PartialParamDirective(
            'bindValue',
            'string',
            mockPartialParamsProvider
        );
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should set input properties correctly', () => {
        directive.name = 'testName';
        directive.value = 'testValue';
        expect(directive.name).toBe('testName');
        expect(directive.value).toBe('testValue');
    });

    it('should call registerParams on ngOnInit', () => {
        directive.name = 'testName';
        directive.value = 'testValue';
        directive.ngOnInit();
        expect(mockPartialParamsProvider.registerParams).toHaveBeenCalledWith(
            'testName',
            'testValue',
            'bindValue',
            'string'
        );
    });
});

describe('PartialParamHandlerDirective', () => {
    let directive: PartialParamHandlerDirective;
    let mockWidgetRef: any;

    beforeEach(() => {
        mockWidgetRef = {
            partialParams: {},
            pageParams: {},
            params$: new Subject(),
            registerDestroyListener: jest.fn(),
            getViewParent: jest.fn(),
            context: {}
        };

        directive = new PartialParamHandlerDirective(mockWidgetRef);
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should initialize widgetRef properties', () => {
        expect(mockWidgetRef.partialParams).toEqual({});
        expect(mockWidgetRef.pageParams).toBe(mockWidgetRef.partialParams);
        expect(mockWidgetRef.params$).toBeInstanceOf(Subject);
    });

    describe('registerParams', () => {
        it('should set param value and emit when value is provided', () => {
            const nextSpy = jest.spyOn(mockWidgetRef.params$, 'next');
            directive.registerParams('testName', 'testValue', '', 'string');
            expect(mockWidgetRef.partialParams['testName']).toBe('testValue');
            expect(nextSpy).toHaveBeenCalled();
        });

        it('should set up $watch when bindExpr is provided and value is falsy', () => {
            const mockWatchFn = jest.fn();
            ($watch as jest.Mock).mockReturnValue(mockWatchFn);
            directive.registerParams('testName', '', 'bindExpr', 'string');
            expect($watch).toHaveBeenCalledWith(
                'bindExpr',
                mockWidgetRef.getViewParent(),
                mockWidgetRef.context,
                expect.any(Function)
            );
            expect(mockWidgetRef.registerDestroyListener).toHaveBeenCalledWith(mockWatchFn);
        });

        it('should update param value and emit when $watch callback is triggered', () => {
            const nextSpy = jest.spyOn(mockWidgetRef.params$, 'next');
            ($watch as jest.Mock).mockImplementation((expr, parent, context, callback) => {
                callback('newValue');
            });
            directive.registerParams('testName', '', 'bindExpr', 'string');
            expect(mockWidgetRef.partialParams['testName']).toBe('newValue');
            expect(nextSpy).toHaveBeenCalled();
        });
    });
});