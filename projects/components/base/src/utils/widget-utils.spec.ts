import { $parseExpr, checkIsCustomPipeExpression, encodeUrl, isValidWebURL, stringStartsWith } from "@wm/core";
import {
    extractDataSourceName, getBackGroundImageUrl, getConditionalClasses, getEvaluatedData, getImageUrl, getKeyboardFocusableElements,
    getMatchModeTypesMap, getObjValueByKey, getOrderByExpr, hasLinkToCurrentPage, isActiveNavItem, isDataSetWidget,
    prepareFieldDefs, provideAs, provideAsDialogRef, provideAsWidgetRef
} from "./widget-utils";
import { DialogRef, NavNode, WidgetRef } from "../public_api";
import { forwardRef } from "@angular/core";

jest.mock('@angular/core', () => ({
    ...jest.requireActual('@angular/core'),
    forwardRef: jest.fn(fn => fn)
}));

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    isValidWebURL: jest.fn(),
    encodeUrl: jest.fn(),
    stringStartsWith: jest.fn(),
    checkIsCustomPipeExpression: jest.fn(),
    $parseExpr: jest.fn()
}));

describe('extractDataSourceName', () => {
    it('should return undefined for null or undefined input', () => {
        expect(extractDataSourceName(null)).toBeUndefined();
        expect(extractDataSourceName(undefined)).toBeUndefined();
    });

    it('should return undefined for empty string input', () => {
        expect(extractDataSourceName('')).toBeUndefined();
    });

    it('should return the correct variable name for valid input', () => {
        expect(extractDataSourceName('Variables.MyVariable')).toBe('MyVariable');
    });

    it('should return undefined for input not starting with "Variables."', () => {
        expect(extractDataSourceName('SomeOther.MyVariable')).toBeUndefined();
    });

    it('should return undefined for input with only "Variables"', () => {
        expect(extractDataSourceName('Variables')).toBeUndefined();
    });

    it('should handle input with more than two parts', () => {
        expect(extractDataSourceName('Variables.MyVariable.SubProperty')).toBe('MyVariable');
    });

    it('should be case sensitive for "Variables"', () => {
        expect(extractDataSourceName('variables.MyVariable')).toBeUndefined();
    });
});


describe('getKeyboardFocusableElements', () => {
    // Helper function to create a mock DOM structure
    function createMockDOM() {
        document.body.innerHTML = `
        <div id="container">
          <a href="#" id="link">Link</a>
          <button id="button">Button</button>
          <input id="input" type="text" />
          <textarea id="textarea"></textarea>
          <select id="select"><option>Option</option></select>
          <details id="details"><summary>Summary</summary>Details</details>
          <iframe id="iframe"></iframe>
          <embed id="embed" type="image/jpg" src="image.jpg" />
          <object id="object" data="data.pdf" type="application/pdf"></object>
          <audio id="audio" controls><source src="audio.mp3" type="audio/mpeg"></audio>
          <video id="video" controls><source src="video.mp4" type="video/mp4"></video>
          <div id="editable" contenteditable>Editable content</div>
          <button id="disabled-button" disabled>Disabled Button</button>
          <input id="hidden-input" type="text" hidden />
          <a href="#" id="negative-tabindex" tabindex="-1">Negative Tabindex</a>
          <div id="positive-tabindex" tabindex="1">Positive Tabindex</div>
        </div>
      `;
        return document.getElementById('container');
    }

    beforeEach(() => {
        createMockDOM();
    });

    // it('should return all focusable elements', () => {
    //     const container = document.getElementById('container');
    //     const focusableElements = getKeyboardFocusableElements(container);
    //     expect(focusableElements.length).toBe(12); // All elements except disabled, hidden, and negative tabindex
    //     expect(focusableElements.map(el => el.id)).toEqual([
    //         'link', 'button', 'input', 'textarea', 'select', 'details', 'iframe', 'embed', 'object', 'audio', 'video', 'editable', 'positive-tabindex'
    //     ]);
    // });

    it('should exclude disabled elements', () => {
        const container = document.getElementById('container');
        const focusableElements = getKeyboardFocusableElements(container);
        expect(focusableElements.find(el => el.id === 'disabled-button')).toBeUndefined();
    });

    it('should exclude hidden elements', () => {
        const container = document.getElementById('container');
        const focusableElements = getKeyboardFocusableElements(container);
        expect(focusableElements.find(el => el.id === 'hidden-input')).toBeUndefined();
    });

    it('should exclude elements with negative tabindex', () => {
        const container = document.getElementById('container');
        const focusableElements = getKeyboardFocusableElements(container);
        expect(focusableElements.find(el => el.id === 'negative-tabindex')).toBeUndefined();
    });

    it('should return an empty array for an empty container', () => {
        const emptyContainer = document.createElement('div');
        const focusableElements = getKeyboardFocusableElements(emptyContainer);
        expect(focusableElements).toEqual([]);
    });
});


