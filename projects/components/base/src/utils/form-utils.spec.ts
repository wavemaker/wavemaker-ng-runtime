import { forEach } from 'lodash-es';
import { ToDatePipe } from '../public_api';
import { setItemByCompare, transformDataWithKeys, filterDate, DataSetItem, convertDataToObject, extractDataAsArray, getOrderedDataset, getUniqObjsByDataField, groupData, transformFormData, handleHeaderClick, toggleAllHeaders, configureDnD } from './form-utils';
import { $parseEvent, getFormattedDate } from '@wm/core';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    getFormattedDate: jest.fn(),
    $parseEvent: jest.fn()
}));
jest.mock('./widget-utils', () => ({
    ...jest.requireActual('./widget-utils'),
    getEvaluatedData: jest.fn((obj, options) => {
        if (options.field) return obj[options.field];
        if (options.expression) return obj[options.expression];
        return undefined;
    }),
    getObjValueByKey: jest.fn((obj, key) => obj[key]),
}));
jest.mock('lodash-es', () => ({
    ...jest.requireActual('lodash-es'),
    forEach: jest.fn((collection, iteratee) => {
        if (Array.isArray(collection)) {
            collection.forEach(iteratee);
        } else if (typeof collection === 'object') {
            Object.keys(collection).forEach(key => iteratee(collection[key], key));
        }
    }),

}));

describe('setItemByCompare', () => {
    it('should set selected item based on comparison', () => {
        const datasetItems: DataSetItem[] = [
            {
                value: { id: 1, name: 'Item 1' }, selected: false,
                key: 'Item 1',
                label: 'Item 1'
            },
            {
                value: { id: 2, name: 'Item 2' }, selected: false,
                key: 'Item 2',
                label: 'Item 2'
            },
            {
                value: { id: 3, name: 'Item 3' }, selected: false,
                key: 'Item 3',
                label: 'Item 3'
            },
        ];
        const compareWithDataObj = { id: 2, name: 'Item 2' };
        const compareByField = 'id';

        setItemByCompare(datasetItems, compareWithDataObj, compareByField);

        expect(datasetItems[1].selected).toBe(true);
        expect(datasetItems[0].selected).toBe(false);
        expect(datasetItems[2].selected).toBe(false);
    });
});

describe('transformDataWithKeys', () => {
    it('should transform object to DataSetItem array', () => {
        const input = { key1: 'value1', key2: 'value2' };
        const expected = [
            { key: 'key1', label: 'key1', value: 'key1', index: 1 },
            { key: 'key2', label: 'key2', value: 'key2', index: 2 },
        ];

        const result = transformDataWithKeys(input);

        expect(result).toEqual(expected);
    });

    it('should transform array of objects to DataSetItem array', () => {
        const input = [{ key1: 'value1', key2: 'value2' }];
        const expected = [
            { key: 'key1', label: 'key1', value: 'key1', index: 1 },
            { key: 'key2', label: 'key2', value: 'key2', index: 2 },
        ];

        const result = transformDataWithKeys(input);

        expect(result).toEqual(expected);
    });

    it('should return empty array for non-object input', () => {
        const input = ['string1', 'string2'];
        const result = transformDataWithKeys(input);
        expect(result).toEqual([]);
    });
});

