import { TestBed } from '@angular/core/testing';
import { StatePersistence } from './state-persistence.service';
import { get, isEmpty, merge } from 'lodash-es';

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
        service.getStateInformation = jest.fn();
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
});