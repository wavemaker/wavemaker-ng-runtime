import { DataSource, FormWidgetType, MatchMode, processFilterExpBindNode } from '@wm/core';
import * as _ from 'lodash-es';
import {
    isSearchWidgetType,
    performDataOperation,
    getDistinctFieldProperties,
    getRangeFieldValue,
    getRangeMatchMode,
    getEnableEmptyFilter,
    createArrayFrom,
    transformData,
    refreshDataSource,
    fetchRelatedFieldData,
    Live_Operations,
    interpolateBindExpressions,
    getDistinctValues,
    getDistinctValuesForField,
    getEmptyMatchMode,
    LIVE_CONSTANTS,
    fetchDistinctValues,
    applyFilterOnField
} from './data-utils'; // Replace with the actual file name
import { isDataSetWidget } from './widget-utils';
import * as dataUtils from './data-utils';

// Mock the DataSource class
jest.mock('@wm/core', () => ({
    DataSource: {
        Operation: {
            SUPPORTS_CRUD: 'SUPPORTS_CRUD',
            UPDATE_RECORD: 'UPDATE_RECORD',
            INSERT_RECORD: 'INSERT_RECORD',
            DELETE_RECORD: 'DELETE_RECORD',
            IS_API_AWARE: 'IS_API_AWARE',
            INVOKE: 'INVOKE',
            SET_INPUT: 'SET_INPUT',
            GET_ENTITY_NAME: 'GET_ENTITY_NAME',
            GET_RELATED_PRIMARY_KEYS: 'GET_RELATED_PRIMARY_KEYS',
            GET_RELATED_TABLE_DATA: 'GET_RELATED_TABLE_DATA',
        }
    },
    FormWidgetType: {
        AUTOCOMPLETE: 'autocomplete',
        TYPEAHEAD: 'typeahead',
        CHIPS: 'chips'
    },
    MatchMode: {
        BETWEEN: 'between',
        GREATER: 'greater',
        LESSER: 'lesser',
        NULLOREMPTY: 'nullorempty',
        NULL: 'null',
        EMPTY: 'empty'
    },
    isDefined: jest.fn(val => val !== undefined && val !== null),
    debounce: jest.fn(fn => fn),
    processFilterExpBindNode: jest.fn(),
}));

jest.mock('./widget-utils', () => ({
    isDataSetWidget: jest.fn(),
}));

describe('isSearchWidgetType', () => {
    it('should return true for AUTOCOMPLETE widget', () => {
        expect(isSearchWidgetType(FormWidgetType.AUTOCOMPLETE)).toBeTruthy();
    });

    it('should return true for TYPEAHEAD widget', () => {
        expect(isSearchWidgetType(FormWidgetType.TYPEAHEAD)).toBeTruthy();
    });

    it('should return true for CHIPS widget', () => {
        expect(isSearchWidgetType(FormWidgetType.CHIPS)).toBeTruthy();
    });

    it('should return false for other widget types', () => {
        expect(isSearchWidgetType('otherWidget')).toBeFalsy();
    });
});