describe('prepareFieldDefs', () => {
    it('should return an empty array when no data is provided', () => {
        const result = prepareFieldDefs(null);
        expect(result).toEqual([]);
    });

    it('should process simple object data correctly', () => {
        const data = { name: 'John', age: 30 };
        const result = prepareFieldDefs(data);
        expect(result).toEqual([
            { displayName: 'Name', field: 'name', relatedTable: undefined, relatedField: 'Name' },
            { displayName: 'Age', field: 'age', relatedTable: undefined, relatedField: 'Age' }
        ]);
    });

    it('should process array data correctly', () => {
        const data = [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }];
        const result = prepareFieldDefs(data);
        expect(result).toEqual([
            { displayName: 'Name', field: 'name', relatedTable: undefined, relatedField: 'Name' },
            { displayName: 'Age', field: 'age', relatedTable: undefined, relatedField: 'Age' }
        ]);
    });

    it('should handle the filter option', () => {
        const data = { a: 1, b: { c: 2 } };
        const result = prepareFieldDefs(data, { filter: 'all' });
        expect(result).toHaveProperty('objects');
        expect(result).toHaveProperty('terminals');
    });

    it('should handle null values in array data', () => {
        const data = [
            { name: null, age: 30 },
            { name: 'Jane', age: null },
            { name: 'Bob', age: 40 }
        ];
        const result = prepareFieldDefs(data);
        expect(result).toEqual([
            { displayName: 'Name', field: 'name', relatedTable: undefined, relatedField: 'Name' },
            { displayName: 'Age', field: 'age', relatedTable: undefined, relatedField: 'Age' }
        ]);
    });
});


describe('getMatchModeTypesMap', () => {
    it('should return an object with boolean, clob, and blob properties', () => {
        const result = getMatchModeTypesMap();

        expect(result).toHaveProperty('boolean');
        expect(result).toHaveProperty('clob');
        expect(result).toHaveProperty('blob');
    });

    it('should have correct types for boolean, clob, and blob', () => {
        const result = getMatchModeTypesMap();

        expect(Array.isArray(result.boolean)).toBe(true);
        expect(Array.isArray(result.clob)).toBe(true);
        expect(Array.isArray(result.blob)).toBe(true);
    });

    it('should have correct values for boolean', () => {
        const result = getMatchModeTypesMap();

        expect(result.boolean).toEqual(['exact', 'null', 'isnotnull']);
    });

    it('should have empty arrays for clob and blob', () => {
        const result = getMatchModeTypesMap();

        expect(result.clob).toEqual([]);
        expect(result.blob).toEqual([]);
    });

    it('should handle multiMode parameter', () => {
        const resultWithoutMultiMode = getMatchModeTypesMap();
        const resultWithMultiMode = getMatchModeTypesMap(true);
        expect(resultWithoutMultiMode).toBeDefined();
        expect(resultWithMultiMode).toBeDefined();
    });
});


describe('getObjValueByKey', () => {
    const testObj = {
        key1: 'value1',
        key2: {
            nested: 'nestedValue',
            array: [1, 2, 3]
        },
        key3: [{ id: 1 }, { id: 2 }]
    };

    it('should return the value for a simple key', () => {
        expect(getObjValueByKey(testObj, 'key1')).toBe('value1');
    });

    it('should return the value for a nested key', () => {
        expect(getObjValueByKey(testObj, 'key2.nested')).toBe('nestedValue');
    });

    it('should return the value for an array index', () => {
        expect(getObjValueByKey(testObj, 'key2.array[1]')).toBe(2);
    });

    it('should return the value for a nested array object', () => {
        expect(getObjValueByKey(testObj, 'key3[1].id')).toBe(2);
    });

    it('should return undefined for non-existent keys', () => {
        expect(getObjValueByKey(testObj, 'nonExistent')).toBeUndefined();
        expect(getObjValueByKey(testObj, 'key2.nonExistent')).toBeUndefined();
        expect(getObjValueByKey(testObj, 'key2.array[10]')).toBeUndefined();
    });

    it('should return the entire object if no key is provided', () => {
        expect(getObjValueByKey(testObj, '')).toBe(testObj);
    });

    it('should return null if the object is null', () => {
        expect(getObjValueByKey(null, 'anyKey')).toBeNull();
    });
});


