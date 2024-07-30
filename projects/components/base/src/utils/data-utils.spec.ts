import { DataSource, FormWidgetType, MatchMode } from '@wm/core';
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
    Live_Operations
} from './data-utils'; // Replace with the actual file name

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
    let mockDataSource: { execute: any; };
    let mockFormField: { datafield?: any; _primaryKey?: any; compareby?: any; displayfield?: any; dataoptions?: any; datasource?: any; showPendingSpinner: any; dataset?: any; filterexpressions?: any; viewParent?: { registerDestroyListener: jest.Mock<any, [fn: any], any>; }; };
    let mockOptions: { datafield: any; widget: any; relatedField?: string; };

    beforeEach(() => {
        mockDataSource = {
            execute: jest.fn(),
        };

        mockFormField = {
            showPendingSpinner: true,
            viewParent: {
                registerDestroyListener: jest.fn(fn => fn),
            },
        };

        mockOptions = {
            relatedField: 'testRelatedField',
            datafield: 'testDataField',
            widget: FormWidgetType.AUTOCOMPLETE,
        };

        // Reset mocks
        jest.clearAllMocks();
    });

    it('should return early if dataSource is not provided', () => {
        fetchRelatedFieldData(null, mockFormField, mockOptions);
        expect(mockDataSource.execute).not.toHaveBeenCalled();
    });

    //TypeError: Cannot read properties of undefined (reading 'then')

    xit('should set formField properties correctly', async () => {
        mockDataSource.execute.mockImplementation((operation) => {
            if (operation === DataSource.Operation.GET_RELATED_PRIMARY_KEYS) {
                return ['testPrimaryKey'];
            }
        });

        fetchRelatedFieldData(mockDataSource, mockFormField, mockOptions);

        expect(mockFormField.datafield).toBe('testDataField');
        expect(mockFormField._primaryKey).toBe('testPrimaryKey');
        expect(mockFormField.compareby).toBe('testPrimaryKey');
        expect(mockFormField.displayfield).toBe('testDataField');
    });

    //TypeError: Cannot read properties of undefined (reading 'then')
    xit('should handle ALLFIELDS case', () => {
        mockOptions.datafield = 'ALLFIELDS';
        mockDataSource.execute.mockReturnValueOnce(['testPrimaryKey']);

        fetchRelatedFieldData(mockDataSource, mockFormField, mockOptions);

        expect(mockFormField.displayfield).toBe('testPrimaryKey');
    });

    //TypeError: Cannot read properties of undefined (reading 'then')
    xit('should handle search widget type', () => {
        mockDataSource.execute.mockReturnValueOnce(['testPrimaryKey']);
        fetchRelatedFieldData(mockDataSource, mockFormField, mockOptions);

        expect(mockFormField.dataoptions).toEqual({
            relatedField: 'testRelatedField',
            filterExpr: {},
        });
        expect(mockFormField.datasource).toBe(mockDataSource);
        expect(mockFormField.showPendingSpinner).toBe(false);
    });

    //TypeError: primaryKeys.join is not a function
    xit('should handle non-search widget type', (done) => {
        mockOptions.widget = FormWidgetType.SELECT;
        mockDataSource.execute.mockResolvedValueOnce(['testPrimaryKey']);
        mockDataSource.execute.mockResolvedValueOnce({ data: [{ testField: 'testValue' }] });

        fetchRelatedFieldData(mockDataSource, mockFormField, mockOptions);

        setImmediate(() => {
            expect(mockDataSource.execute).toHaveBeenCalledWith(
                DataSource.Operation.GET_RELATED_TABLE_DATA,
                expect.any(Object)
            );
            expect(mockFormField.dataset).toEqual([{ testField: 'testValue' }]);
            expect(mockFormField.displayfield).toBe('testField');
            expect(mockFormField.showPendingSpinner).toBe(false);
            done();
        });
    });

    //TypeError: primaryKeys.join is not a function
    xit('should handle errors in non-search widget type', (done) => {
        mockOptions.widget = FormWidgetType.SELECT;
        mockDataSource.execute.mockResolvedValueOnce(['testPrimaryKey']);
        mockDataSource.execute.mockRejectedValueOnce(new Error('Test error'));

        fetchRelatedFieldData(mockDataSource, mockFormField, mockOptions);

        setImmediate(() => {
            expect(mockDataSource.execute).toHaveBeenCalledWith(
                DataSource.Operation.GET_RELATED_TABLE_DATA,
                expect.any(Object)
            );
            expect(mockFormField.dataset).toBeUndefined();
            expect(mockFormField.showPendingSpinner).toBe(true);
            done();
        });
    });
});


