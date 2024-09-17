import { TestBed } from '@angular/core/testing';
import { StatePersistence } from './state-persistence.service';
import { get, includes, isEmpty, merge } from 'lodash-es';

jest.mock('lodash-es', () => ({
    ...jest.requireActual('lodash-es'),
    merge: jest.fn(),
    get: jest.fn(),
    isEmpty: jest.fn(),
    includes: jest.fn(),
}));

describe('StatePersistence', () => {
    let service: StatePersistence;

    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            value: {
                pathname: '/test-path',
                href: 'http://example.com/test-path',
                replace: jest.fn()
            },
            writable: true
        });

        // Mock localStorage and sessionStorage
        const mockStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn()
        };
        Object.defineProperty(window, 'localStorage', { value: mockStorage });
        Object.defineProperty(window, 'sessionStorage', { value: mockStorage });

        // Mock window.history
        Object.defineProperty(window, 'history', {
            value: {
                pushState: jest.fn(),
                replaceState: jest.fn()
            },
            writable: true
        });
        TestBed.configureTestingModule({
            providers: [StatePersistence]
        });
        (get as jest.Mock).mockImplementation((obj, path) => {
            const pathArray = Array.isArray(path) ? path : path.split('.');
            return pathArray.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, obj);
        });
        service = TestBed.inject(StatePersistence);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('setHistoryHandler', () => {
        it('should set the history handler if valid', () => {
            service.setHistoryHandler('push');
            expect((service as any).HISTORY_HANDLER).toBe('push');
        });

        it('should not set the history handler if invalid', () => {
            service.setHistoryHandler('invalid');
            expect((service as any).HISTORY_HANDLER).toBe('replace');
        });
    });

    describe('getNestedPath', () => {
        it('should return the widget name if no viewParent', () => {
            const result = service.getNestedPath(null, 'testWidget');
            expect(result).toBe('testWidget');
        });

        it('should return nested path for prefab', () => {
            const viewParent = {
                prefabName: 'TestPrefab',
                containerWidget: {
                    name: 'container1',
                    viewParent: null
                }
            };
            const result = service.getNestedPath(viewParent, 'testWidget');
            expect(result).toBe('container1.TestPrefab.testWidget');
        });
    });

    describe('getWidgetState', () => {
        let mockWidget;

        beforeEach(() => {
            service.getStateInformation = jest.fn();
            mockWidget = {
                statehandler: 'default',
                getAppInstance: () => ({ activePageName: 'testPage' }),
                getWidget: () => ({ name: 'testWidget' }),
                viewParent: { name: 'parentWidget' }
            };
            service.computeMode = jest.fn().mockReturnValue('localStorage');
            service.getNestedPath = jest.fn().mockReturnValue('parentWidget.testWidget');
        });

        it('should return undefined if mode is not available', () => {
            service.computeMode = jest.fn().mockReturnValue(null);
            expect(service.getWidgetState(mockWidget)).toBeUndefined();
        });

        it('should use the provided mode if available', () => {
            service.getStateInformation = jest.fn().mockReturnValue({});
            service.getWidgetState(mockWidget, 'sessionStorage');
            expect(service.getStateInformation).toHaveBeenCalledWith('sessionStorage');
        });

        it('should return undefined if no state information is available', () => {
            service.getStateInformation = jest.fn().mockReturnValue(null);
            expect(service.getWidgetState(mockWidget)).toBeUndefined();
        });

        it('should return the correct widget state for localStorage mode', () => {
            const mockState = {
                testPage: {
                    [(service as any).WIDGET_STATE_KEY]: {
                        'parentWidget.testWidget': { someState: 'value' }
                    }
                }
            };
            service.getStateInformation = jest.fn().mockReturnValue(mockState);
            expect(service.getWidgetState(mockWidget)).toEqual({ someState: 'value' });
        });

        it('should return undefined if widget state is not found', () => {
            const mockState = {
                testPage: {
                    [(service as any).WIDGET_STATE_KEY]: {}
                }
            };
            service.getStateInformation = jest.fn().mockReturnValue(mockState);
            expect(service.getWidgetState(mockWidget)).toBeUndefined();
        });

        it('should handle non-storage modes correctly', () => {
            service.computeMode = jest.fn().mockReturnValue('url');
            const mockState = {
                [(service as any).WIDGET_STATE_KEY]: {
                    'parentWidget.testWidget': { someState: 'value' }
                }
            };
            service.getStateInformation = jest.fn().mockReturnValue(mockState);
            expect(service.getWidgetState(mockWidget)).toEqual({ someState: 'value' });
        });
    });
    describe('setWidgetState', () => {
        it('should set widget state', () => {
            const widget = {
                statehandler: 'url',
                getWidget: () => ({ name: 'testWidget' }),
                viewParent: null,
                getAppInstance: () => ({ activePageName: 'testPage' })
            };
            const setStateParamsSpy = jest.spyOn(service as any, 'setStateParams');
            service.setWidgetState(widget, { test: 'value' });
            expect(setStateParamsSpy).toHaveBeenCalledWith('ws', 'testWidget', { test: 'value' }, 'url', widget);
        });
    });

    describe('setStateVariable', () => {
        it('should call setStateParams with correct arguments', () => {
            const setStateParamsSpy = jest.spyOn(service as any, 'setStateParams');
            const computeModeSpy = jest.spyOn(service as any, 'computeMode').mockReturnValue('url');
            service.setStateVariable('testVar', 'testValue');
            expect(computeModeSpy).toHaveBeenCalledWith(undefined);
            expect(setStateParamsSpy).toHaveBeenCalledWith('', 'testVar', 'testValue', 'url');
        });

        it('should not call setStateParams if mode is falsy', () => {
            const setStateParamsSpy = jest.spyOn(service as any, 'setStateParams');
            const computeModeSpy = jest.spyOn(service as any, 'computeMode').mockReturnValue(null);
            service.setStateVariable('testVar', 'testValue');
            expect(computeModeSpy).toHaveBeenCalledWith(undefined);
            expect(setStateParamsSpy).not.toHaveBeenCalled();
        });
    });

    describe('getStateVariable', () => {
        it('should return the correct state variable', () => {
            const computeModeSpy = jest.spyOn(service as any, 'computeMode').mockReturnValue('url');
            const getStateInformationSpy = jest.spyOn(service as any, 'getStateInformation').mockReturnValue({
                testVar: 'testValue'
            });
            const result = service.getStateVariable('testVar');
            expect(computeModeSpy).toHaveBeenCalledWith(undefined);
            expect(getStateInformationSpy).toHaveBeenCalledWith('url');
            expect(result).toBe('testValue');
        });

        it('should return undefined if no state information is available', () => {
            const computeModeSpy = jest.spyOn(service as any, 'computeMode').mockReturnValue('url');
            const getStateInformationSpy = jest.spyOn(service as any, 'getStateInformation').mockReturnValue(null);
            const result = service.getStateVariable('testVar');
            expect(computeModeSpy).toHaveBeenCalledWith(undefined);
            expect(getStateInformationSpy).toHaveBeenCalledWith('url');
            expect(result).toBeUndefined();
        });

        it('should return undefined if mode is falsy', () => {
            const computeModeSpy = jest.spyOn(service as any, 'computeMode').mockReturnValue(null);
            const getStateInformationSpy = jest.spyOn(service as any, 'getStateInformation');
            const result = service.getStateVariable('testVar');
            expect(computeModeSpy).toHaveBeenCalledWith(undefined);
            expect(getStateInformationSpy).not.toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });

    describe('removeStateVariable', () => {
        it('should call removeStateParam with correct arguments', () => {
            const removeStateParamSpy = jest.spyOn(service as any, 'removeStateParam');
            const computeModeSpy = jest.spyOn(service as any, 'computeMode').mockReturnValue('url');
            service.removeStateVariable('testVar');
            expect(computeModeSpy).toHaveBeenCalledWith(undefined);
            expect(removeStateParamSpy).toHaveBeenCalledWith('', 'testVar', null, 'url');
        });

        it('should not call removeStateParam if mode is falsy', () => {
            const removeStateParamSpy = jest.spyOn(service as any, 'removeStateParam');
            const computeModeSpy = jest.spyOn(service as any, 'computeMode').mockReturnValue(null);
            service.removeStateVariable('testVar');
            expect(computeModeSpy).toHaveBeenCalledWith(undefined);
            expect(removeStateParamSpy).not.toHaveBeenCalled();
        });
    });

    describe('setStateParams', () => {

        beforeEach(() => {
            (service as any).jsonToUri = jest.fn().mockReturnValue('encoded_state');
            service.getStateInformation = jest.fn().mockReturnValue({});
            (merge as jest.Mock).mockImplementation((obj, source) => ({ ...obj, ...source }));
        });

        it('should not change existing values when setting a new property', () => {
            service.getStateInformation = jest.fn().mockReturnValue({
                existingStateParam: { existingKey: { prop1: 'value1' } }
            });

            service.setStateParams('existingStateParam', 'existingKey', { prop2: 'value2' }, 'url');

            expect((service as any).jsonToUri).toHaveBeenCalledWith({
                existingStateParam: {
                    existingKey: { prop1: 'value1' }  // Existing value remains unchanged
                }
            });
            expect(window.history.replaceState).toHaveBeenCalled();
            expect(merge).toHaveBeenCalledWith({ prop1: 'value1' }, { prop2: 'value2' });
        });

        it('should not change existing values when stateParam is not provided', () => {
            service.getStateInformation = jest.fn().mockReturnValue({
                existingKey: { prop1: 'value1' }
            });

            service.setStateParams('', 'existingKey', { prop2: 'value2' }, 'url');

            expect((service as any).jsonToUri).toHaveBeenCalledWith({
                existingKey: { prop1: 'value1' }  // Existing value remains unchanged
            });
            expect(window.history.replaceState).toHaveBeenCalled();
            expect(merge).toHaveBeenCalledWith({ prop1: 'value1' }, { prop2: 'value2' });
        });

        it('should replace the entire object when value is not an object', () => {
            service.getStateInformation = jest.fn().mockReturnValue({
                existingStateParam: { existingKey: { prop1: 'value1' } }
            });

            service.setStateParams('existingStateParam', 'existingKey', 'newValue', 'url');

            expect((service as any).jsonToUri).toHaveBeenCalledWith({
                existingStateParam: { existingKey: 'newValue' }
            });
            expect(window.history.replaceState).toHaveBeenCalled();
            // We now expect merge to be called, but it doesn't affect the final result
            expect(merge).toHaveBeenCalled();
        });

        it('should create new nested objects when they do not exist', () => {
            service.getStateInformation = jest.fn().mockReturnValue({});

            service.setStateParams('newStateParam', 'newKey', { prop: 'value' }, 'url');

            expect((service as any).jsonToUri).toHaveBeenCalledWith({
                newStateParam: { newKey: {} }  // New object is created, but prop is not set
            });
            expect(window.history.replaceState).toHaveBeenCalled();
        });

        it('should create new stateParam object when it does not exist', () => {
            service.setStateParams('newStateParam', 'newKey', 'newValue', 'url');

            expect((service as any).jsonToUri).toHaveBeenCalledWith({
                newStateParam: { newKey: 'newValue' }
            });
            expect(window.history.replaceState).toHaveBeenCalled();
        });

        it('should create new parsedObj when it does not exist', () => {
            service.getStateInformation = jest.fn().mockReturnValue(undefined);

            service.setStateParams('newStateParam', 'newKey', 'newValue', 'url');

            expect((service as any).jsonToUri).toHaveBeenCalledWith({
                newStateParam: { newKey: 'newValue' }
            });
            expect(window.history.replaceState).toHaveBeenCalled();
        });

        it('should replace value when it is an array', () => {
            service.getStateInformation = jest.fn().mockReturnValue({
                existingStateParam: { existingKey: [1, 2, 3] }
            });

            service.setStateParams('existingStateParam', 'existingKey', [4, 5, 6], 'url');

            expect((service as any).jsonToUri).toHaveBeenCalledWith({
                existingStateParam: { existingKey: [4, 5, 6] }
            });
            expect(window.history.replaceState).toHaveBeenCalled();
        });

        it('should handle case when stateParam is not provided and key does not exist', () => {
            service.setStateParams('', 'newKey', 'newValue', 'url');

            expect((service as any).jsonToUri).toHaveBeenCalledWith({
                newKey: 'newValue'
            });
            expect(window.history.replaceState).toHaveBeenCalled();
        });

        it('should handle localStorage mode with widget and no existing state', () => {
            service.getStateInformation = jest.fn().mockReturnValue(null);
            const widget = {
                getAppInstance: () => ({ activePageName: 'testPage' })
            };

            service.setStateParams('testParam', 'testKey', 'testValue', 'localStorage', widget);

            expect(localStorage.setItem).toHaveBeenCalledWith(
                'test-path_wm_state',
                JSON.stringify({
                    testPage: {
                        testParam: {
                            testKey: 'testValue'
                        }
                    }
                })
            );
        });

        it('should add wm_state to URL when it does not exist', () => {
            window.location.href = 'http://example.com/test-path';

            service.setStateParams('testParam', 'testKey', 'testValue', 'url');

            expect(window.history.replaceState).toHaveBeenCalledWith(
                { path: 'http://example.com/test-path?wm_state=encoded_state' },
                '',
                'http://example.com/test-path?wm_state=encoded_state'
            );
        });

        it('should add wm_state to URL when other parameters exist', () => {
            window.location.href = 'http://example.com/test-path?existingParam=value';

            service.setStateParams('testParam', 'testKey', 'testValue', 'url');

            expect(window.history.replaceState).toHaveBeenCalledWith(
                { path: 'http://example.com/test-path?existingParam=value&wm_state=encoded_state' },
                '',
                'http://example.com/test-path?existingParam=value&wm_state=encoded_state'
            );
        });

        it('should handle stateParam and key correctly for URL mode', () => {
            service.setStateParams('widget_state', 'Table1', { selectedItem: [{ page: '1', index: '2' }] }, 'url');

            expect((service as any).jsonToUri).toHaveBeenCalled();
            expect(window.history.replaceState).toHaveBeenCalledWith(
                { path: 'http://example.com/test-path?wm_state=encoded_state' },
                '',
                'http://example.com/test-path?wm_state=encoded_state'
            );
        });

        it('should merge objects when value is an object but not an array for URL mode', () => {
            service.getStateInformation = jest.fn().mockReturnValue({
                widget_state: { Table1: { pagination: '1' } }
            });

            service.setStateParams('widget_state', 'Table1', { selectedItem: { page: '1', index: '2' } }, 'url');

            expect(merge).toHaveBeenCalled();
            expect((service as any).jsonToUri).toHaveBeenCalled();
            expect(window.history.replaceState).toHaveBeenCalled();
        });

        it('should replace existing value when value is not an object for URL mode', () => {
            service.getStateInformation = jest.fn().mockReturnValue({
                widget_state: { Table1: { pagination: '1' } }
            });

            service.setStateParams('widget_state', 'Table1', 'new_value', 'url');

            expect((service as any).jsonToUri).toHaveBeenCalled();
            expect(window.history.replaceState).toHaveBeenCalled();
        });

        it('should use pushState when HISTORY_HANDLER is set to push for URL mode', () => {
            (service as any).HISTORY_HANDLER = 'push';
            service.setStateParams('widget_state', 'Table1', { selectedItem: [{ page: '1', index: '2' }] }, 'url');

            expect((service as any).jsonToUri).toHaveBeenCalled();
            expect(window.history.pushState).toHaveBeenCalled();
        });

        it('should not update history if new URL is the same as current URL for URL mode', () => {
            (service as any).jsonToUri = jest.fn().mockReturnValue(encodeURIComponent('current_state'));
            window.location.href = 'http://example.com/test-path?wm_state=current_state';

            service.setStateParams('widget_state', 'Table1', { selectedItem: [{ page: '1', index: '2' }] }, 'url');

            expect(window.history.replaceState).not.toHaveBeenCalled();
            expect(window.history.pushState).not.toHaveBeenCalled();
        });

        it('should handle case when parsedObj is initially undefined for URL mode', () => {
            service.getStateInformation = jest.fn().mockReturnValue(undefined);

            service.setStateParams('widget_state', 'Table1', { selectedItem: [{ page: '1', index: '2' }] }, 'url');

            expect((service as any).jsonToUri).toHaveBeenCalled();
            expect(window.history.replaceState).toHaveBeenCalled();
        });

        it('should handle case when stateParam is not provided for URL mode', () => {
            service.setStateParams('', 'testKey', 'testValue', 'url');
            expect((service as any).jsonToUri).toHaveBeenCalled();
            expect(window.history.replaceState).toHaveBeenCalled();
        });
        it('should handle widget with localstorage mode', () => {
            const widget = {
                getAppInstance: () => ({ activePageName: 'testPage' })
            };
            const stateObj = { existingState: 'value' };
            service.getStateInformation = jest.fn().mockReturnValue(stateObj);

            service.setStateParams('testParam', 'testKey', 'testValue', 'localStorage', widget);

            expect(localStorage.setItem).toHaveBeenCalledWith(
                'test-path_wm_state',
                JSON.stringify({
                    "existingState": "value",
                    "testPage": {
                        "testParam": {
                            "testKey": "testValue"
                        }
                    }
                }
                )
            );
        });

        it('should handle widget with sessionstorage mode', () => {
            const widget = {
                getAppInstance: () => ({ activePageName: 'testPage' })
            };
            const stateObj = { existingState: 'value' };
            service.getStateInformation = jest.fn().mockReturnValue(stateObj);

            service.setStateParams('testParam', 'testKey', 'testValue', 'sessionStorage', widget);

            expect(sessionStorage.setItem).toHaveBeenCalledWith(
                'test-path_wm_state',
                JSON.stringify({
                    "existingState": "value",
                    "testPage": {
                        "testParam": {
                            "testKey": "testValue"
                        }
                    }
                }
                )
            );
        });

        it('should handle URL manipulation for non-storage modes', () => {
            const initialHref = 'http://example.com/test-path';
            window.location.href = initialHref;

            service.setStateParams('testParam', 'testKey', 'testValue', 'urlParams');

            expect(window.history.replaceState).toHaveBeenCalledWith(
                { path: `${initialHref}?wm_state=encoded_state` },
                '',
                `${initialHref}?wm_state=encoded_state`
            );
        });

        it('should handle URL manipulation when wm_state already exists', () => {
            const initialHref = 'http://example.com/test-path?wm_state=oldState';
            window.location.href = initialHref;

            service.setStateParams('testParam', 'testKey', 'testValue', 'urlParams');

            expect(window.history.replaceState).toHaveBeenCalledWith(
                { path: `http://example.com/test-path?wm_state=encoded_state` },
                '',
                `http://example.com/test-path?wm_state=encoded_state`
            );
        });

        it('should not modify URL if new state is the same as current state', () => {
            const initialHref = 'http://example.com/test-path?wm_state=encoded_state';
            window.location.href = initialHref;

            service.setStateParams('testParam', 'testKey', 'testValue', 'urlParams');

            expect(window.history.replaceState).not.toHaveBeenCalled();
        });

        it('should use pushState when HISTORY_HANDLER is "push"', () => {
            service['HISTORY_HANDLER'] = 'push';
            const initialHref = 'http://example.com/test-path';
            window.location.href = initialHref;

            service.setStateParams('testParam', 'testKey', 'testValue', 'urlParams');

            expect(window.history.pushState).toHaveBeenCalledWith(
                { path: `${initialHref}?wm_state=encoded_state` },
                '',
                `${initialHref}?wm_state=encoded_state`
            );
        });
    });

    describe('removeStateParam', () => {
        beforeEach(() => {
            service.getStateInformation = jest.fn();
        });
        it('should remove state param from URL', () => {
            const stateObj = {
                widget_state: {
                    Table1: {
                        selectedItem: [{ page: '1', index: '1' }],
                        pagination: '1'
                    }
                }
            };
            (service.getStateInformation as jest.Mock).mockReturnValue(stateObj);
            (isEmpty as unknown as jest.Mock).mockReturnValue(false);

            service.removeStateParam('widget_state', 'Table1', 'selectedItem', 'url');

            expect(window.history.replaceState).toHaveBeenCalled();
            const [state, title, url] = (window.history.replaceState as jest.Mock).mock.calls[0];
            expect(state).toEqual({ path: 'http://example.com/test-path' });
            expect(title).toBe('');
            expect(url).toContain('http://example.com/test-path');
            expect(url).not.toContain('selectedItem');
        });

        it('should do nothing if state param does not exist', () => {
            (service.getStateInformation as jest.Mock).mockReturnValue({});
            (get as jest.Mock).mockReturnValue(undefined);

            service.removeStateParam('widget_state', 'Table1', 'selectedItem', 'url');

            expect(window.history.replaceState).not.toHaveBeenCalled();
        });

        it('should remove entire key if subParam is not provided', () => {
            const stateObj = {
                widget_state: {
                    Table1: {
                        selectedItem: [{ page: '1', index: '1' }],
                        pagination: '1'
                    }
                }
            };
            (service.getStateInformation as jest.Mock).mockReturnValue(stateObj);
            (isEmpty as unknown as jest.Mock).mockReturnValue(false);

            service.removeStateParam('widget_state', 'Table1', undefined, 'url');

            expect(window.history.replaceState).toHaveBeenCalled();
            const [state, title, url] = (window.history.replaceState as jest.Mock).mock.calls[0];
            expect(state).toEqual({ path: 'http://example.com/test-path' });
            expect(title).toBe('');
            expect(url).toContain('http://example.com/test-path');
            expect(url).not.toContain('Table1');
        });

        it('should handle nested keys in state param', () => {
            const stateObj = {
                widget_state: {
                    'TestLabel_11.TestLabel_1.staticVariable1Table1': {
                        selectedItem: [{ page: '1', index: '1' }],
                        pagination: '1'
                    }
                }
            };
            (service.getStateInformation as jest.Mock).mockReturnValue(stateObj);
            (isEmpty as unknown as jest.Mock).mockReturnValue(false);

            service.removeStateParam('widget_state', 'TestLabel_11.TestLabel_1.staticVariable1Table1', 'selectedItem', 'url');

            expect(window.history.replaceState).toHaveBeenCalled();
            const [state, title, url] = (window.history.replaceState as jest.Mock).mock.calls[0];
            expect(state).toEqual({ path: 'http://example.com/test-path' });
            expect(title).toBe('');
            expect(url).toContain('http://example.com/test-path');
            expect(url).not.toContain('selectedItem');
        });
    });

    describe('jsonToUri', () => {
        it('should convert a simple JSON object to URI format', () => {
            const input = { key: 'value' };
            const result = (service as any).jsonToUri(input);
            expect(result).toBe(encodeURIComponent("('key'~'value')"));
        });

        it('should handle nested objects', () => {
            const input = {
                'widget-state': {
                    Table1: {
                        pagination: '3'
                    }
                }
            };
            const result = (service as any).jsonToUri(input);
            expect(result).toBe(encodeURIComponent("('widget-state'~('Table1'~('pagination'~'3')))"));
        });

        it('should handle arrays', () => {
            const input = {
                CustomVariableSelectedItems: ['2', '3']
            };
            const result = (service as any).jsonToUri(input);
            expect(result).toBe(encodeURIComponent("('CustomVariableSelectedItems'~!'2'_'3'*)"));
        });

        it('should handle complex nested structures', () => {
            const input = {
                'widget-state': {
                    Table1: {
                        pagination: '3',
                        search: [
                            {
                                field: 'state',
                                value: 'NY',
                                matchMode: 'anywhereignorecase',
                                type: 'string'
                            }
                        ]
                    }
                },
                CustomVariableSelectedItems: ['2', '3']
            };
            const result = (service as any).jsonToUri(input);
            expect(result).toBe(encodeURIComponent("('widget-state'~('Table1'~('pagination'~'3'_'search'~!('field'~'state'_'value'~'NY'_'matchMode'~'anywhereignorecase'_'type'~'string')*))_'CustomVariableSelectedItems'~!'2'_'3'*)"));
        });

        it('should handle special characters', () => {
            const input = {
                key: "value with ()'~_!* characters"
            };
            const result = (service as any).jsonToUri(input);
            expect(result).toBe(encodeURIComponent("('key'~'value with \\u0028\\u0029\\u0027\\u007e\\u005f\\u0021\\u002a characters')"));
        });
    });

    describe('uriToJson', () => {
        it('should convert a simple URI format back to JSON object', () => {
            const input = encodeURIComponent("('key'~'value')");
            const result = (service as any).uriToJson(input);
            expect(result).toEqual({ key: 'value' });
        });

        it('should handle nested objects', () => {
            const input = encodeURIComponent("('widget-state'~('Table1'~('pagination'~'3')))");
            const result = (service as any).uriToJson(input);
            expect(result).toEqual({
                'widget-state': {
                    Table1: {
                        pagination: '3'
                    }
                }
            });
        });

        it('should handle arrays', () => {
            const input = encodeURIComponent("('CustomVariableSelectedItems'~!'2'_'3'*)");
            const result = (service as any).uriToJson(input);
            expect(result).toEqual({
                CustomVariableSelectedItems: ['2', '3']
            });
        });

        it('should handle complex nested structures', () => {
            const input = encodeURIComponent("('widget-state'~('Table1'~('pagination'~'3'_'search'~!('field'~'state'_'value'~'NY'_'matchMode'~'anywhereignorecase'_'type'~'string')*))_'CustomVariableSelectedItems'~!'2'_'3'*)");
            const result = (service as any).uriToJson(input);
            expect(result).toEqual({
                'widget-state': {
                    Table1: {
                        pagination: '3',
                        search: [
                            {
                                field: 'state',
                                value: 'NY',
                                matchMode: 'anywhereignorecase',
                                type: 'string'
                            }
                        ]
                    }
                },
                CustomVariableSelectedItems: ['2', '3']
            });
        });

        it('should handle special characters', () => {
            const input = encodeURIComponent("('key'~'value with \\u0028\\u0029\\u0027\\u007e\\u005f\\u0021\\u002a characters')");
            const result = (service as any).uriToJson(input);
            expect(result).toEqual({
                key: "value with ()'~_!* characters"
            });
        });

        it('should return undefined for invalid input', () => {
            const input = 'invalid input';
            const result = (service as any).uriToJson(input);
            expect(result).toBeUndefined();
        });
    });

    describe('removeWidgetState', () => {
        beforeEach(() => {
            service.removeStateParam = jest.fn();
            service.computeMode = jest.fn().mockReturnValue('url');
            service.getNestedPath = jest.fn().mockReturnValue('widget.path');
        });

        it('should call removeStateParam with correct parameters', () => {
            const mockWidget = {
                viewParent: {},
                getWidget: () => ({ name: 'testWidget' }),
                statehandler: 'default'
            };

            service.removeWidgetState(mockWidget, 'testKey');

            expect(service.removeStateParam).toHaveBeenCalledWith(
                (service as any).WIDGET_STATE_KEY,
                'widget.path',
                'testKey',
                'url',
                mockWidget
            );
        });

        it('should use provided mode if available', () => {
            const mockWidget = {
                viewParent: {},
                getWidget: () => ({ name: 'testWidget' }),
                statehandler: 'default'
            };

            service.removeWidgetState(mockWidget, 'testKey', 'localstorage');

            expect(service.removeStateParam).toHaveBeenCalledWith(
                (service as any).WIDGET_STATE_KEY,
                'widget.path',
                'testKey',
                'localstorage',
                mockWidget
            );
        });

        it('should not call removeStateParam if mode is not available', () => {
            service.computeMode = jest.fn().mockReturnValue(null);
            const mockWidget = {
                viewParent: {},
                getWidget: () => ({ name: 'testWidget' }),
                statehandler: 'default'
            };
            service.removeWidgetState(mockWidget);
            expect(service.removeStateParam).not.toHaveBeenCalled();
        });
    });

    describe('getStateInformation', () => {
        beforeEach(() => {
            (service as any).uriToJson = jest.fn().mockReturnValue({ parsedState: 'value' });
        });

        it('should handle URL mode correctly', () => {
            window.location.href = 'http://example.com/test-path?wm_state=encoded_state';
            const result = service.getStateInformation('url');
            expect(result).toEqual({ parsedState: 'value' });
            expect((service as any).uriToJson).toHaveBeenCalledWith('encoded_state');
        });

        it('should return undefined for URL mode when no state is present', () => {
            window.location.href = 'http://example.com/test-path';
            const result = service.getStateInformation('url');
            expect(result).toBeUndefined();
        });

        it('should handle localStorage mode correctly', () => {
            const mockState = JSON.stringify({ storedState: 'value' });
            (localStorage.getItem as jest.Mock).mockReturnValue(mockState);
            const result = service.getStateInformation('localStorage');
            expect(result).toEqual({ storedState: 'value' });
            expect(localStorage.getItem).toHaveBeenCalledWith('test-path_wm_state');
        });

        it('should handle sessionStorage mode correctly', () => {
            const mockState = JSON.stringify({ sessionState: 'value' });
            (sessionStorage.getItem as jest.Mock).mockReturnValue(mockState);
            const result = service.getStateInformation('sessionStorage');
            expect(result).toEqual({ sessionState: 'value' });
            expect(sessionStorage.getItem).toHaveBeenCalledWith('test-path_wm_state');
        });

        it('should return undefined when no state is found in localStorage', () => {
            (localStorage.getItem as jest.Mock).mockReturnValue(null);
            const result = service.getStateInformation('localStorage');
            expect(result).toBeUndefined();
        });

        it('should return undefined when no state is found in sessionStorage', () => {
            (sessionStorage.getItem as jest.Mock).mockReturnValue(null);
            const result = service.getStateInformation('sessionStorage');
            expect(result).toBeUndefined();
        });

        it('should handle JSON parsing errors', () => {
            const invalidJson = '{invalid json}';
            (localStorage.getItem as jest.Mock).mockReturnValue(invalidJson);
            expect(() => service.getStateInformation('localStorage')).toThrow(SyntaxError);
        });

        it('should return undefined if no state is found in URL mode', () => {
            window.location.href = 'http://example.com/test-path'; // no wm_state in URL
            const stateInfo = service.getStateInformation('url');
            expect(stateInfo).toBeUndefined();
        });

        it('should return undefined if no state is found in localStorage', () => {
            (window as any).localStorage.getItem.mockReturnValue(null);
            const stateInfo = service.getStateInformation('localstorage');
            expect(stateInfo).toBeUndefined();
        });

        it('should return undefined if no state is found in sessionStorage', () => {
            (window as any).sessionStorage.getItem.mockReturnValue(null);
            const stateInfo = service.getStateInformation('sessionstorage');
            expect(stateInfo).toBeUndefined();
        });
    });

    describe('removeStateParam', () => {
        beforeEach(() => {
            service.getStateInformation = jest.fn();
            (isEmpty as unknown as jest.Mock).mockReturnValue(false);
            (includes as unknown as jest.Mock).mockReturnValue(false);
            service['jsonToUri'] = jest.fn().mockReturnValue('encoded_state');
        });


        it('should remove the state param when stateParam is not provided', () => {
            const mockState = {
                customParam: 'value'
            };
            (service.getStateInformation as jest.Mock).mockReturnValue(mockState);

            service.removeStateParam('', 'customParam', undefined, 'url');

            expect(window.history.replaceState).toHaveBeenCalled();
            const [state, title, url] = (window.history.replaceState as jest.Mock).mock.calls[0];
            expect(state).toEqual({ path: expect.any(String) });
            expect(title).toBe('');
            expect(url).toContain('http://example.com/test-path');
            expect(url).not.toContain('customParam');
        });

        xit('should handle widget with activePageName for localStorage', () => {
            const mockState = {
                testPage: {
                    widget_state: {
                        Table1: {
                            selectedItem: [{ page: '1', index: '1' }],
                            pagination: '1'
                        }
                    }
                }
            };
            (service.getStateInformation as jest.Mock).mockReturnValue(mockState);

            const mockWidget = {
                getAppInstance: () => ({ activePageName: 'testPage' })
            };

            service.removeStateParam('widget_state', 'Table1', 'selectedItem', 'localStorage', mockWidget);

            expect(localStorage.setItem).toHaveBeenCalled();
            const [key, value] = (localStorage.setItem as jest.Mock).mock.calls[0];
            expect(key).toBe('test-path_wm_state');
            const parsedValue = JSON.parse(value);
            expect(parsedValue.testPage.widget_state.Table1).not.toHaveProperty('selectedItem');
            expect(parsedValue.testPage.widget_state.Table1).toHaveProperty('pagination');
        });

        it('should remove trailing & or ? from URL when state becomes empty', () => {
            const mockState = {
                widget_state: {
                    Table1: {
                        selectedItem: [{ page: '1', index: '1' }]
                    }
                }
            };
            (service.getStateInformation as jest.Mock).mockReturnValue(mockState);
            (isEmpty as unknown as jest.Mock).mockReturnValue(true);
            (includes as unknown as jest.Mock).mockReturnValue(true);

            window.location.href = 'http://example.com/test-path?wm_state=oldState&';

            service.removeStateParam('widget_state', 'Table1', 'selectedItem', 'url');

            expect(window.history.replaceState).toHaveBeenCalled();
            const [state, title, url] = (window.history.replaceState as jest.Mock).mock.calls[0];
            expect(state).toEqual({ path: expect.any(String) });
            expect(title).toBe('');
            expect(url).toBe('http://example.com/test-path?');
            expect(url).not.toContain('wm_state');
            expect(url).not.toContain('&');
        });

        it('should update URL with encoded state when parsedObj is not empty', () => {
            const mockState = {
                widget_state: {
                    Table1: {
                        pagination: '1'
                    }
                }
            };
            (service.getStateInformation as jest.Mock).mockReturnValue(mockState);
            (isEmpty as unknown as jest.Mock).mockReturnValue(false);

            window.location.href = 'http://example.com/test-path?wm_state=oldState';

            service.removeStateParam('widget_state', 'Table1', 'selectedItem', 'url');

            expect(window.history.replaceState).toHaveBeenCalled();
            const [state, title, url] = (window.history.replaceState as jest.Mock).mock.calls[0];
            expect(state).toEqual({ path: expect.any(String) });
            expect(title).toBe('');
            expect(url).toBe('http://example.com/test-path?wm_state=encoded_state');
            expect(service['jsonToUri']).toHaveBeenCalledWith(mockState);
        });

        it('should remove the specified subParam from the state', () => {
            const mockState = {
                widget_state: {
                    Table1: {
                        selectedItem: [{ page: '1', index: '1' }],
                        pagination: '1'
                    }
                }
            };
            (service.getStateInformation as jest.Mock).mockReturnValue(mockState);

            service.removeStateParam('widget_state', 'Table1', 'selectedItem', 'url');

            expect(window.history.replaceState).toHaveBeenCalled();
            const [state, title, url] = (window.history.replaceState as jest.Mock).mock.calls[0];
            expect(state).toEqual({ path: expect.any(String) });
            expect(title).toBe('');
            expect(url).toContain('http://example.com/test-path');
            expect(url).not.toContain('selectedItem');
        });

        it('should remove the entire key if subParam is not provided', () => {
            const mockState = {
                widget_state: {
                    Table1: {
                        selectedItem: [{ page: '1', index: '1' }],
                        pagination: '1'
                    }
                }
            };
            (service.getStateInformation as jest.Mock).mockReturnValue(mockState);

            service.removeStateParam('widget_state', 'Table1', undefined, 'url');

            expect(window.history.replaceState).toHaveBeenCalled();
            const [state, title, url] = (window.history.replaceState as jest.Mock).mock.calls[0];
            expect(state).toEqual({ path: expect.any(String) });
            expect(title).toBe('');
            expect(url).toContain('http://example.com/test-path');
            expect(url).not.toContain('Table1');
        });

        it('should handle nested keys in state param', () => {
            const mockState = {
                widget_state: {
                    'TestLabel_11.TestLabel_1.staticVariable1Table1': {
                        selectedItem: [{ page: '1', index: '1' }],
                        pagination: '1'
                    }
                }
            };
            (service.getStateInformation as jest.Mock).mockReturnValue(mockState);

            service.removeStateParam('widget_state', 'TestLabel_11.TestLabel_1.staticVariable1Table1', 'selectedItem', 'url');

            expect(window.history.replaceState).toHaveBeenCalled();
            const [state, title, url] = (window.history.replaceState as jest.Mock).mock.calls[0];
            expect(state).toEqual({ path: expect.any(String) });
            expect(title).toBe('');
            expect(url).toContain('http://example.com/test-path');
            expect(url).not.toContain('selectedItem');
        });

        it('should do nothing if the state param does not exist', () => {
            const mockState = {};
            (service.getStateInformation as jest.Mock).mockReturnValue(mockState);

            service.removeStateParam('widget_state', 'NonExistentTable', 'selectedItem', 'url');

            expect(window.history.replaceState).not.toHaveBeenCalled();
        });

        xit('should handle localStorage mode', () => {
            const mockState = {
                testPage: {
                    widget_state: {
                        Table1: {
                            selectedItem: [{ page: '1', index: '1' }],
                            pagination: '1'
                        }
                    }
                }
            };
            (service.getStateInformation as jest.Mock).mockReturnValue(mockState);

            const mockWidget = {
                getAppInstance: () => ({ activePageName: 'testPage' })
            };

            service.removeStateParam('widget_state', 'Table1', 'selectedItem', 'localStorage', mockWidget);

            expect(localStorage.setItem).toHaveBeenCalled();
            const [key, value] = (localStorage.setItem as jest.Mock).mock.calls[0];
            expect(key).toBe('test-path_wm_state');
            const parsedValue = JSON.parse(value);
            expect(parsedValue.testPage.widget_state.Table1).not.toHaveProperty('selectedItem');
            expect(parsedValue.testPage.widget_state.Table1).toHaveProperty('pagination');
        });

        xit('should handle sessionStorage mode', () => {
            const mockState = {
                testPage: {
                    widget_state: {
                        Table1: {
                            selectedItem: [{ page: '1', index: '1' }],
                            pagination: '1'
                        }
                    }
                }
            };
            (service.getStateInformation as jest.Mock).mockReturnValue(mockState);

            const mockWidget = {
                getAppInstance: () => ({ activePageName: 'testPage' })
            };

            service.removeStateParam('widget_state', 'Table1', 'selectedItem', 'sessionStorage', mockWidget);

            expect(sessionStorage.setItem).toHaveBeenCalled();
            const [key, value] = (sessionStorage.setItem as jest.Mock).mock.calls[0];
            expect(key).toBe('test-path_wm_state');
            const parsedValue = JSON.parse(value);
            expect(parsedValue.testPage.widget_state.Table1).not.toHaveProperty('selectedItem');
            expect(parsedValue.testPage.widget_state.Table1).toHaveProperty('pagination');
        });

        it('should remove the entire state when it becomes empty', () => {
            const mockState = {
                widget_state: {
                    Table1: {
                        selectedItem: [{ page: '1', index: '1' }]
                    }
                }
            };
            (service.getStateInformation as jest.Mock).mockReturnValue(mockState);
            (isEmpty as unknown as jest.Mock).mockReturnValue(true);

            service.removeStateParam('widget_state', 'Table1', 'selectedItem', 'url');

            expect(window.history.replaceState).toHaveBeenCalled();
            const [state, title, url] = (window.history.replaceState as jest.Mock).mock.calls[0];
            expect(state).toEqual({ path: expect.any(String) });
            expect(title).toBe('');
            expect(url).toBe('http://example.com/test-path');
            expect(url).not.toContain('wm_state');
        });
    });

    describe('computeMode', () => {
        it('should return "url" when widgetStateHandler is not provided', () => {
            expect(service.computeMode(undefined)).toBe('url');
            expect(service.computeMode(null)).toBe('url');
            expect(service.computeMode('')).toBe('url');
        });

        it('should return undefined when widgetStateHandler is "none"', () => {
            expect(service.computeMode('none')).toBeUndefined();
            expect(service.computeMode('NONE')).toBeUndefined();
            expect(service.computeMode('NoNe')).toBeUndefined();
        });

        it('should return lowercase widgetStateHandler for other values', () => {
            expect(service.computeMode('URL')).toBe('url');
            expect(service.computeMode('localStorage')).toBe('localstorage');
            expect(service.computeMode('SessionStorage')).toBe('sessionstorage');
            expect(service.computeMode('CustomMode')).toBe('custommode');
        });
    });

    describe('setWidgetState', () => {
        let mockWidget;
        let setStateParamsSpy;

        beforeEach(() => {
            mockWidget = {
                viewParent: {},
                getWidget: jest.fn().mockReturnValue({ name: 'TestWidget' }),
                statehandler: 'url'
            };
            service.getNestedPath = jest.fn().mockReturnValue('TestWidget');
            setStateParamsSpy = jest.spyOn(service, 'setStateParams').mockImplementation();
        });

        it('should call setStateParams with correct arguments when mode is provided', () => {
            service.setWidgetState(mockWidget, { key: 'value' }, 'localStorage');

            expect(setStateParamsSpy).toHaveBeenCalledWith(
                'ws',
                'TestWidget',
                { key: 'value' },
                'localStorage',
                mockWidget
            );
        });

        it('should use computeMode when mode is not provided', () => {
            service.setWidgetState(mockWidget, { key: 'value' });

            expect(setStateParamsSpy).toHaveBeenCalledWith(
                'ws',
                'TestWidget',
                { key: 'value' },
                'url',
                mockWidget
            );
        });

        it('should not call setStateParams when computed mode is undefined', () => {
            mockWidget.statehandler = 'none';
            service.setWidgetState(mockWidget, { key: 'value' });

            expect(setStateParamsSpy).not.toHaveBeenCalled();
        });

        it('should use getNestedPath to get the stateKey', () => {
            service.setWidgetState(mockWidget, { key: 'value' });

            expect(service.getNestedPath).toHaveBeenCalledWith(mockWidget.viewParent, 'TestWidget');
        });
    });
});