describe('getEvaluatedData', () => {
    const mockDataObj = {
        name: 'John Doe',
        age: 30,
        address: {
            city: 'New York'
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return field value when only field is provided', () => {
        const options = { field: 'name' };
        expect(getEvaluatedData(mockDataObj, options)).toBe('John Doe');
    });

    it('should handle nested field values', () => {
        const options = { field: 'address.city' };
        expect(getEvaluatedData(mockDataObj, options)).toBe('New York');
    });

    it('should use expression when provided', () => {
        const options = { expression: 'someExpression' };
        const mockParsedExpr = jest.fn().mockReturnValue('Parsed Expression Result');
        ($parseExpr as jest.Mock).mockReturnValue(mockParsedExpr);

        const result = getEvaluatedData(mockDataObj, options);

        expect($parseExpr).toHaveBeenCalledWith('someExpression');
        expect(mockParsedExpr).toHaveBeenCalledWith(undefined, expect.objectContaining(mockDataObj));
        expect(result).toBe('Parsed Expression Result');
    });

    it('should handle bindExpression', () => {
        const options = { bindExpression: 'bind:$[data[$i].name] + " " + $[age]' };
        (checkIsCustomPipeExpression as jest.Mock).mockReturnValue(false);
        const mockParsedExpr = jest.fn().mockReturnValue('John Doe 30');
        ($parseExpr as jest.Mock).mockReturnValue(mockParsedExpr);

        const result = getEvaluatedData(mockDataObj, options);

        expect(checkIsCustomPipeExpression).toHaveBeenCalledWith('$[data[$i].name] + " " + $[age]');
        expect($parseExpr).toHaveBeenCalledWith('__1.name + " " + age');
        expect(mockParsedExpr).toHaveBeenCalledWith(undefined, expect.objectContaining({ ...mockDataObj, __1: mockDataObj }));
        expect(result).toBe('John Doe 30');
    });

    it('should handle custom pipe expression in bindExpression', () => {
        const options = { bindExpression: 'bind:customPipeExpression' };
        (checkIsCustomPipeExpression as jest.Mock).mockReturnValue(true);
        const mockParsedExpr = jest.fn().mockReturnValue('Custom Pipe Result');
        ($parseExpr as jest.Mock).mockReturnValue(mockParsedExpr);

        const result = getEvaluatedData(mockDataObj, options);

        expect(checkIsCustomPipeExpression).toHaveBeenCalledWith('customPipeExpression');
        expect($parseExpr).toHaveBeenCalledWith('customPipeExpression: __1');
        expect(mockParsedExpr).toHaveBeenCalledWith(undefined, expect.objectContaining({ ...mockDataObj, __1: mockDataObj }));
        expect(result).toBe('Custom Pipe Result');
    });

    it('should pass context to $parseExpr when provided', () => {
        const options = { expression: 'contextExpression' };
        const context = { someContextValue: 'test' };
        const mockParsedExpr = jest.fn().mockReturnValue('Context Result');
        ($parseExpr as jest.Mock).mockReturnValue(mockParsedExpr);

        getEvaluatedData(mockDataObj, options, context);

        expect(mockParsedExpr).toHaveBeenCalledWith(context, expect.objectContaining({ ...mockDataObj, __1: mockDataObj }));
    });

    describe('getUpdatedExpr', () => {
        it('should update data[$i] expressions', () => {
            const options = { bindExpression: 'bind:$[data[$i].name] + " is " + $[data[$i].age] + " years old"' };
            (checkIsCustomPipeExpression as jest.Mock).mockReturnValue(false);
            const mockParsedExpr = jest.fn().mockReturnValue('John Doe is 30 years old');
            ($parseExpr as jest.Mock).mockReturnValue(mockParsedExpr);

            const result = getEvaluatedData(mockDataObj, options);

            expect($parseExpr).toHaveBeenCalledWith('__1.name + " is " + __1.age + " years old"');
            expect(result).toBe('John Doe is 30 years old');
        });

        it('should handle quoted strings in expressions', () => {
            const options = { bindExpression: 'bind:$[\'@name@\'] + " is " + $["@age@"] + " years old"' };
            (checkIsCustomPipeExpression as jest.Mock).mockReturnValue(false);
            const mockParsedExpr = jest.fn().mockReturnValue('John Doe is 30 years old');
            ($parseExpr as jest.Mock).mockReturnValue(mockParsedExpr);

            const result = getEvaluatedData(mockDataObj, options);

            expect($parseExpr).toHaveBeenCalledWith('__1[\'@name@\'] + " is " + __1["@age@"] + " years old"');
            expect(result).toBe('John Doe is 30 years old');
        });
    });
});