describe('filterDate', () => {
    let mockDatePipe: jest.Mocked<ToDatePipe>;

    beforeEach(() => {
        mockDatePipe = {
            transform: jest.fn()
        } as any;
        (getFormattedDate as jest.Mock).mockClear();
    });

    it('should return the original value for timestamp format', () => {
        const value = '2021-09-01';
        const format = 'timestamp';
        const defaultFormat = 'MM/dd/yyyy';

        const result = filterDate(value, format, defaultFormat, mockDatePipe);

        expect(result).toBe(value);
        expect(getFormattedDate).not.toHaveBeenCalled();
    });

    it('should use provided format', () => {
        const value = '2021-09-01';
        const format = 'yyyy-MM-dd';
        const defaultFormat = 'MM/dd/yyyy';
        const expectedResult = '2021-09-01';

        (getFormattedDate as jest.Mock).mockReturnValue(expectedResult);

        const result = filterDate(value, format, defaultFormat, mockDatePipe);

        expect(result).toBe(expectedResult);
        expect(getFormattedDate).toHaveBeenCalledWith(mockDatePipe, value, format);
    });

    it('should use default format when no format is provided', () => {
        const value = '2021-09-01';
        const format = '';
        const defaultFormat = 'MM/dd/yyyy';
        const expectedResult = '09/01/2021';

        (getFormattedDate as jest.Mock).mockReturnValue(expectedResult);

        const result = filterDate(value, format, defaultFormat, mockDatePipe);

        expect(result).toBe(expectedResult);
        expect(getFormattedDate).toHaveBeenCalledWith(mockDatePipe, value, defaultFormat);
    });
});

describe('getOrderedDataset', () => {
    it('should return cloned dataset when orderBy is not provided', () => {
        const dataset = [{ id: 1, name: 'John' }, { id: 2, name: 'Alice' }];
        const result = getOrderedDataset(dataset, '');
        expect(result).toEqual(dataset);
        expect(result).not.toBe(dataset); // Ensure it's a clone
    });

    it('should order dataset by single field ascending', () => {
        const dataset = [{ id: 2, name: 'Alice' }, { id: 1, name: 'John' }];
        const result = getOrderedDataset(dataset, 'id:asc');
        expect(result).toEqual([{ id: 1, name: 'John' }, { id: 2, name: 'Alice' }]);
    });

    it('should order dataset by multiple fields', () => {
        const dataset = [
            { id: 2, name: 'Alice', age: 30 },
            { id: 1, name: 'John', age: 25 },
            { id: 3, name: 'Bob', age: 25 }
        ];
        const result = getOrderedDataset(dataset, 'age:asc,name:asc');
        expect(result).toEqual([
            { id: 3, name: 'Bob', age: 25 },
            { id: 1, name: 'John', age: 25 },
            { id: 2, name: 'Alice', age: 30 }
        ]);
    });
});

describe('extractDataAsArray', () => {
    it('should return an empty array for undefined, null, or empty input', () => {
        expect(extractDataAsArray(undefined)).toEqual([]);
        expect(extractDataAsArray(null)).toEqual([]);
        expect(extractDataAsArray('')).toEqual([]);
    });

    it('should convert string to array', () => {
        expect(extractDataAsArray('a,b,c')).toEqual(['a', 'b', 'c']);
    });

    it('should trim whitespace from string input', () => {
        expect(extractDataAsArray(' a , b , c ')).toEqual(['a', 'b', 'c']);
    });

    it('should wrap non-array input in an array', () => {
        expect(extractDataAsArray(42)).toEqual([42]);
        expect(extractDataAsArray({ key: 'value' })).toEqual([{ key: 'value' }]);
    });

    it('should return the original array if input is already an array', () => {
        const input = [1, 2, 3];
        expect(extractDataAsArray(input)).toBe(input);
    });
});

describe('convertDataToObject', () => {
    it('should convert string to array', () => {
        expect(convertDataToObject('a,b,c')).toEqual(['a', 'b', 'c']);
    });

    it('should trim whitespace from string input', () => {
        expect(convertDataToObject(' a , b , c ')).toEqual(['a', 'b', 'c']);
    });

    it('should return the original input if it\'s not a string', () => {
        const input = { key: 'value' };
        expect(convertDataToObject(input)).toBe(input);
    });
});