describe('performDataOperation', () => {
    let mockDataSource: { execute: any; category: any; };

    beforeEach(() => {
        mockDataSource = {
            execute: jest.fn(),
            category: 'someOtherCategory'
        };
    });

    it('should perform update operation when supported', async () => {
        mockDataSource.execute.mockImplementation((operation, data: any) => {
            if (operation === DataSource.Operation.SUPPORTS_CRUD) {
                return true;
            }
            if (operation === DataSource.Operation.UPDATE_RECORD) {
                return Promise.resolve({ data: 'updated' });
            }
        });

        const result = await performDataOperation(mockDataSource, { id: 1 }, { operationType: Live_Operations.UPDATE });
        expect(result).toEqual({ data: 'updated' });
        expect(mockDataSource.execute).toHaveBeenCalledWith(DataSource.Operation.UPDATE_RECORD, { id: 1 });
    });

    it('should perform insert operation when supported', async () => {
        mockDataSource.execute.mockImplementation((operation, data: any) => {
            if (operation === DataSource.Operation.SUPPORTS_CRUD) {
                return true;
            }
            if (operation === DataSource.Operation.INSERT_RECORD) {
                return Promise.resolve({ data: 'inserted' });
            }
        });

        const result = await performDataOperation(mockDataSource, { name: 'test' }, { operationType: Live_Operations.INSERT });
        expect(result).toEqual({ data: 'inserted' });
        expect(mockDataSource.execute).toHaveBeenCalledWith(DataSource.Operation.INSERT_RECORD, { name: 'test' });
    });

    it('should perform delete operation when supported', async () => {
        mockDataSource.execute.mockImplementation((operation, data: any) => {
            if (operation === DataSource.Operation.SUPPORTS_CRUD) {
                return true;
            }
            if (operation === DataSource.Operation.DELETE_RECORD) {
                return Promise.resolve({ data: 'deleted' });
            }
        });

        const result = await performDataOperation(mockDataSource, { id: 1 }, { operationType: Live_Operations.DELETE });
        expect(result).toEqual({ data: 'deleted' });
        expect(mockDataSource.execute).toHaveBeenCalledWith(DataSource.Operation.DELETE_RECORD, { id: 1 });
    });

    it('should handle unsupported CRUD operations gracefully', async () => {
        mockDataSource.execute.mockImplementation((operation, data: any) => {
            if (operation === DataSource.Operation.SUPPORTS_CRUD) {
                return false;
            }
        });

        const result = await performDataOperation(mockDataSource, { id: 1 }, { operationType: Live_Operations.UPDATE });
        expect(result).toEqual({ id: 1 });
        expect(mockDataSource.execute).toHaveBeenCalledWith(DataSource.Operation.SUPPORTS_CRUD);
    });

    it('should perform API aware operation when CRUD is not supported', async () => {
        mockDataSource.execute.mockImplementation((operation, data: any) => {
            if (operation === DataSource.Operation.SUPPORTS_CRUD) {
                return false;
            }
            if (operation === DataSource.Operation.IS_API_AWARE) {
                return true;
            }
            if (operation === DataSource.Operation.SET_INPUT) {
                return Promise.resolve();
            }
            if (operation === DataSource.Operation.INVOKE) {
                return Promise.resolve({ data: 'invoked' });
            }
        });

        const result = await performDataOperation(mockDataSource, { id: 1 }, { operationType: 'update' });
        expect(result).toEqual({ data: 'invoked' });
        expect(mockDataSource.execute).toHaveBeenCalledWith(DataSource.Operation.SET_INPUT, { id: 1 });
        expect(mockDataSource.execute).toHaveBeenCalledWith(DataSource.Operation.INVOKE, {
            skipNotification: true
        });
    });

    it('should perform CRUD operation when category is wm.CrudVariable and operationType is insert', async () => {
        mockDataSource.category = 'wm.CrudVariable';
        mockDataSource.execute.mockImplementation((operation, data: any) => {
            if (operation === DataSource.Operation.SUPPORTS_CRUD) {
                return false;
            }
            if (operation === DataSource.Operation.IS_API_AWARE) {
                return true;
            }
            if (operation === DataSource.Operation.INVOKE) {
                return Promise.resolve({ data: 'created' });
            }
        });

        const result = await performDataOperation(mockDataSource, { name: 'test' }, { operationType: Live_Operations.INSERT });
        expect(result).toEqual({ data: 'created' });
        expect(mockDataSource.execute).toHaveBeenCalledWith(DataSource.Operation.INVOKE, {
            skipNotification: true,
            operation: 'create',
            inputFields: { name: 'test' }
        });
    });

    it('should perform CRUD operation when category is wm.CrudVariable and operationType is delete', async () => {
        mockDataSource.category = 'wm.CrudVariable';
        mockDataSource.execute.mockImplementation((operation, data: any) => {
            if (operation === DataSource.Operation.SUPPORTS_CRUD) {
                return false;
            }
            if (operation === DataSource.Operation.IS_API_AWARE) {
                return true;
            }
            if (operation === DataSource.Operation.INVOKE) {
                return Promise.resolve({ data: 'deleted' });
            }
        });

        const result = await performDataOperation(mockDataSource, { id: 1 }, { operationType: Live_Operations.DELETE });
        expect(result).toEqual({ data: 'deleted' });
        expect(mockDataSource.execute).toHaveBeenCalledWith(DataSource.Operation.INVOKE, {
            skipNotification: true,
            operation: 'delete',
            inputFields: { id: 1 }
        });
    });

    it('should perform API aware operation when CRUD is not supported and category is not wm.CrudVariable', async () => {
        mockDataSource.category = 'someOtherCategory';
        mockDataSource.execute.mockImplementation((operation, data: any) => {
            if (operation === DataSource.Operation.SUPPORTS_CRUD) {
                return false;
            }
            if (operation === DataSource.Operation.IS_API_AWARE) {
                return true;
            }
            if (operation === DataSource.Operation.SET_INPUT) {
                return Promise.resolve();
            }
            if (operation === DataSource.Operation.INVOKE) {
                return Promise.resolve({ data: 'invoked' });
            }
        });

        const result = await performDataOperation(mockDataSource, { id: 1 }, { operationType: Live_Operations.UPDATE });
        expect(result).toEqual({ data: 'invoked' });
        expect(mockDataSource.execute).toHaveBeenCalledWith(DataSource.Operation.SET_INPUT, { id: 1 });
        expect(mockDataSource.execute).toHaveBeenCalledWith(DataSource.Operation.INVOKE, {
            skipNotification: true
        });
    });
});
describe('getDistinctFieldProperties', () => {
    it('should return correct properties for related field', () => {
        const mockDataSource = {
            execute: jest.fn()
        };
        const formField = {
            'is-related': true,
            'lookup-type': 'Employee',
            'lookup-field': 'department.name',
            filterexpressions: { key: 'value' }
        };

        const result = getDistinctFieldProperties(mockDataSource, formField);

        expect(result).toEqual({
            tableName: 'Employee',
            distinctField: 'department.name',
            aliasColumn: 'department$name',
            filterExpr: { key: 'value' }
        });
    });

    it('should return correct properties for non-related field', () => {
        const mockDataSource = {
            execute: jest.fn().mockReturnValue('Customer')
        };
        const formField = {
            field: 'name'
        };

        const result = getDistinctFieldProperties(mockDataSource, formField);

        expect(result).toEqual({
            tableName: 'Customer',
            distinctField: 'name',
            aliasColumn: 'name'
        });
        expect(mockDataSource.execute).toHaveBeenCalledWith(DataSource.Operation.GET_ENTITY_NAME);
    });
});