describe('Utility Functions', () => {
    describe('isActiveNavItem', () => {
        it('should return false if link or routeName is not provided', () => {
            expect(isActiveNavItem('', 'route')).toBe(false);
            expect(isActiveNavItem('link', '')).toBe(false);
            expect(isActiveNavItem('', '')).toBe(false);
        });

        it('should return true for matching routes', () => {
            expect(isActiveNavItem('#/home', 'home')).toBe(true);
            expect(isActiveNavItem('#home', 'home')).toBe(true);
        });

        it('should ignore query parameters', () => {
            expect(isActiveNavItem('#/home?param=value', 'home')).toBe(true);
            expect(isActiveNavItem('#/home', 'home?param=value')).toBe(true);
        });

        it('should return false for non-matching routes', () => {
            expect(isActiveNavItem('#/home', 'about')).toBe(false);
            expect(isActiveNavItem('#/home/sub', 'home')).toBe(false);
        });
    });

    describe('hasLinkToCurrentPage', () => {
        const mockNodes: Array<NavNode> = [
            {
                link: '#/home',
                label: ""
            },
            {
                link: '#/about',
                children: [
                    {
                        link: '#/about/team',
                        label: ""
                    },
                    {
                        link: '#/about/history',
                        label: ""
                    }
                ],
                label: ""
            },
            {
                link: '#/contact',
                label: ""
            }
        ];

        it('should return true if any node matches the route', () => {
            expect(hasLinkToCurrentPage(mockNodes, 'home')).toBe(true);
            expect(hasLinkToCurrentPage(mockNodes, 'about')).toBe(true);
            expect(hasLinkToCurrentPage(mockNodes, 'contact')).toBe(true);
        });

        it('should return true if any child node matches the route', () => {
            expect(hasLinkToCurrentPage(mockNodes, 'about/team')).toBe(true);
            expect(hasLinkToCurrentPage(mockNodes, 'about/history')).toBe(true);
        });

        it('should return false if no node matches the route', () => {
            expect(hasLinkToCurrentPage(mockNodes, 'services')).toBe(false);
        });
    });

    describe('getOrderByExpr', () => {
        it('should return an empty string for null or empty input', () => {
            expect(getOrderByExpr(null)).toBe('');
            expect(getOrderByExpr([])).toBe('');
        });

        it('should generate correct order by expression for single field', () => {
            const input = [{ property: 'name', direction: 'ASC' }];
            expect(getOrderByExpr(input)).toBe('name asc');
        });

        it('should generate correct order by expression for multiple fields', () => {
            const input = [
                { property: 'name', direction: 'ASC' },
                { property: 'age', direction: 'DESC' }
            ];
            expect(getOrderByExpr(input)).toBe('name asc,age desc');
        });

        it('should ignore fields without direction', () => {
            const input = [
                { property: 'name', direction: 'ASC' },
                { property: 'age' }
            ];
            expect(getOrderByExpr(input)).toBe('name asc');
        });
    });

    describe('isDataSetWidget', () => {
        it('should return false for widgets not in DATASET_WIDGETS', () => {
            expect(isDataSetWidget('NonDatasetWidget')).toBe(false);
        });
    });
});

describe('getImageUrl', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return the input URL if it is a valid web URL', () => {
        const validUrl = 'https://example.com/image.jpg';
        (isValidWebURL as jest.Mock).mockReturnValue(true);
        expect(getImageUrl(validUrl)).toBe(validUrl);
        expect(isValidWebURL).toHaveBeenCalledWith(validUrl);
    });

    it('should encode the URL if shouldEncode is true', () => {
        const inputUrl = 'image with spaces.jpg';
        const encodedUrl = 'image%20with%20spaces.jpg';
        (isValidWebURL as jest.Mock).mockReturnValue(false);
        (encodeUrl as jest.Mock).mockReturnValue(encodedUrl);
        expect(getImageUrl(inputUrl, true)).toBe(encodedUrl);
        expect(encodeUrl).toHaveBeenCalledWith(inputUrl);
    });

    it('should not encode the URL if shouldEncode is false', () => {
        const inputUrl = 'image with spaces.jpg';
        (isValidWebURL as jest.Mock).mockReturnValue(false);
        expect(getImageUrl(inputUrl, false)).toBe(inputUrl);
        expect(encodeUrl).not.toHaveBeenCalled();
    });

    it('should return the URL as-is if it starts with "services/prefabs"', () => {
        const prefabUrl = 'services/prefabs/some-prefab/image.jpg';
        (isValidWebURL as jest.Mock).mockReturnValue(false);
        (stringStartsWith as jest.Mock).mockReturnValue(true);
        expect(getImageUrl(prefabUrl)).toBe(prefabUrl);
        expect(stringStartsWith).toHaveBeenCalledWith(prefabUrl, 'services/prefabs');
    });
});