describe('getUniqObjsByDataField', () => {
    const ALLFIELDS = 'ALLFIELDS';

    it('should return unique objects when dataField is ALLFIELDS', () => {
        const data: DataSetItem[] = [
            {
                key: 'a', label: 'A',
                value: 'A'
            },
            {
                key: 'b', label: 'B',
                value: 'B'
            },
            {
                key: 'a', label: 'A',
                value: 'A'
            }
        ];
        const result = getUniqObjsByDataField(data, ALLFIELDS, 'label');
        expect(result).toEqual([
            { key: 'a', label: 'A', value: 'A' },
            { key: 'b', label: 'B', value: 'B' }
        ]);
    });

    it('should return unique objects by key when dataField is not ALLFIELDS', () => {
        const data: DataSetItem[] = [
            {
                key: 'a', label: 'A1',
                value: 'A1'
            },
            {
                key: 'b', label: 'B',
                value: 'B'
            },
            {
                key: 'a', label: 'A2',
                value: 'A2'
            }
        ];
        const result = getUniqObjsByDataField(data, 'key', 'label');
        expect(result).toEqual([
            { key: 'a', label: 'A1', value: 'A1' },
            { key: 'b', label: 'B', value: 'B' }
        ]);
    });

    it('should filter out objects with empty dataField or displayField', () => {
        const data: DataSetItem[] = [
            {
                key: 'a', label: 'A',
                value: 'A'
            },
            {
                key: '', label: 'B',
                value: 'B'
            },
            {
                key: 'c', label: '',
                value: ''
            }
        ];
        const result = getUniqObjsByDataField(data, 'key', 'label');
        expect(result).toEqual([
            { key: 'a', label: 'A', value: 'A' }
        ]);
    });

    it('should include objects with empty fields when allowEmptyFields is true', () => {
        const data: DataSetItem[] = [
            {
                key: 'a', label: 'A',
                value: undefined
            },
            {
                key: '', label: 'B',
                value: undefined
            },
            {
                key: 'c', label: '',
                value: undefined
            }
        ];
        const result = getUniqObjsByDataField(data, 'key', 'label', true);
        expect(result).toEqual(data);
    });
});