describe('getRangeFieldValue', () => {
    it('should return array when both min and max values are provided', () => {
        expect(getRangeFieldValue(10, 20)).toEqual([10, 20]);
    });

    it('should return min value when only min is provided', () => {
        expect(getRangeFieldValue(10, undefined)).toBe(10);
    });

    it('should return max value when only max is provided', () => {
        expect(getRangeFieldValue(undefined, 20)).toBe(20);
    });

    it('should return undefined when neither min nor max is provided', () => {
        expect(getRangeFieldValue(undefined, undefined)).toBeUndefined();
    });

    it('should handle null values correctly', () => {
        expect(getRangeFieldValue(null, null)).toBeUndefined();
        expect(getRangeFieldValue(10, null)).toBe(10);
        expect(getRangeFieldValue(null, 20)).toBe(20);
    });

    it('should handle empty string values', () => {
        expect(getRangeFieldValue('', '')).toBeUndefined();
        expect(getRangeFieldValue(10, '')).toBe(10);
        expect(getRangeFieldValue('', 20)).toBe(20);
    });
});
describe('getRangeMatchMode', () => {
    it('should return BETWEEN when both min and max values are provided', () => {
        expect(getRangeMatchMode(10, 20)).toBe(MatchMode.BETWEEN);
    });

    it('should return GREATER when only min value is provided', () => {
        expect(getRangeMatchMode(10, null)).toBe(MatchMode.GREATER);
    });

    it('should return LESSER when only max value is provided', () => {
        expect(getRangeMatchMode(null, 20)).toBe(MatchMode.LESSER);
    });

    it('should return undefined when neither min nor max is provided', () => {
        expect(getRangeMatchMode(null, null)).toBeUndefined();
    });
});

describe('getEnableEmptyFilter', () => {
    it('should return true when null is included', () => {
        expect(getEnableEmptyFilter('null')).toBeTruthy();
    });

    it('should return true when empty is included', () => {
        expect(getEnableEmptyFilter('empty')).toBeTruthy();
    });

    it('should return true when both null and empty are included', () => {
        expect(getEnableEmptyFilter('null,empty')).toBeTruthy();
    });

    it('should return false when neither null nor empty is included', () => {
        expect(getEnableEmptyFilter('other')).toBeFalsy();
    });
});

describe('createArrayFrom', () => {
    it('should return empty array for null or undefined', () => {
        expect(createArrayFrom(null)).toEqual([]);
        expect(createArrayFrom(undefined)).toEqual([]);
    });

    it('should split string by comma', () => {
        expect(createArrayFrom('a,b,c')).toEqual(['a', 'b', 'c']);
    });

    it('should wrap non-array in array', () => {
        expect(createArrayFrom({ a: 1 })).toEqual([{ a: 1 }]);
    });

    it('should return array as is', () => {
        expect(createArrayFrom([1, 2, 3])).toEqual([1, 2, 3]);
    });
});