describe('provideAs', () => {
    it('should return the correct provider object without multi', () => {
        const reference = class TestReference { };
        const key = 'testKey';

        const result = provideAs(reference, key);

        expect(result).toEqual({
            provide: key,
            useExisting: expect.any(Function),
            multi: undefined
        });
        expect(forwardRef).toHaveBeenCalledWith(expect.any(Function));
        expect((result.useExisting as Function)()).toBe(reference);
    });

    it('should return the correct provider object with multi', () => {
        const reference = class TestReference { };
        const key = 'testKey';
        const multi = true;

        const result = provideAs(reference, key, multi);

        expect(result).toEqual({
            provide: key,
            useExisting: expect.any(Function),
            multi: true
        });
        expect(forwardRef).toHaveBeenCalledWith(expect.any(Function));
        expect((result.useExisting as Function)()).toBe(reference);
    });
});

describe('provideAsWidgetRef', () => {
    it('should call provideAs with correct arguments', () => {
        const reference = class TestWidget { };
        const result = provideAsWidgetRef(reference);

        expect(result).toEqual({
            provide: WidgetRef,
            useExisting: expect.any(Function),
            multi: undefined
        });
        expect(forwardRef).toHaveBeenCalledWith(expect.any(Function));
        expect((result.useExisting as Function)()).toBe(reference);
    });
});

describe('provideAsDialogRef', () => {
    it('should call provideAs with correct arguments', () => {
        const reference = class TestDialog { };
        const result = provideAsDialogRef(reference);

        expect(result).toEqual({
            provide: DialogRef,
            useExisting: expect.any(Function),
            multi: undefined
        });
        expect(forwardRef).toHaveBeenCalledWith(expect.any(Function));
        expect((result.useExisting as Function)()).toBe(reference);
    });
});

describe('getBackGroundImageUrl', () => {
    it('should return empty string when input is empty string', () => {
        expect(getBackGroundImageUrl('')).toBe('');
    });

    it('should return "none" when input is "none"', () => {
        expect(getBackGroundImageUrl('none')).toBe('none');
    });
});


describe('getConditionalClasses', () => {
    it('should handle string input', () => {
        const result = getConditionalClasses('class1');
        expect(result).toEqual({ toAdd: ['class1'], toRemove: [] });
    });

    it('should handle object input with boolean values', () => {
        const input = { class1: true, class2: false, 'class3 class4': true };
        const result = getConditionalClasses(input);
        expect(result).toEqual({ toAdd: ['class1', 'class3', 'class4'], toRemove: [] });
    });

    it('should handle array input', () => {
        const input = ['class1', 'class2'];
        const result = getConditionalClasses(input);
        expect(result).toEqual({ toAdd: ['class1', 'class2'], toRemove: [] });
    });

    it('should handle complex object input', () => {
        const input = {
            toAdd: { class1: true, class2: false, 'class3 class4': true },
            toRemove: ['class5', 'class6']
        };
        const result = getConditionalClasses(input);
        expect(result).toEqual({ toAdd: ['class1', 'class3', 'class4'], toRemove: ['class5', 'class6'] });
    });

    it('should handle object input with toAdd and toRemove arrays', () => {
        const input = {
            toAdd: ['class1', 'class2'],
            toRemove: ['class3', 'class4']
        };
        const result = getConditionalClasses(input);
        expect(result).toEqual({ toAdd: ['class1', 'class2'], toRemove: ['class3', 'class4'] });
    });

    it('should handle input with old value', () => {
        const newValue = 'class1';
        const oldValue = 'class2';
        const result = getConditionalClasses(newValue, oldValue);
        expect(result).toEqual({ toAdd: ['class1'], toRemove: ['class2'] });
    });
});