describe('groupData', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should group data by label and add _groupIndex', () => {
        const data: DataSetItem[] = [
            { key: 1, label: 'A', value: 'Item 1' },
            { key: 2, label: 'B', value: 'Item 2' },
            { key: 3, label: 'A', value: 'Item 3' }
        ];
        const result = groupData({}, data, 'label', '', '', '', null);
        expect(result).toEqual([
            {
                key: 'A',
                data: [
                    { key: 1, label: 'A', value: 'Item 1', _groupIndex: 1 },
                    { key: 3, label: 'A', value: 'Item 3', _groupIndex: 1 }
                ]
            },
            {
                key: 'B',
                data: [
                    { key: 2, label: 'B', value: 'Item 2', _groupIndex: 2 }
                ]
            }
        ]);
    });

    it('should handle empty data array', () => {
        const data: DataSetItem[] = [];
        const result = groupData({}, data, 'label', '', '', '', null);
        expect(result).toEqual([]);
    });

    it('should group by a specific property', () => {
        const data = [
            { key: 1, label: 'A', value: 'Item 1', category: 'Cat1' },
            { key: 2, label: 'B', value: 'Item 2', category: 'Cat2' },
            { key: 3, label: 'A', value: 'Item 3', category: 'Cat1' }
        ];
        const result = groupData({}, data, 'category', '', '', '', null);
        expect(result).toEqual([
            {
                key: 'Cat1',
                data: [
                    { key: 1, label: 'A', value: 'Item 1', category: 'Cat1', _groupIndex: 1 },
                    { key: 3, label: 'A', value: 'Item 3', category: 'Cat1', _groupIndex: 1 }
                ]
            },
            {
                key: 'Cat2',
                data: [
                    { key: 2, label: 'B', value: 'Item 2', category: 'Cat2', _groupIndex: 2 }
                ]
            }
        ]);
    });

    it('should handle groupby property with parentheses', () => {
        const data = [
            { key: 1, label: 'A', value: 'Item 1', complexProperty: 'Group1' },
            { key: 2, label: 'B', value: 'Item 2', complexProperty: 'Group2' },
            { key: 3, label: 'C', value: 'Item 3', complexProperty: 'Group1' }
        ];

        const mockParsedFunction = jest.fn().mockImplementation(() => {
            let index = 0;
            return () => data[index++].complexProperty;
        })();

        ($parseEvent as jest.Mock).mockReturnValue(mockParsedFunction);

        const result = groupData({}, data, 'complex(property)', '', '', '', null);
        expect(result).toEqual([
            {
                key: 'Group1',
                data: [
                    { key: 1, label: 'A', value: 'Item 1', complexProperty: 'Group1', _groupIndex: 1 },
                    { key: 3, label: 'C', value: 'Item 3', complexProperty: 'Group1', _groupIndex: 1 }
                ]
            },
            {
                key: 'Group2',
                data: [
                    { key: 2, label: 'B', value: 'Item 2', complexProperty: 'Group2', _groupIndex: 2 }
                ]
            }
        ]);
        expect($parseEvent).toHaveBeenCalledWith('complex(property)');
    });

    it('should use parsed function for groupby with parentheses', () => {
        const mockParsedFunction = jest.fn().mockReturnValue('TestValue');
        ($parseEvent as jest.Mock).mockReturnValue(mockParsedFunction);

        const mockCompRef = {
            viewParent: {
                row: { dataObject: { complexProperty: 'TestValue' } }
            }
        };
        const data = [
            { key: 1, label: 'A', value: 'Item 1' },
            { key: 2, label: 'B', value: 'Item 2' },
        ];
        const result = groupData(mockCompRef, data, 'complex(property)', '', '', '', null);
        expect(result).toEqual([
            {
                key: 'TestValue',
                data: [
                    { key: 1, label: 'A', value: 'Item 1', _groupIndex: 1 },
                    { key: 2, label: 'B', value: 'Item 2', _groupIndex: 1 }
                ]
            }
        ]);
        expect($parseEvent).toHaveBeenCalledWith('complex(property)');
        expect(mockParsedFunction).toHaveBeenCalledTimes(2);
    });

    it('should group data when groupby does not include parentheses', () => {
        const data = [
            { key: 1, value: 'Item 1', simpleProperty: 'Group1' },
            { key: 2, value: 'Item 2', simpleProperty: 'Group2' },
            { key: 3, value: 'Item 3', simpleProperty: 'Group1' }
        ];
        const result = groupData({}, data, 'simpleProperty', '', '', '', null);

        expect(result).toEqual([
            {
                key: 'Group1',
                data: [
                    { key: 1, value: 'Item 1', simpleProperty: 'Group1', _groupIndex: 1 },
                    { key: 3, value: 'Item 3', simpleProperty: 'Group1', _groupIndex: 1 }
                ]
            },
            {
                key: 'Group2',
                data: [
                    { key: 2, value: 'Item 2', simpleProperty: 'Group2', _groupIndex: 2 }
                ]
            }
        ]);
        expect($parseEvent).not.toHaveBeenCalled();
    });
});