describe('transformData', () => {
    it('should transform string data to object array', () => {
        const result = transformData('test', 'data.value');
        expect(result).toEqual([{ value: 'test' }]);
    });

    it('should transform array of strings to object array', () => {
        const result = transformData(['test1', 'test2'], 'value');
        expect(result).toEqual([{ value: 'test1' }, { value: 'test2' }]);
    });

    it('should return array as is if it contains objects', () => {
        const data = [{ id: 1 }, { id: 2 }];
        const result = transformData(data, 'data.value');
        expect(result).toEqual(data);
    });

    it('should wrap non-array object in array', () => {
        const data = { id: 1 };
        const result = transformData(data, 'data.value');
        expect(result).toEqual([{ id: 1 }]);
    });

    it('should handle empty input', () => {
        expect(transformData(null, 'data.value')).toEqual([]);
        expect(transformData(undefined, 'data.value')).toEqual([]);
        expect(transformData([], 'data.value')).toEqual([]);
    });
    it('should handle empty field', () => {
        const data = [{ id: 1 }, { id: 2 }];
        const result = transformData(data, '');
        expect(result).toEqual(data);
    });
});

describe('refreshDataSource', () => {
    let mockDataSource: { execute: any; };

    beforeEach(() => {
        mockDataSource = {
            execute: jest.fn()
        };
    });

    it('should reject if dataSource is not provided', async () => {
        await expect(refreshDataSource(null, {})).rejects.toBeUndefined();
    });

    it('should call dataSource.execute with correct parameters', async () => {
        const options = {
            filterFields: { field: 'value' },
            orderBy: 'name',
            page: 2,
            condition: 'AND'
        };

        mockDataSource.execute.mockResolvedValue('success');

        await refreshDataSource(mockDataSource, options);

        expect(mockDataSource.execute).toHaveBeenCalledWith(
            DataSource.Operation.LIST_RECORDS,
            {
                filterFields: { field: 'value' },
                orderBy: 'name',
                page: 2,
                logicalOp: 'AND'
            }
        );
    });

    it('should use default values when options are not provided', async () => {
        mockDataSource.execute.mockResolvedValue('success');

        await refreshDataSource(mockDataSource, {});

        expect(mockDataSource.execute).toHaveBeenCalledWith(
            DataSource.Operation.LIST_RECORDS,
            {
                filterFields: {},
                orderBy: undefined,
                page: 1,
                logicalOp: ''
            }
        );
    });

    it('should resolve with the result from dataSource.execute', async () => {
        const mockResult = { data: [1, 2, 3] };
        mockDataSource.execute.mockResolvedValue(mockResult);

        const result = await refreshDataSource(mockDataSource, {});

        expect(result).toBe(mockResult);
    });

    it('should reject with the error from dataSource.execute', async () => {
        const mockError = new Error('Test error');
        mockDataSource.execute.mockRejectedValue(mockError);

        await expect(refreshDataSource(mockDataSource, {})).rejects.toThrow('Test error');
    });
});