describe('transformFormData', () => {
    const mockContext = {};
    let mockJQuery: jest.Mock;
    const mockScope = {};

    afterEach(() => {
        mockJQuery = jest.fn().mockImplementation(() => ({
            find: jest.fn().mockReturnThis(),
            closest: jest.fn().mockReturnThis(),
            attr: jest.fn(),
            addClass: jest.fn(),
            length: 1
        }));
        (global as any).$ = mockJQuery;
        jest.clearAllMocks();
    });

    test('should handle comma-separated string input', () => {
        const result = transformFormData(mockContext, 'A,B,C');
        expect(result).toEqual([
            { key: 'A', value: 'A', label: 'A', index: 1 },
            { key: 'B', value: 'B', label: 'B', index: 2 },
            { key: 'C', value: 'C', label: 'C', index: 3 }
        ]);
    });

    test('should handle array of primitive values', () => {
        const result = transformFormData(mockContext, [1, 2, 3]);
        expect(result).toEqual([
            { key: 1, value: 1, label: '1', index: 1 },
            { key: 2, value: 2, label: '2', index: 2 },
            { key: 3, value: 3, label: '3', index: 3 }
        ]);
    });

    test('should handle object input', () => {
        const result = transformFormData(mockContext, { name: 'A', age: 20 });
        expect(result).toEqual([
            { key: 'name', value: 'name', label: 'A', index: 1, dataObject: { name: 'A', age: 20 } },
            { key: 'age', value: 'age', label: '20', index: 1, dataObject: { name: 'A', age: 20 } }
        ]);
    });

    test('should handle array of objects with specific dataField', () => {
        const input = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
        const result = transformFormData(mockContext, input, 'id', { displayField: 'name' });
        expect(result).toEqual([
            { key: 1, label: 'A', value: 1, dataObject: { id: 1, name: 'A' }, index: 1 },
            { key: 2, label: 'B', value: 2, dataObject: { id: 2, name: 'B' }, index: 2 }
        ]);
    });

    test('should handle displayImgSrc option', () => {
        const input = [{ id: 1, name: 'A', img: 'a.jpg' }, { id: 2, name: 'B', img: 'b.jpg' }];
        const result = transformFormData(mockContext, input, 'id', { displayField: 'name', displayImgSrc: 'img' });
        expect(result).toEqual([
            { key: 1, label: 'A', value: 1, dataObject: { id: 1, name: 'A', img: 'a.jpg' }, index: 1, imgSrc: 'a.jpg' },
            { key: 2, label: 'B', value: 2, dataObject: { id: 2, name: 'B', img: 'b.jpg' }, index: 2, imgSrc: 'b.jpg' }
        ]);
    });

    test('should handle null dataset', () => {
        const result = transformFormData(mockContext, null);
        expect(result).toBeUndefined();
    });

    test('should handle custom startIndex', () => {
        const result = transformFormData(mockContext, ['A', 'B'], undefined, undefined, 5);
        expect(result).toEqual([
            { key: 'A', value: 'A', label: 'A', index: 5 },
            { key: 'B', value: 'B', label: 'B', index: 6 }
        ]);
    });

    test('should handle string input', () => {
        const result = transformFormData(mockContext, 'A, B, C');
        expect(result).toEqual([
            { key: 'A', value: 'A', label: 'A', index: 1 },
            { key: 'B', value: 'B', label: 'B', index: 2 },
            { key: 'C', value: 'C', label: 'C', index: 3 }
        ]);
    });

    test('should trim whitespace from string input', () => {
        const result = transformFormData(mockContext, ' X ,Y, Z ');
        expect(result).toEqual([
            { key: 'X', value: 'X', label: 'X', index: 1 },
            { key: 'Y', value: 'Y', label: 'Y', index: 2 },
            { key: 'Z', value: 'Z', label: 'Z', index: 3 }
        ]);
    });


    test('should handle string input with proper trimming', () => {
        const result = transformFormData(mockContext, ' A , B, C ', undefined, undefined, 1, mockScope);

        expect(result).toEqual([
            { key: 'A', value: 'A', label: 'A', index: 1 },
            { key: 'B', value: 'B', label: 'B', index: 2 },
            { key: 'C', value: 'C', label: 'C', index: 3 }
        ]);

        // We can't directly test setGroupbyKey, but we can ensure the structure is correct
        result.forEach(item => {
            expect(item).toHaveProperty('key');
            expect(item).toHaveProperty('value');
            expect(item).toHaveProperty('label');
            expect(item).toHaveProperty('index');
        });
    });

    test('should handle string input with some empty values', () => {
        const result = transformFormData(mockContext, 'A,, C', undefined, undefined, 1, mockScope);

        expect(result).toEqual([
            { key: 'A', value: 'A', label: 'A', index: 1 },
            { key: '', value: '', label: '', index: 2 },
            { key: 'C', value: 'C', label: 'C', index: 3 }
        ]);
    });

    test('should use provided startIndex', () => {
        const result = transformFormData(mockContext, 'X,Y,Z', undefined, undefined, 5, mockScope);

        expect(result).toEqual([
            { key: 'X', value: 'X', label: 'X', index: 5 },
            { key: 'Y', value: 'Y', label: 'Y', index: 6 },
            { key: 'Z', value: 'Z', label: 'Z', index: 7 }
        ]);
    });

    test('should handle string with special characters', () => {
        const result = transformFormData(mockContext, 'A@B, C&D, E#F', undefined, undefined, 1, mockScope);

        expect(result).toEqual([
            { key: 'A@B', value: 'A@B', label: 'A@B', index: 1 },
            { key: 'C&D', value: 'C&D', label: 'C&D', index: 2 },
            { key: 'E#F', value: 'E#F', label: 'E#F', index: 3 }
        ]);
    });

    
});