describe('fetchRelatedFieldData', () => {
    let mockDataSource;
    let mockFormField;
    let mockOptions;

    beforeEach(() => {
        jest.useFakeTimers();
        mockDataSource = {
            execute: jest.fn(),
        };
        mockFormField = {
            showPendingSpinner: true,
            viewParent: {},
            filterexpressions: '{"filter":"test"}',
        };
        mockOptions = {
            relatedField: 'testRelatedField',
            datafield: 'testDataField',
            widget: FormWidgetType.AUTOCOMPLETE,
        };

        mockDataSource.execute.mockImplementation((operation) => {
            if (operation === DataSource.Operation.GET_RELATED_PRIMARY_KEYS) {
                return ['testPrimaryKey'];
            }
            if (operation === DataSource.Operation.GET_RELATED_TABLE_DATA) {
                return Promise.resolve({ data: [{ testField: 'testValue' }] });
            }
        });

        jest.spyOn(dataUtils, 'isSearchWidgetType').mockReturnValue(true);
        jest.spyOn(dataUtils, 'interpolateBindExpressions').mockImplementation((context, filterexpressions, callback) => callback(filterexpressions));
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('should set basic formField properties correctly', () => {
        dataUtils.fetchRelatedFieldData(mockDataSource, mockFormField, mockOptions);

        expect(mockFormField.datafield).toBe('testDataField');
        expect(mockFormField._primaryKey).toBe('testPrimaryKey');
        expect(mockFormField.compareby).toBe('testPrimaryKey');
        expect(mockFormField.displayfield).toBe('testDataField');
    });

    it('should handle ALLFIELDS case', () => {
        mockOptions.datafield = 'All Fields';
        dataUtils.fetchRelatedFieldData(mockDataSource, mockFormField, mockOptions);

        expect(mockFormField.displayfield).toBe('testPrimaryKey');
    });

    it('should handle non-search widget type', async () => {
        jest.spyOn(dataUtils, 'isSearchWidgetType').mockReturnValue(false);
        mockOptions.widget = FormWidgetType.SELECT;

        dataUtils.fetchRelatedFieldData(mockDataSource, mockFormField, mockOptions);

        jest.runAllTimers();
        await Promise.resolve();

        expect(mockDataSource.execute).toHaveBeenCalledWith(
            DataSource.Operation.GET_RELATED_TABLE_DATA,
            expect.objectContaining({
                relatedField: 'testRelatedField',
                filterExpr: '{"filter":"test"}',
                filterFields: {},
                orderBy: '',
                pagesize: undefined,
            })
        );
        expect(mockFormField.dataset).toEqual([{ testField: 'testValue' }]);
        expect(mockFormField.displayfield).toBe('testDataField');
    });

    it('should not change showPendingSpinner if it is initially false for search widget type', () => {
        mockFormField.showPendingSpinner = false;
        dataUtils.fetchRelatedFieldData(mockDataSource, mockFormField, mockOptions);

        expect(mockFormField.showPendingSpinner).toBe(false);
    });

    it('should handle errors in non-search widget type', async () => {
        jest.spyOn(dataUtils, 'isSearchWidgetType').mockReturnValue(false);
        mockOptions.widget = FormWidgetType.SELECT;
        mockDataSource.execute.mockImplementation((operation) => {
            if (operation === DataSource.Operation.GET_RELATED_PRIMARY_KEYS) {
                return ['testPrimaryKey'];
            }
            if (operation === DataSource.Operation.GET_RELATED_TABLE_DATA) {
                return Promise.reject(new Error('Test error'));
            }
        });

        dataUtils.fetchRelatedFieldData(mockDataSource, mockFormField, mockOptions);

        jest.runAllTimers();
        await Promise.resolve();

        expect(mockFormField.dataset).toBeUndefined();
        expect(mockFormField.showPendingSpinner).toBe(true);
    });

    it('should handle empty primary keys', () => {
        mockDataSource.execute.mockReturnValueOnce([]);

        dataUtils.fetchRelatedFieldData(mockDataSource, mockFormField, mockOptions);

        expect(mockFormField._primaryKey).toBeUndefined();
        expect(mockFormField.compareby).toBe('');
    });

    it('should use existing displayfield if available', () => {
        mockFormField.displayfield = 'existingDisplayField';
        dataUtils.fetchRelatedFieldData(mockDataSource, mockFormField, mockOptions);

        expect(mockFormField.displayfield).toBe('existingDisplayField');
    });

    it('should handle undefined dataSource', () => {
        const result = dataUtils.fetchRelatedFieldData(undefined, mockFormField, mockOptions);
        expect(result).toBeUndefined();
    });
});
describe('interpolateBindExpressions', () => {
    let mockContext;
    let mockFilterExpressions;
    let mockCallbackFn;
    let mockSubscription;

    beforeEach(() => {
        mockContext = {
            registerDestroyListener: jest.fn(fn => fn),
        };
        mockFilterExpressions = { key: 'value' };
        mockCallbackFn = jest.fn();
        mockSubscription = {
            unsubscribe: jest.fn(),
        };
        (processFilterExpBindNode as jest.Mock).mockReturnValue({
            subscribe: jest.fn(callback => {
                callback({ filterExpressions: { updatedKey: 'updatedValue' } });
                return mockSubscription;
            }),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call the callback function with the initial filter expressions', () => {
        interpolateBindExpressions(mockContext, mockFilterExpressions, mockCallbackFn);
        expect(mockCallbackFn).toHaveBeenCalledWith(mockFilterExpressions);
    });

    it('should call processFilterExpBindNode with the correct arguments', () => {
        interpolateBindExpressions(mockContext, mockFilterExpressions, mockCallbackFn);
        expect(processFilterExpBindNode).toHaveBeenCalledWith(mockContext, mockFilterExpressions);
    });

    it('should call the callback function with updated filter expressions', () => {
        interpolateBindExpressions(mockContext, mockFilterExpressions, mockCallbackFn);
        expect(mockCallbackFn).toHaveBeenCalledWith(JSON.stringify({ updatedKey: 'updatedValue' }));
    });

    it('should register a destroy listener', () => {
        interpolateBindExpressions(mockContext, mockFilterExpressions, mockCallbackFn);
        expect(mockContext.registerDestroyListener).toHaveBeenCalled();
    });

    it('should unsubscribe when destroy listener is called', () => {
        interpolateBindExpressions(mockContext, mockFilterExpressions, mockCallbackFn);
        const destroyFn = mockContext.registerDestroyListener.mock.calls[0][0];
        destroyFn();
        expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should handle string input for filterexpressions', () => {
        const stringFilterExpressions = JSON.stringify(mockFilterExpressions);
        interpolateBindExpressions(mockContext, stringFilterExpressions, mockCallbackFn);
        expect(processFilterExpBindNode).toHaveBeenCalledWith(mockContext, mockFilterExpressions);
    });

    it('should handle undefined filterexpressions', () => {
        interpolateBindExpressions(mockContext, undefined, mockCallbackFn);
        expect(processFilterExpBindNode).toHaveBeenCalledWith(mockContext, {});
    });

    it('should not throw an error when context.registerDestroyListener is undefined', () => {
        const contextWithoutDestroy = {};
        expect(() => {
            interpolateBindExpressions(contextWithoutDestroy, mockFilterExpressions, mockCallbackFn);
        }).not.toThrow();
    });

    it('should not call the callback function if it is not a function', () => {
        interpolateBindExpressions(mockContext, mockFilterExpressions, 'not a function' as any);
        expect(mockCallbackFn).not.toHaveBeenCalled();
    });
});

describe('getDistinctValues', () => {
    let mockDataSource;
    let mockFormField;
    let mockWidget;

    beforeEach(() => {
        mockDataSource = {
            execute: jest.fn(),
        };
        mockFormField = {
            isDataSetBound: false,
            limit: 10,
            filterexpressions: JSON.stringify({ filter: 'test' }),
            field: 'testField',
        };
        mockWidget = 'filterwidget';

        (isDataSetWidget as jest.Mock).mockReturnValue(true);
        mockDataSource.execute.mockImplementation((operation) => {
            if (operation === DataSource.Operation.GET_ENTITY_NAME) {
                return 'testTable';
            }
            return Promise.resolve({ data: 'testData' });
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return a promise', () => {
        const result = getDistinctValues(mockDataSource, mockFormField, mockWidget);
        expect(result).toBeInstanceOf(Promise);
    });

    it('should call isDataSetWidget with correct parameters', () => {
        getDistinctValues(mockDataSource, mockFormField, mockWidget);
        expect(isDataSetWidget).toHaveBeenCalledWith(mockFormField[mockWidget]);
    });

    it('should call dataSource.execute with correct parameters for non-related fields', async () => {
        await getDistinctValues(mockDataSource, mockFormField, mockWidget);

        expect(mockDataSource.execute).toHaveBeenCalledWith(
            DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS,
            {
                fields: 'testField',
                entityName: 'testTable',
                pagesize: 10,
                filterExpr: { filter: 'test' },
            }
        );
    });

    it('should handle related fields correctly', async () => {
        mockFormField['is-related'] = true;
        mockFormField['lookup-type'] = 'relatedTable';
        mockFormField['lookup-field'] = 'related.field';

        await getDistinctValues(mockDataSource, mockFormField, mockWidget);

        expect(mockDataSource.execute).toHaveBeenCalledWith(
            DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS,
            {
                fields: 'related.field',
                entityName: 'relatedTable',
                pagesize: 10,
                filterExpr: { filter: 'test' },
            }
        );
    });

    it('should resolve with correct data including aliasColumn', async () => {
        const result = await getDistinctValues(mockDataSource, mockFormField, mockWidget);

        expect(result).toEqual({
            field: mockFormField,
            data: 'testData',
            aliasColumn: 'testField',
        });
    });

    it('should resolve with correct aliasColumn for related fields', async () => {
        mockFormField['is-related'] = true;
        mockFormField['lookup-type'] = 'relatedTable';
        mockFormField['lookup-field'] = 'related.field';

        const result = await getDistinctValues(mockDataSource, mockFormField, mockWidget);

        expect(result).toEqual({
            field: mockFormField,
            data: 'testData',
            aliasColumn: 'related$field',
        });
    });

    it('should reject when dataSource.execute fails', async () => {
        const error = new Error('Test error');
        mockDataSource.execute.mockRejectedValue(error);

        await expect(getDistinctValues(mockDataSource, mockFormField, mockWidget)).rejects.toThrow('Test error');
    });

    it('should handle undefined filterexpressions', async () => {
        mockFormField.filterexpressions = undefined;

        await getDistinctValues(mockDataSource, mockFormField, mockWidget);

        expect(mockDataSource.execute).toHaveBeenCalledWith(
            DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS,
            expect.objectContaining({
                filterExpr: {},
            })
        );
    });
});


describe('getDistinctValuesForField', () => {
    let mockDataSource;
    let mockFormField;
    let mockOptions;

    beforeEach(() => {
        mockDataSource = {
            execute: jest.fn().mockReturnValue('mockEntityName')
        };
        mockFormField = {
            isDataSetBound: false,
            viewParent: {},
            filterexpressions: JSON.stringify({ filter: 'test' }),
        };
        mockOptions = {
            widget: 'mockWidget',
            enableemptyfilter: true,
            EMPTY_VALUE: 'EMPTY',
        };
        jest.clearAllMocks();
    });

    it('should return undefined if dataSource is not provided', () => {
        const result = getDistinctValuesForField(undefined, mockFormField, mockOptions);
        expect(result).toBeUndefined();
    });

    it('should return undefined if formField is not provided', () => {
        const result = getDistinctValuesForField(mockDataSource, undefined, mockOptions);
        expect(result).toBeUndefined();
    });

    it('should return undefined if formField.isDataSetBound is true', () => {
        mockFormField.isDataSetBound = true;
        const result = getDistinctValuesForField(mockDataSource, mockFormField, mockOptions);
        expect(result).toBeUndefined();
    });

    it('should handle search widget type with non-related field', () => {
        mockFormField[mockOptions.widget] = FormWidgetType.AUTOCOMPLETE;
        mockFormField.field = 'testField';

        getDistinctValuesForField(mockDataSource, mockFormField, mockOptions);

        expect(mockFormField.dataoptions).toEqual({
            tableName: 'mockEntityName',
            distinctField: 'testField',
            aliasColumn: 'testField'
        });
        expect(mockFormField.datasource).toBe(mockDataSource);
    });

    it('should handle search widget type with related field', () => {
        mockFormField[mockOptions.widget] = FormWidgetType.AUTOCOMPLETE;
        mockFormField['is-related'] = true;
        mockFormField['lookup-type'] = 'relatedTable';
        mockFormField['lookup-field'] = 'related.field';

        getDistinctValuesForField(mockDataSource, mockFormField, mockOptions);

        expect(mockFormField.dataoptions).toEqual({
            tableName: 'relatedTable',
            distinctField: 'related.field',
            aliasColumn: 'related$field',
            filterExpr: { filter: 'test' }
        });
        expect(mockFormField.datasource).toBe(mockDataSource);
    });

    it('should handle non-search widget type', async () => {
        mockFormField = {
            isDataSetBound: false,
            viewParent: {},
            filterexpressions: JSON.stringify({ filter: 'test' }),
            limit: 10,
            field: 'testField'  // Add this line
        };
        mockOptions.widget = 'non-search-widget';
        (isDataSetWidget as jest.Mock).mockReturnValue(true);

        mockDataSource.execute.mockImplementation((operation, params) => {
            if (operation === DataSource.Operation.GET_ENTITY_NAME) {
                return 'mockEntityName';
            } else if (operation === DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS) {
                return Promise.resolve({ data: ['value1', 'value2'] });
            }
        });

        await getDistinctValuesForField(mockDataSource, mockFormField, mockOptions);

        // Check that execute was called twice: once for GET_ENTITY_NAME and once for GET_DISTINCT_DATA_BY_FIELDS
        expect(mockDataSource.execute).toHaveBeenCalledTimes(4);

        // Check the call for GET_DISTINCT_DATA_BY_FIELDS
        expect(mockDataSource.execute).toHaveBeenCalledWith(
            DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS,
            expect.objectContaining({
                fields: 'testField',
                entityName: 'mockEntityName',
                pagesize: 10,
                filterExpr: { filter: 'test' }
            })
        );
    });

    it('should not execute getDistinctValues if isDataSetWidget returns false', async () => {
        (isDataSetWidget as jest.Mock).mockReturnValue(false);

        await getDistinctValuesForField(mockDataSource, mockFormField, mockOptions);

        expect(mockDataSource.execute).not.toHaveBeenCalled();
    });
});

describe('getEmptyMatchMode', () => {
    it('should return NULLOREMPTY when both NULL and EMPTY are present', () => {
        const result = getEmptyMatchMode(`${LIVE_CONSTANTS.NULL},${LIVE_CONSTANTS.EMPTY}`);
        expect(result).toBe(MatchMode.NULLOREMPTY);
    });

    it('should return NULL when only NULL is present', () => {
        const result = getEmptyMatchMode(LIVE_CONSTANTS.NULL);
        expect(result).toBe(MatchMode.NULL);
    });

    it('should return EMPTY when only EMPTY is present', () => {
        const result = getEmptyMatchMode(LIVE_CONSTANTS.EMPTY);
        expect(result).toBe(MatchMode.EMPTY);
    });

    it('should return undefined when neither NULL nor EMPTY is present', () => {
        const result = getEmptyMatchMode('SOME_OTHER_VALUE');
        expect(result).toBeUndefined();
    });
});


describe('fetchDistinctValues', () => {
    let getDistinctValuesForFieldSpy;

    beforeEach(() => {
        // Create a spy on the getDistinctValuesForField function
        getDistinctValuesForFieldSpy = jest.spyOn(dataUtils, 'getDistinctValuesForField')
    });

    afterEach(() => {
        // Clear all mocks after each test
        jest.clearAllMocks();
    });

    it('should not call getDistinctValuesForField when formFields is empty', () => {
        const dataSource = {};
        const formFields = [];
        const options = {};

        fetchDistinctValues(dataSource, formFields, options);

        expect(getDistinctValuesForFieldSpy).not.toHaveBeenCalled();
    });

    it('should handle undefined formFields', () => {
        const dataSource = {};
        const options = {};

        fetchDistinctValues(dataSource, undefined, options);

        expect(getDistinctValuesForFieldSpy).not.toHaveBeenCalled();
    });

    it('should handle null formFields', () => {
        const dataSource = {};
        const options = {};

        fetchDistinctValues(dataSource, null, options);

        expect(getDistinctValuesForFieldSpy).not.toHaveBeenCalled();
    });

});


describe('applyFilterOnField', () => {
    let mockDataSource;
    let mockFilterDef;
    let mockFormFields;
    let mockOptions;

    beforeEach(() => {
        mockDataSource = {
            execute: jest.fn().mockResolvedValue({ data: [{ testField: 'testValue' }] })
        };
        mockFilterDef = {
            field: 'testField',
            'is-range': false,
            value: 'testValue'
        };
        mockFormFields = [
            {
                field: 'relatedField',
                'filter-on': 'testField',
                'edit-widget-type': 'select',
                isDataSetBound: false
            }
        ];
        mockOptions = {
            isFirst: false,
            enableemptyfilter: '',
            widget: 'widgettype'
        };

        (isDataSetWidget as jest.Mock).mockReturnValue(true);
    });

    it('should not execute when dataSource is not provided', () => {
        applyFilterOnField(null, mockFilterDef, mockFormFields, undefined, mockOptions);
        expect(mockDataSource.execute).not.toHaveBeenCalled();
    });

    it('should execute for non-range fields', async () => {
        await applyFilterOnField(mockDataSource, mockFilterDef, mockFormFields, 'newValue', mockOptions);
        expect(mockDataSource.execute).toHaveBeenCalledWith(
            DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS,
            expect.objectContaining({
                fields: 'relatedField',
                filterFields: { testField: { value: 'newValue', matchMode: MatchMode.EQUALS } }
            })
        );
    });

    it('should handle range fields', async () => {
        mockFilterDef['is-range'] = true;
        mockFilterDef.minValue = 10;
        mockFilterDef.maxValue = 20;
        await applyFilterOnField(mockDataSource, mockFilterDef, mockFormFields, undefined, mockOptions);
        expect(mockDataSource.execute).toHaveBeenCalledWith(
            DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS,
            expect.objectContaining({
                fields: 'relatedField',
                filterFields: { testField: { value: [10, 20], matchMode: MatchMode.BETWEEN } }
            })
        );
    });

    it('should handle empty filter', async () => {
        mockOptions.enableemptyfilter = 'null,empty';
        await applyFilterOnField(mockDataSource, mockFilterDef, mockFormFields, LIVE_CONSTANTS.EMPTY_KEY, mockOptions);
        expect(mockDataSource.execute).toHaveBeenCalledWith(
            DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS,
            expect.objectContaining({
                fields: 'relatedField',
                filterFields: { testField: { value: LIVE_CONSTANTS.EMPTY_KEY, matchMode: MatchMode.NULLOREMPTY } }
            })
        );
    });

    it('should not execute for non-dataset widgets', () => {
        (isDataSetWidget as jest.Mock).mockReturnValue(false);
        applyFilterOnField(mockDataSource, mockFilterDef, mockFormFields, 'newValue', mockOptions);
        expect(mockDataSource.execute).not.toHaveBeenCalled();
    });

    it('should handle related fields', async () => {
        mockFilterDef['is-related'] = true;
        mockFilterDef['lookup-field'] = 'lookupField';
        await applyFilterOnField(mockDataSource, mockFilterDef, mockFormFields, 'newValue', mockOptions);
        expect(mockDataSource.execute).toHaveBeenCalledWith(
            DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS,
            expect.objectContaining({
                fields: 'relatedField',
                filterFields: { 'testField.lookupField': { value: 'newValue', matchMode: MatchMode.EQUALS } }
            })
        );
    });

    it('should handle search widget types', () => {
        mockFormFields[0]['edit-widget-type'] = FormWidgetType.AUTOCOMPLETE;
        mockFormFields[0].dataoptions = {};
        applyFilterOnField(mockDataSource, mockFilterDef, mockFormFields, 'newValue', mockOptions);
        expect(mockFormFields[0].dataoptions.filterFields).toEqual({
            testField: { value: 'newValue', matchMode: MatchMode.EQUALS }
        });
    });
});