describe('handleHeaderClick', () => {
    let mockEvent: Partial<Event>;
    let mockJQueryChain: ReturnType<typeof createMockJQueryChain>;
    let mockJQuery: jest.Mock;
    const mockToggle = jest.fn();
    const mockHasClass = jest.fn();
    const mockRemoveClass = jest.fn();
    const mockAddClass = jest.fn();

    const createMockJQueryChain = () => ({
        closest: jest.fn().mockReturnThis(),
        find: jest.fn().mockReturnThis(),
        hasClass: mockHasClass,
        removeClass: mockRemoveClass.mockReturnThis(),
        addClass: mockAddClass.mockReturnThis(),
        toggle: mockToggle,
    });

    beforeEach(() => {
        mockJQuery = jest.fn().mockImplementation(() => createMockJQueryChain());
        (global as any).$ = mockJQuery;
        mockEvent = {
            target: document.createElement('div')
        };
        mockJQueryChain = createMockJQueryChain();
        mockJQuery.mockReturnValue(mockJQueryChain);
        jest.clearAllMocks();
    });

    test('should toggle chevron down to up and show list items', () => {
        mockHasClass.mockReturnValue(true);

        handleHeaderClick(mockEvent as Event);

        expect(mockJQuery).toHaveBeenCalledWith(mockEvent.target);
        expect(mockJQueryChain.closest).toHaveBeenCalledWith('.item-group');
        expect(mockJQueryChain.find).toHaveBeenCalledWith('li.list-group-header .app-icon');
        expect(mockHasClass).toHaveBeenCalledWith('wi-chevron-down');
        expect(mockRemoveClass).toHaveBeenCalledWith('wi-chevron-down');
        expect(mockAddClass).toHaveBeenCalledWith('wi-chevron-up');
        expect(mockJQueryChain.find).toHaveBeenCalledWith('.group-list-item');
        expect(mockToggle).toHaveBeenCalled();
    });

    test('should toggle chevron up to down and hide list items', () => {
        mockHasClass.mockReturnValue(false);

        handleHeaderClick(mockEvent as Event);

        expect(mockJQuery).toHaveBeenCalledWith(mockEvent.target);
        expect(mockJQueryChain.closest).toHaveBeenCalledWith('.item-group');
        expect(mockJQueryChain.find).toHaveBeenCalledWith('li.list-group-header .app-icon');
        expect(mockHasClass).toHaveBeenCalledWith('wi-chevron-down');
        expect(mockRemoveClass).toHaveBeenCalledWith('wi-chevron-up');
        expect(mockAddClass).toHaveBeenCalledWith('wi-chevron-down');
        expect(mockJQueryChain.find).toHaveBeenCalledWith('.group-list-item');
        expect(mockToggle).toHaveBeenCalled();
    });
});

describe('toggleAllHeaders', () => {
    let mockJQuery: jest.Mock;
    let mockElement: any;


    beforeEach(() => {
        mockJQuery = jest.fn().mockImplementation(() => ({
            find: jest.fn().mockReturnThis(),
            closest: jest.fn().mockReturnThis(),
            attr: jest.fn().mockReturnThis(),
            addClass: jest.fn().mockReturnThis(),
            removeClass: jest.fn().mockReturnThis(),
            hasClass: jest.fn(),
            toggle: jest.fn().mockReturnThis(),
            length: 1
        }));
        (global as any).$ = mockJQuery;

        mockElement = {
            nativeElement: {}
        };

        (forEach as jest.Mock).mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should toggle all group list items', () => {
        const mockGroups = mockJQuery();
        const mockGroupListItems = mockJQuery();

        mockJQuery.mockReturnValueOnce(mockGroups);
        mockGroups.find.mockReturnValueOnce(mockGroupListItems);

        toggleAllHeaders(mockElement);

        expect(mockJQuery).toHaveBeenCalledWith(mockElement.nativeElement);
        expect(mockGroups.find).toHaveBeenCalledWith('.item-group');
        expect(mockGroupListItems.find).toHaveBeenCalledWith('.group-list-item');
        expect(mockGroupListItems.toggle).toHaveBeenCalled();
    });

    it('should toggle all group list items and collapse icons', () => {
        const mockGroups = mockJQuery();
        const mockGroupListItems = mockJQuery();
        const mockGroupIcons = [
            { hasClass: jest.fn().mockReturnValue(true), removeClass: jest.fn(), addClass: jest.fn() },
            { hasClass: jest.fn().mockReturnValue(false), removeClass: jest.fn(), addClass: jest.fn() }
        ];

        mockJQuery.mockReturnValue(mockGroups);
        mockGroups.find.mockImplementation((selector) => {
            if (selector === '.item-group') {
                return mockGroups;
            } else if (selector === '.group-list-item') {
                return mockGroupListItems;
            } else if (selector === 'li.list-group-header .app-icon') {
                return mockGroupIcons;
            }
            return mockJQuery();
        });

        toggleAllHeaders(mockElement);

        // Check if the group list items are toggled
        expect(mockJQuery).toHaveBeenCalledWith(mockElement.nativeElement);
        expect(mockGroups.find).toHaveBeenCalledWith('.item-group');
        expect(mockGroups.find).toHaveBeenCalledWith('.group-list-item');
        expect(mockGroupListItems.toggle).toHaveBeenCalled();

        // Check if the group icons are found and processed
        expect(mockGroups.find).toHaveBeenCalledWith('li.list-group-header .app-icon');
        expect(forEach).toHaveBeenCalledWith(mockGroupIcons, expect.any(Function));
    });
});

describe('configureDnD', () => {
    let mockJQuery: jest.Mock;
    let mockElement: any;

    beforeEach(() => {
        mockJQuery = jest.fn().mockImplementation(() => ({
            sortable: jest.fn()
        }));
        (global as any).$ = mockJQuery;

        mockElement = mockJQuery();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call sortable with default options and callbacks', () => {
        const startCb = jest.fn();
        const updateCb = jest.fn();

        configureDnD(mockElement, {}, startCb, updateCb);

        expect(mockElement.sortable).toHaveBeenCalledWith({
            containment: mockElement,
            delay: 100,
            opacity: 0.8,
            helper: 'clone',
            zIndex: 1050,
            tolerance: 'pointer',
            start: startCb,
            update: updateCb,
            sort: undefined
        });
    });

    it('should merge custom options with default options', () => {
        const startCb = jest.fn();
        const updateCb = jest.fn();
        const sortCb = jest.fn();
        const customOptions = {
            delay: 200,
            opacity: 0.5,
            customOption: 'value'
        };

        configureDnD(mockElement, customOptions, startCb, updateCb, sortCb);

        expect(mockElement.sortable).toHaveBeenCalledWith(expect.objectContaining({
            containment: mockElement,
            delay: 200,
            opacity: 0.5,
            helper: 'clone',
            zIndex: 1050,
            tolerance: 'pointer',
            start: startCb,
            update: updateCb,
            sort: sortCb,
            customOption: 'value'
        }));
    });
});