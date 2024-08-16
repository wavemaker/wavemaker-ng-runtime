import { LRUCache } from './lru-cache';
import { jest } from '@jest/globals'
import { DataType, FormWidgetType } from '../enums/enums'; // Update this import path
import { checkIsCustomPipeExpression, getFormWidgetTemplate, getNgModelAttr, getRequiredFormWidget, getRowActionAttrs, updateTemplateAttrs } from './build-utils';
import { EventNotifier } from './event-notifier';
import { Subject, Subscription } from 'rxjs';
import {
    encodeUrl, encodeUrlParams, initCaps, spaceSeparate, replaceAt, periodSeparate, prettifyLabel,
    deHyphenate, prettifyLabels, isInsecureContentRequest, stringStartsWith, getEvaluatedExprValue,
    isImageFile, isAudioFile, isVideoFile, isValidWebURL, getResourceURL, triggerFn, noop, getFormattedDate, hasOffsetStr, getDateObj,
    xmlToJson, getValidJSON, validateAccessRoles, generateGUId, getClonedObject, addEventListenerOnElement,
    EVENT_LIFE,
    findValueOf, isNumberType,
    extractType,
    isEmptyObject,
    isDateTimeType,
    replace,
    getBlob,
    getNativeDateObject,
    getValidDateObject,
    isEqualWithFields,
    getRouteNameFromLink,
    getUrlParams,
    _WM_APP_PROJECT,
    setSessionStorageItem,
    getSessionStorageItem,
    convertToBlob,
    toPromise,
    openLink,
    hasCordova,
    removeExtraSlashes,
    triggerItemAction,
    getDatasourceFromExpr,
    extractCurrentItemExpr,
    isLargeTabletPortrait,
    isTablet,
    isLargeTabletLandscape,
    isMobileApp,
    getAndroidVersion,
    findParent,
    findViewParent
} from './utils';
import { $parseEvent, $parseExpr, getFnByExpr, getFnForBindExpr, getFnForEventExpr, registerFnByExpr, setPipeProvider } from './expression-parser';
import { getWmProjectProperties, setWmProjectProperties } from './wm-project-properties';

declare const moment: any;
jest.mock('rxjs');
// Define the type for window.matchMedia
type MatchMediaFn = (query: string) => MediaQueryList;

// Create a mock MediaQueryList
const createMockMediaQueryList = (matches: boolean): MediaQueryList => ({
    matches,
    media: '',
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(() => true),
});

// Create a properly typed mock for window.matchMedia
const mockMatchMedia: jest.MockedFunction<MatchMediaFn> & MatchMediaFn =
    jest.fn(() => createMockMediaQueryList(false));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
});

// Mock document.querySelector
document.querySelector = jest.fn();

describe('LRUCache', () => {
    let cache: LRUCache<string>;

    beforeEach(() => {
        cache = new LRUCache<string>(3, 60);
    });

    test('should set and get items', () => {
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');

        expect(cache.get('key1')).toBe('value1');
        expect(cache.get('key2')).toBe('value2');
    });

    test('should return null for non-existent keys', () => {
        expect(cache.get('nonexistent')).toBeNull();
    });

    test('should evict least recently used item when cache is full', () => {
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
        cache.set('key3', 'value3');
        cache.set('key4', 'value4');

        expect(cache.get('key1')).toBeNull();
        expect(cache.get('key2')).toBe('value2');
        expect(cache.get('key3')).toBe('value3');
        expect(cache.get('key4')).toBe('value4');
    });

    test('should update access time when getting an item', () => {
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
        cache.set('key3', 'value3');

        cache.get('key1'); // Update access time for key1
        cache.set('key4', 'value4');

        expect(cache.get('key1')).toBe('value1');
        expect(cache.get('key2')).toBeNull(); // key2 should be evicted
    });

    test('should delete an item', () => {
        cache.set('key1', 'value1');
        cache.delete('key1');

        expect(cache.get('key1')).toBeNull();
    });

    test('should check if an item exists', () => {
        cache.set('key1', 'value1');

        expect(cache.has('key1')).toBe(true);
        expect(cache.has('nonexistent')).toBe(false);
    });

    test('should return correct size', () => {
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');

        expect(cache.size()).toBe(2);
    });

    test('should clear all items', () => {
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
        cache.clear();

        expect(cache.size()).toBe(0);
        expect(cache.get('key1')).toBeNull();
        expect(cache.get('key2')).toBeNull();
    });

    test('should call onEvict callback when item is evicted', () => {
        const onEvictMock = jest.fn();
        const cacheWithCallback = new LRUCache<string>(2, 60, onEvictMock);

        cacheWithCallback.set('key1', 'value1');
        cacheWithCallback.set('key2', 'value2');
        cacheWithCallback.set('key3', 'value3');

        expect(onEvictMock).toHaveBeenCalledWith('key1', 'value1');
    });

    test('should not set nil values', () => {
        cache.set('key1', null);
        expect(cache.get('key1')).toBeNull();
        expect(cache.size()).toBe(0);
    });

    test('should warn when maxAge is less than 30 seconds', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
        new LRUCache<string>(100, 15);
        expect(consoleSpy).toHaveBeenCalledWith('Cache age 15s is very less. Keep it atleast 30s.');
        consoleSpy.mockRestore();
    });
    test('should evict expired items based on maxAge', () => {
        jest.useFakeTimers();
        const cache = new LRUCache<string>(3, 1); // 1 second maxAge

        cache.set('key1', 'value1');
        cache.set('key2', 'value2');

        jest.advanceTimersByTime(1100); // Advance time by 1.1 seconds

        cache.set('key3', 'value3'); // This should trigger the eviction check

        // Advance timers by a small amount to allow the eviction to occur
        jest.advanceTimersByTime(10);

        expect(cache.get('key1')).toBeNull();
        expect(cache.get('key2')).toBeNull();
        expect(cache.get('key3')).toBe('value3');

        jest.useRealTimers();
    });

    test('should return correct keys', () => {
        const cache = new LRUCache<string>(3);
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
        cache.set('key3', 'value3');

        const keys = Array.from(cache.keys());
        expect(keys).toEqual(expect.arrayContaining(['key1', 'key2', 'key3']));
        expect(keys.length).toBe(3);
    });

    test('should update keys when items are evicted', () => {
        const cache = new LRUCache<string>(2);
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
        cache.set('key3', 'value3'); // This should evict 'key1'

        const keys = Array.from(cache.keys());
        expect(keys).toEqual(expect.arrayContaining(['key2', 'key3']));
        expect(keys.length).toBe(2);
        expect(keys).not.toContain('key1');
    });

    test('should handle time-based eviction with setInterval', () => {
        jest.useFakeTimers();
        const evictSpy = jest.spyOn(LRUCache.prototype as any, 'evict');
        const cache = new LRUCache<string>(3, 1); // 1 second maxAge

        cache.set('key1', 'value1');
        cache.set('key2', 'value2');

        jest.advanceTimersByTime(1100); // Advance time by 1.1 seconds

        // Advance timers by a small amount to allow the eviction to occur
        jest.advanceTimersByTime(10);

        expect(evictSpy).toHaveBeenCalled();

        evictSpy.mockRestore();
        jest.useRealTimers();
    });
});

describe('getFormWidgetTemplate', () => {
    const createAttrs = (attrs: Record<string, string>) => new Map(Object.entries(attrs));

    it('should generate autocomplete template', () => {
        const attrs = createAttrs({ debouncetime: '300', showineditmode: 'true' });
        const result = getFormWidgetTemplate(FormWidgetType.AUTOCOMPLETE, 'innerTmpl', attrs);
        expect(result).toBe('<div wmSearch type="autocomplete" debouncetime="300" innerTmpl show.bind="true"></div>');
    });

    it('should generate checkbox template', () => {
        const attrs = createAttrs({ required: 'true', showineditmode: 'false' });
        const result = getFormWidgetTemplate(FormWidgetType.CHECKBOX, 'innerTmpl', attrs);
        expect(result).toBe('<div wmCheckbox innerTmpl required=true show="false"></div>');
    });

    it('should generate checkboxset template', () => {
        const attrs = createAttrs({ required: 'true' });
        const result = getFormWidgetTemplate(FormWidgetType.CHECKBOXSET, 'innerTmpl', attrs);
        expect(result).toBe('<ul role="group" wmCheckboxset innerTmpl required=true show.bind="true"></ul>');
    });

    it('should generate chips template', () => {
        const attrs = createAttrs({ debouncetime: '500' });
        const result = getFormWidgetTemplate(FormWidgetType.CHIPS, 'innerTmpl', attrs);
        expect(result).toBe('<ul wmChips role="input" debouncetime="500" innerTmpl show.bind="true"></ul>');
    });

    it('should generate colorpicker template', () => {
        const attrs = createAttrs({ required: 'true' });
        const result = getFormWidgetTemplate(FormWidgetType.COLORPICKER, 'innerTmpl', attrs);
        expect(result).toBe('<div wmColorPicker required=true innerTmpl show.bind="true"></div>');
    });

    it('should generate currency template', () => {
        const attrs = createAttrs({ required: 'true', updateon: 'blur' });
        const result = getFormWidgetTemplate(FormWidgetType.CURRENCY, 'innerTmpl', attrs);
        expect(result).toBe('<div wmCurrency required=true updateon="blur" innerTmpl show.bind="true"></div>');
    });

    it('should generate date template', () => {
        const attrs = createAttrs({ required: 'true', dataentrymode: 'default' });
        const result = getFormWidgetTemplate(FormWidgetType.DATE, 'innerTmpl', attrs);
        expect(result).toBe('<div wmDate required=true dataentrymode="default" innerTmpl show.bind="true"></div>');
    });

    it('should generate datetime template', () => {
        const attrs = createAttrs({ required: 'true', dataentrymode: 'picker' });
        const result = getFormWidgetTemplate(FormWidgetType.DATETIME, 'innerTmpl', attrs);
        expect(result).toBe('<div wmDateTime required=true dataentrymode="picker" innerTmpl show.bind="true"></div>');
    });

    it('should generate number template', () => {
        const attrs = createAttrs({ required: 'true', updateon: 'change' });
        const result = getFormWidgetTemplate(FormWidgetType.NUMBER, 'innerTmpl', attrs);
        expect(result).toBe('<div wmNumber innerTmpl required=true type="number" aria-label="Only numbers" updateon="change" show.bind="true"></div>');
    });

    it('should generate password template', () => {
        const attrs = createAttrs({ required: 'true' });
        const result = getFormWidgetTemplate(FormWidgetType.PASSWORD, 'innerTmpl', attrs);
        expect(result).toBe('<wm-input innerTmpl required=true type="password" aria-label="Enter password"  show.bind="true"></wm-input>');
    });

    it('should generate radioset template', () => {
        const attrs = createAttrs({});
        const result = getFormWidgetTemplate(FormWidgetType.RADIOSET, 'innerTmpl', attrs);
        expect(result).toBe('<ul role="radiogroup" wmRadioset innerTmpl show.bind="true"></ul>');
    });

    it('should generate rating template', () => {
        const attrs = createAttrs({});
        const result = getFormWidgetTemplate(FormWidgetType.RATING, 'innerTmpl', attrs);
        expect(result).toBe('<div wmRating innerTmpl show.bind="true"></div>');
    });

    it('should generate richtext template', () => {
        const attrs = createAttrs({});
        const result = getFormWidgetTemplate(FormWidgetType.RICHTEXT, 'innerTmpl', attrs);
        expect(result).toBe('<div wmRichTextEditor role="textbox" innerTmpl show.bind="true"></div>');
    });

    it('should generate select template', () => {
        const attrs = createAttrs({ required: 'true' });
        const result = getFormWidgetTemplate(FormWidgetType.SELECT, 'innerTmpl', attrs);
        expect(result).toBe('<wm-select required=true innerTmpl show.bind="true"></wm-select>');
    });

    it('should generate toggle template', () => {
        const attrs = createAttrs({ required: 'true' });
        const result = getFormWidgetTemplate(FormWidgetType.TOGGLE, 'innerTmpl', attrs);
        expect(result).toBe('<div wmCheckbox innerTmpl required=true type="toggle" role="checkbox" aria-label="Toggle button" show.bind="true"></div>');
    });

    it('should generate slider template', () => {
        const attrs = createAttrs({});
        const result = getFormWidgetTemplate(FormWidgetType.SLIDER, 'innerTmpl', attrs);
        expect(result).toBe('<div wmSlider innerTmpl show.bind="true"></div>');
    });

    it('should generate switch template', () => {
        const attrs = createAttrs({});
        const result = getFormWidgetTemplate(FormWidgetType.SWITCH, 'innerTmpl', attrs);
        expect(result).toBe('<div wmSwitch innerTmpl show.bind="true"></div>');
    });

    it('should generate text template', () => {
        const attrs = createAttrs({ required: 'true', updateon: 'blur', inputtype: 'email' });
        const result = getFormWidgetTemplate(FormWidgetType.TEXT, 'innerTmpl', attrs, { inputType: 'inputtype' });
        expect(result).toBe('<wm-input innerTmpl  required=true type="email" updateon="blur" show.bind="true"></wm-input>');
    });

    it('should generate textarea template', () => {
        const attrs = createAttrs({ required: 'true', updateon: 'change' });
        const result = getFormWidgetTemplate(FormWidgetType.TEXTAREA, 'innerTmpl', attrs);
        expect(result).toBe('<wm-textarea innerTmpl required=true role="textbox" updateon="change" show.bind="true"></wm-textarea>');
    });

    it('should generate time template', () => {
        const attrs = createAttrs({ required: 'true', dataentrymode: 'default' });
        const result = getFormWidgetTemplate(FormWidgetType.TIME, 'innerTmpl', attrs);
        expect(result).toBe('<div wmTime required=true dataentrymode="default" innerTmpl show.bind="true"></div>');
    });

    it('should generate timestamp template', () => {
        const attrs = createAttrs({ required: 'true', dataentrymode: 'picker' });
        const result = getFormWidgetTemplate(FormWidgetType.TIMESTAMP, 'innerTmpl', attrs);
        expect(result).toBe('<div wmDateTime required=true dataentrymode="picker" innerTmpl role="input" show.bind="true"></div>');
    });

    it('should generate upload template with uploadProps', () => {
        const attrs = createAttrs({ 'change.event': 'onFileSelect' });
        const options = {
            counter: 'counter',
            pCounter: 'pCounter',
            uploadProps: { name: 'fileUpload', formName: 'uploadForm' }
        };
        const result = getFormWidgetTemplate(FormWidgetType.UPLOAD, 'innerTmpl', attrs, options);
        expect(result).toBe('<form name="uploadForm" innerTmpl>\n                            <input focus-target class="file-upload" type="file" name="fileUpload"   (change)="counter.triggerUploadEvent($event, \'change\', \'fileUpload\', row)"  show.bind="true"/>\n                        </form>');
    });

    it('should generate upload template without uploadProps', () => {
        const attrs = createAttrs({ key: 'fileUpload', 'change.event': 'onFileSelect' });
        const options = { counter: 'counter', pCounter: 'pCounter' };
        const result = getFormWidgetTemplate(FormWidgetType.UPLOAD, 'innerTmpl', attrs, options);
        expect(result).toContain('<input innerTmpl class="app-blob-upload" [ngClass]="');
    });

    it('should generate default template for unknown widget type', () => {
        const attrs = createAttrs({ required: 'true', updateon: 'blur' });
        const result = getFormWidgetTemplate('UNKNOWN_TYPE', 'innerTmpl', attrs);
        expect(result).toBe('<wm-input innerTmpl required=true type="text" updateon="blur" show.bind="true"></wm-input>');
    });
});


describe('getRequiredFormWidget', () => {
    it('should return "wm-search" for AUTOCOMPLETE', () => {
        expect(getRequiredFormWidget(FormWidgetType.AUTOCOMPLETE)).toBe('wm-search');
    });

    it('should return "wm-search" for TYPEAHEAD', () => {
        expect(getRequiredFormWidget(FormWidgetType.TYPEAHEAD)).toBe('wm-search');
    });

    it('should return "wm-chips" for CHIPS', () => {
        expect(getRequiredFormWidget(FormWidgetType.CHIPS)).toBe('wm-chips');
    });

    it('should return "wm-colorpicker" for COLORPICKER', () => {
        expect(getRequiredFormWidget(FormWidgetType.COLORPICKER)).toBe('wm-colorpicker');
    });

    it('should return "wm-currency" for CURRENCY', () => {
        expect(getRequiredFormWidget(FormWidgetType.CURRENCY)).toBe('wm-currency');
    });

    it('should return "wm-date" for DATE', () => {
        expect(getRequiredFormWidget(FormWidgetType.DATE)).toBe('wm-date');
    });

    it('should return "wm-datetime" for DATETIME', () => {
        expect(getRequiredFormWidget(FormWidgetType.DATETIME)).toBe('wm-datetime');
    });

    it('should return "wm-time" for TIME', () => {
        expect(getRequiredFormWidget(FormWidgetType.TIME)).toBe('wm-time');
    });

    it('should return "wm-time" for TIMESTAMP', () => {
        expect(getRequiredFormWidget(FormWidgetType.TIMESTAMP)).toBe('wm-time');
    });

    it('should return "wm-rating" for RATING', () => {
        expect(getRequiredFormWidget(FormWidgetType.RATING)).toBe('wm-rating');
    });

    it('should return "wm-richtexteditor" for RICHTEXT', () => {
        expect(getRequiredFormWidget(FormWidgetType.RICHTEXT)).toBe('wm-richtexteditor');
    });

    it('should return "wm-slider" for SLIDER', () => {
        expect(getRequiredFormWidget(FormWidgetType.SLIDER)).toBe('wm-slider');
    });

    it('should return "wm-text" for unspecified widget types', () => {
        expect(getRequiredFormWidget(FormWidgetType.CHECKBOX)).toBe('wm-text');
        expect(getRequiredFormWidget(FormWidgetType.SELECT)).toBe('wm-text');
        expect(getRequiredFormWidget('UNKNOWN_TYPE' as FormWidgetType)).toBe('wm-text');
    });
});

describe('checkIsCustomPipeExpression', () => {
    it('should return true for custom pipe expressions', () => {
        expect(checkIsCustomPipeExpression('someProperty | custom: param')).toBeTruthy();
    });

    it('should return false for non-custom pipe expressions', () => {
        expect(checkIsCustomPipeExpression('someProperty | regularPipe')).toBeFalsy();
    });
});

// Define interfaces to match the structure expected by updateTemplateAttrs
interface MockAttribute {
    name: string;
    value: string;
    sourceSpan?: any;
    keySpan?: any;
    valueSpan?: any;
    i18n?: any;
}

interface MockElement {
    name: string;
    attrs: MockAttribute[];
    children: MockElement[];
    sourceSpan?: any;
    startSourceSpan?: any;
    endSourceSpan?: any;
    nameSpan?: any;
}

// Create a mock Element factory function
function createMockElement(name: string, attrs: MockAttribute[] = [], children: MockElement[] = []): MockElement {
    return {
        name,
        attrs,
        children,
        sourceSpan: null,
        startSourceSpan: null,
        endSourceSpan: null,
        nameSpan: null,
    };
}

// Create a mock Attribute factory function
function createMockAttribute(name: string, value: string): MockAttribute {
    return {
        name,
        value,
        sourceSpan: null,
        keySpan: null,
        valueSpan: null,
        i18n: undefined,
    };
}

describe('updateTemplateAttrs', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should update bind expressions in attributes', () => {
        const rootNode = createMockElement('div', [
            createMockAttribute('bind', 'bind:parentDataSet.someProperty')
        ]);

        updateTemplateAttrs([rootNode] as any, 'parentDataSet', 'testWidget');

        expect(rootNode.attrs[0].value).toBe('bind:item.someProperty');
    });

    it('should handle nested elements', () => {
        const childNode = createMockElement('span', [
            createMockAttribute('bind', 'bind:parentDataSet.nestedProperty')
        ]);
        const rootNode = createMockElement('div', [], [childNode]);

        updateTemplateAttrs([rootNode] as any, 'parentDataSet', 'testWidget');

        expect(childNode.attrs[0].value).toBe('bind:item.nestedProperty');
    });

    it('should not update non-bind attributes', () => {
        const rootNode = createMockElement('div', [
            createMockAttribute('class', 'some-class'),
            createMockAttribute('bind', 'bind:parentDataSet.someProperty')
        ]);

        updateTemplateAttrs([rootNode] as any, 'parentDataSet', 'testWidget');

        expect(rootNode.attrs[0].value).toBe('some-class');
        expect(rootNode.attrs[1].value).toBe('bind:item.someProperty');
    });

    it('should handle currentItem expressions', () => {
        const rootNode = createMockElement('div', [
            createMockAttribute('bind', 'bind:Widgets.testWidget.currentItem.someProperty')
        ]);

        updateTemplateAttrs([rootNode] as any, 'parentDataSet', 'testWidget');

        expect(rootNode.attrs[0].value).toBe('bind:item.someProperty');
    });

    it('should handle currentItemWidgets expressions', () => {
        const rootNode = createMockElement('div', [
            createMockAttribute('bind', 'bind:Widgets.testWidget.currentItemWidgets.someProperty')
        ]);

        updateTemplateAttrs([rootNode] as any, 'parentDataSet', 'testWidget', 'instance_');

        expect(rootNode.attrs[0].value).toBe('bind:instance_currentItemWidgets.someProperty');
    });

    it('should handle formWidgets expressions', () => {
        const rootNode = createMockElement('div', [
            createMockAttribute('bind', 'bind:Widgets.formName.formWidgets.listName.currentItem.someProperty')
        ]);

        updateTemplateAttrs([rootNode] as any, 'parentDataSet', 'listName');

        expect(rootNode.attrs[0].value).toBe('bind:item.someProperty');
    });

    it('should not update parentDataSet.length expressions', () => {
        const rootNode = createMockElement('div', [
            createMockAttribute('bind', 'bind:parentDataSet.length > 0')
        ]);

        updateTemplateAttrs([rootNode] as any, 'parentDataSet', 'testWidget');

        expect(rootNode.attrs[0].value).toBe('bind:parentDataSet.length > 0');
    });

    it('should handle custom pipe expressions', () => {
        const rootNode = createMockElement('div', [
            createMockAttribute('bind', 'bind:parentDataSet.someProperty | custom: someParam')
        ]);

        updateTemplateAttrs([rootNode] as any, 'parentDataSet', 'testWidget');

        expect(rootNode.attrs[0].value).toBe('bind:item.someProperty | custom: someParam:item');
    });
});

describe('getRowActionAttrs', () => {
    it('should return an empty string for empty attrs', () => {
        const attrs = new Map();
        expect(getRowActionAttrs(attrs)).toBe('');
    });

    it('should return correct string for matching attrs', () => {
        const attrs = new Map([
            ['display-name', 'Display Name'],
            ['title', 'Title'],
            ['show', 'true']
        ]);
        expect(getRowActionAttrs(attrs)).toBe('caption="Display Name" hint="Title" show="true" ');
    });

    it('should handle bind attributes correctly', () => {
        const attrs = new Map([
            ['display-name.bind', 'boundDisplayName'],
            ['disabled.bind', 'isDisabled']
        ]);
        expect(getRowActionAttrs(attrs)).toBe('caption.bind="boundDisplayName" disabled.bind="isDisabled" ');
    });

    it('should ignore attrs not in rowActionAttrs', () => {
        const attrs = new Map([
            ['display-name', 'Display Name'],
            ['unknownAttr', 'Unknown Value']
        ]);
        expect(getRowActionAttrs(attrs)).toBe('caption="Display Name" ');
    });

    it('should handle all types of attrs in rowActionAttrs', () => {
        const attrs = new Map([
            ['display-name', 'Display Name'],
            ['title.bind', 'boundTitle'],
            ['show', 'true'],
            ['disabled.bind', 'isDisabled'],
            ['hyperlink', 'https://example.com'],
            ['target', '_blank'],
            ['conditionalclass.bind', 'getClass()'],
            ['conditionalstyle.bind', 'getStyle()']
        ]);
        expect(getRowActionAttrs(attrs)).toBe(
            'caption="Display Name" hint.bind="boundTitle" show="true" disabled.bind="isDisabled" ' +
            'hyperlink="https://example.com" target="_blank" conditionalclass.bind="getClass()" ' +
            'conditionalstyle.bind="getStyle()" '
        );
    });
});

describe('getNgModelAttr', () => {
    it('should return empty string when formControlName is present', () => {
        const attrs = new Map([['formControlName', 'someControl']]);
        expect(getNgModelAttr(attrs)).toBe('');
    });

    it('should return empty string when formControlName.bind is present', () => {
        const attrs = new Map([['formControlName.bind', 'someControl']]);
        expect(getNgModelAttr(attrs)).toBe('');
    });

    it('should return "ngModel" when neither formControlName nor formControlName.bind is present', () => {
        const attrs = new Map([['someOtherAttr', 'someValue']]);
        expect(getNgModelAttr(attrs)).toBe('ngModel');
    });

    it('should return "ngModel" for empty attrs', () => {
        const attrs = new Map();
        expect(getNgModelAttr(attrs)).toBe('ngModel');
    });
});

describe('EventNotifier', () => {
    let eventNotifier: EventNotifier;
    let mockSubject: jest.Mocked<Subject<any>>;
    let mockSubscription: jest.Mocked<Subscription>;

    beforeEach(() => {
        mockSubject = new Subject() as jest.Mocked<Subject<any>>;
        mockSubscription = new Subscription() as jest.Mocked<Subscription>;
        (Subject as jest.MockedClass<typeof Subject>).mockImplementation(() => mockSubject);
        eventNotifier = new EventNotifier(false);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should start the notifier if start is true', () => {
            const startSpy = jest.spyOn(EventNotifier.prototype, 'start');
            new EventNotifier(true);
            expect(startSpy).toHaveBeenCalled();
        });

        it('should not start the notifier if start is false', () => {
            const startSpy = jest.spyOn(EventNotifier.prototype, 'start');
            new EventNotifier(false);
            expect(startSpy).not.toHaveBeenCalled();
        });
    });

    describe('notify', () => {
        it('should add event to _eventsBeforeInit when not initialized', () => {
            eventNotifier.notify('testEvent', 'data');
            expect((eventNotifier as any)._eventsBeforeInit).toEqual([
                { name: 'testEvent', data: ['data'] }
            ]);
        });

        it('should call subject.next when initialized', () => {
            eventNotifier.start();
            eventNotifier.notify('testEvent', 'data');
            expect(mockSubject.next).toHaveBeenCalledWith({
                name: 'testEvent',
                data: ['data']
            });
        });
    });

    describe('start', () => {
        it('should set _isInitialized to true', () => {
            eventNotifier.start();
            expect((eventNotifier as any)._isInitialized).toBe(true);
        });

        it('should send pending events to subscribers', () => {
            eventNotifier.notify('event1', 'data1');
            eventNotifier.notify('event2', 'data2');
            eventNotifier.start();

            expect(mockSubject.next).toHaveBeenCalledTimes(2);
            expect(mockSubject.next).toHaveBeenNthCalledWith(1, { name: 'event1', data: ['data1'] });
            expect(mockSubject.next).toHaveBeenNthCalledWith(2, { name: 'event2', data: ['data2'] });
        });

        it('should not send events twice if called multiple times', () => {
            eventNotifier.notify('event1', 'data1');
            eventNotifier.start();
            eventNotifier.start();

            expect(mockSubject.next).toHaveBeenCalledTimes(1);
        });
    });

    describe('subscribe', () => {
        it('should return noop if eventName or callback is not provided', () => {
            const result = eventNotifier.subscribe(null, null);
            expect(result).toBe(noop);
        });

        it('should subscribe to the subject and filter events', () => {
            const mockCallback = jest.fn();
            eventNotifier.subscribe('testEvent', mockCallback);

            mockSubject.subscribe.mock.calls[0][0]({ name: 'testEvent', data: ['data'] });
            expect(mockCallback).toHaveBeenCalledWith('data');

            mockSubject.subscribe.mock.calls[0][0]({ name: 'otherEvent', data: ['otherData'] });
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });
        it('should return a function that unsubscribes when called', () => {
            mockSubject.subscribe.mockReturnValue(mockSubscription);

            const unsubscribeFunction = eventNotifier.subscribe('testEvent', jest.fn());
            expect(typeof unsubscribeFunction).toBe('function');

            unsubscribeFunction();
            expect(mockSubscription.unsubscribe).toHaveBeenCalledTimes(1);
        });

        it('should return noop when eventName or callback is falsy', () => {
            expect(eventNotifier.subscribe(null, jest.fn())).toBe(noop);
            expect(eventNotifier.subscribe('eventName', null)).toBe(noop);
        });
    });

    describe('destroy', () => {
        it('should complete the subject', () => {
            eventNotifier.destroy();
            expect(mockSubject.complete).toHaveBeenCalled();
        });
    });
});

describe('Parser Functions', () => {
    let mockPipeProvider;

    beforeEach(() => {
        mockPipeProvider = {
            getPipeNameVsIsPureMap: jest.fn().mockReturnValue(new Map()),
            meta: jest.fn(),
            getInstance: jest.fn()
        };
        setPipeProvider(mockPipeProvider);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('$parseExpr', () => {
        it('should return a function for a valid expression', () => {
            const result = $parseExpr('a + b');
            expect(typeof result).toBe('function');
        });

        it('should return a noop function for an empty string', () => {
            const result = $parseExpr('');
            expect(result()).toBeUndefined();
        });

        it('should handle expressions with pipes', () => {
            mockPipeProvider.meta.mockReturnValue({ pure: true });
            mockPipeProvider.getInstance.mockReturnValue({ transform: jest.fn() });
            const result = $parseExpr('value | customPipe');
            expect(typeof result).toBe('function');
        });
    });

    describe('$parseEvent', () => {
        it('should return a function for a valid event expression', () => {
            const result = $parseEvent('onClick()');
            expect(typeof result).toBe('function');
        });

        it('should return a noop function for an empty string', () => {
            const result = $parseEvent('');
            expect(result()).toBeUndefined();
        });
    });

    describe('registerFnByExpr and getFnByExpr', () => {
        it('should register and retrieve a function by expression', () => {
            const mockFn = jest.fn();
            registerFnByExpr('testExpr', mockFn);
            const retrievedFn = getFnByExpr('testExpr');
            expect(retrievedFn).toBe(mockFn);
        });

        it('should register a function with used pipes', () => {
            const mockFn = jest.fn();
            const usedPipes = [['testPipe', 'p0']];
            registerFnByExpr('testExpr', mockFn, usedPipes);
            const retrievedFn = getFnByExpr('testExpr');
            expect(retrievedFn.usedPipes).toEqual(usedPipes);
        });
    });

    describe('getFnForBindExpr', () => {
        it('should return a function for a registered bind expression', () => {
            const mockFn = jest.fn();
            registerFnByExpr('bindExpr', mockFn);
            const result = getFnForBindExpr('bindExpr');
            expect(typeof result).toBe('function');
        });

        it('should return undefined for an unregistered expression', () => {
            const result = getFnForBindExpr('unknownExpr');
            expect(result).toBeUndefined();
        });
    });

    describe('getFnForEventExpr', () => {
        it('should return a function for a registered event expression', () => {
            const mockFn = jest.fn();
            registerFnByExpr('eventExpr', mockFn);
            const result = getFnForEventExpr('eventExpr');
            expect(typeof result).toBe('function');
        });

        it('should return undefined for an unregistered expression', () => {
            const result = getFnForEventExpr('unknownExpr');
            expect(result).toBeUndefined();
        });
    });
});

describe('isLargeTabletLandscape', () => {

    it('should use provided parameters', () => {
        isLargeTabletLandscape('1500px', '1200px');
        expect(mockMatchMedia).toHaveBeenCalledWith(
            expect.stringContaining('1500px') && expect.stringContaining('1200px')
        );
    });
});

describe('isLargeTabletPortrait', () => {

    it('should use provided parameters', () => {
        isLargeTabletPortrait('1500px', '1200px');
        expect(mockMatchMedia).toHaveBeenCalledWith(
            expect.stringContaining('1200px') && expect.stringContaining('1500px')
        );
    });
});

describe('isTablet', () => {
    it('should return true when isTabletType is true', () => {
        (document.querySelector as jest.Mock).mockReturnValue({
            widget: { viewParent: { Viewport: { isTabletType: true } } }
        });
        const result = isTablet();
        expect(result).toBe(true);
    });
});

describe('isMobileApp', () => {
    it('should return false for non-mobile application', () => {
        (global as any).getWmProjectProperties = jest.fn().mockReturnValue({
            platformType: 'WEB',
            type: 'APPLICATION'
        });
        const result = isMobileApp();
        expect(result).toBe(false);
    });
});

describe('getAndroidVersion', () => {
    const originalUserAgent = window.navigator.userAgent;

    afterEach(() => {
        Object.defineProperty(window.navigator, 'userAgent', {
            value: originalUserAgent,
            configurable: true
        });
    });

    it('should return Android version when present', () => {
        Object.defineProperty(window.navigator, 'userAgent', {
            value: 'Mozilla/5.0 (Linux; Android 9; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
            configurable: true
        });
        const result = getAndroidVersion();
        expect(result).toBe('9');
    });

    it('should return empty string when Android version is not present', () => {
        Object.defineProperty(window.navigator, 'userAgent', {
            value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
            configurable: true
        });
        const result = getAndroidVersion();
        expect(result).toBe('');
    });
});

describe('encodeUrl', () => {
    it('should encode a simple URL without query parameters', () => {
        const input = 'https://example.com/path with spaces';
        const expected = 'https://example.com/path%20with%20spaces';
        expect(encodeUrl(input)).toBe(expected);
    });

    it('should encode a URL with query parameters', () => {
        const input = 'https://example.com/path?param1=value1&param2=value 2';
        const expected = 'https://example.com/path?param1=value1&param2=value%202';
        expect(encodeUrl(input)).toBe(expected);
    });

    it('should not double-encode already encoded parameters', () => {
        const input = 'https://example.com/path?param=%20already%20encoded%20';
        const expected = 'https://example.com/path?param=%20already%20encoded%20';
        expect(encodeUrl(input)).toBe(expected);
    });
});

describe('encodeUrlParams', () => {
    it('should encode query parameters', () => {
        const input = 'https://example.com/path?param1=value 1&param2=value 2';
        const expected = 'https://example.com/path?param1=value%201&param2=value%202';
        expect(encodeUrlParams(input)).toBe(expected);
    });

    it('should handle empty parameter values', () => {
        const input = 'https://example.com/path?param1=&param2=value';
        const expected = 'https://example.com/path?param1=&param2=value';
        expect(encodeUrlParams(input)).toBe(expected);
    });

    it('should handle parameters without values', () => {
        const input = 'https://example.com/path?param1&param2=value';
        const expected = 'https://example.com/path?param1&param2=value';
        expect(encodeUrlParams(input)).toBe(expected);
    });

    it('should handle special characters in parameter values', () => {
        const input = 'https://example.com/path?param1=value&param2=á ñ';
        const expected = 'https://example.com/path?param1=value&param2=%C3%A1%20%C3%B1';
        expect(encodeUrlParams(input)).toBe(expected);
    });

    it('should not modify URLs without query parameters', () => {
        const input = 'https://example.com/path';
        const expected = 'https://example.com/path';
        expect(encodeUrlParams(input)).toBe(expected);
    });

    it('should handle URLs with encoded parameters', () => {
        const input = 'https://example.com/path?param=%20already%20encoded%20';
        const expected = 'https://example.com/path?param=%20already%20encoded%20';
        expect(encodeUrlParams(input)).toBe(expected);
    });
});


describe('initCaps', () => {
    it('should capitalize the first letter of a string', () => {
        expect(initCaps('hello')).toBe('Hello');
        expect(initCaps('world')).toBe('World');
    });

    it('should return an empty string if input is falsy', () => {
        expect(initCaps('')).toBe('');
        expect(initCaps(null)).toBe('');
        expect(initCaps(undefined)).toBe('');
    });

    it('should not change already capitalized strings', () => {
        expect(initCaps('Hello')).toBe('Hello');
        expect(initCaps('WORLD')).toBe('WORLD');
    });
});

describe('spaceSeparate', () => {
    it('should convert camelCase to space separated string', () => {
        expect(spaceSeparate('camelCase')).toBe('camel Case');
        expect(spaceSeparate('thisIsATest')).toBe('this Is A Test');
    });

    it('should not change all uppercase strings', () => {
        expect(spaceSeparate('ALLCAPS')).toBe('ALLCAPS');
    });

    it('should handle single word inputs', () => {
        expect(spaceSeparate('word')).toBe('word');
    });
});

describe('replaceAt', () => {
    it('should replace a character at a specific index', () => {
        expect(replaceAt('hello', 1, 'a')).toBe('hallo');
        expect(replaceAt('world', 0, 'W')).toBe('World');
    });

    it('should handle replacement with multiple characters', () => {
        expect(replaceAt('test', 2, 'sting')).toBe('testing');
    });
});

describe('periodSeparate', () => {
    it('should replace period with space and capitalize next letter', () => {
        expect(periodSeparate('hello.world')).toBe('hello World');
        expect(periodSeparate('a.b.c')).toBe('a B.c');
    });

    it('should not change strings without periods', () => {
        expect(periodSeparate('hello')).toBe('hello');
    });

    it('should handle multiple periods correctly', () => {
        expect(periodSeparate('a.b.c.d')).toBe('a B.c.d');
    });
});

describe('prettifyLabel', () => {
    it('should convert camelCase to pretty label', () => {
        expect(prettifyLabel('camelCase')).toBe('Camel Case');
        expect(prettifyLabel('thisIsATest')).toBe('This Is A Test');
    });

    it('should handle period separation', () => {
        expect(prettifyLabel('hello.world')).toBe('Hello World');
    });

    it('should handle mixed case and periods', () => {
        expect(prettifyLabel('mixedCase.withPeriod')).toBe('Mixed Case With Period');
    });

    it('should handle all lowercase input', () => {
        expect(prettifyLabel('alllowercase')).toBe('Alllowercase');
    });

    it('should handle empty string', () => {
        expect(prettifyLabel('')).toBe('');
    });
});

describe('deHyphenate', () => {
    it('should replace hyphens with spaces', () => {
        expect(deHyphenate('hello-world')).toBe('hello world');
        expect(deHyphenate('this-is-a-test')).toBe('this is a test');
    });

    it('should handle strings without hyphens', () => {
        expect(deHyphenate('hello')).toBe('hello');
    });

    it('should handle empty string', () => {
        expect(deHyphenate('')).toBe('');
    });
});

describe('prettifyLabels', () => {
    it('should prettify a string of comma-separated labels', () => {
        expect(prettifyLabels('camelCase,snake_case,kebab-case')).toBe('Camel Case,Snake Case,Kebab Case');
    });

    it('should handle custom separators', () => {
        expect(prettifyLabels('camelCase|snake_case|kebab-case', '|')).toBe('Camel Case|Snake Case|Kebab Case');
    });

    it('should handle empty input', () => {
        expect(prettifyLabels([])).toEqual([]);
        expect(prettifyLabels('')).toBe('');
    });
});

describe('isInsecureContentRequest', () => {
    let originalLocation;

    beforeEach(() => {
        originalLocation = window.location;
        delete window.location;
        window.location = { href: 'https://example.com' } as Location;
    });

    afterEach(() => {
        window.location = originalLocation;
    });

    it('should return false for HTTPS URLs', () => {
        expect(isInsecureContentRequest('https://example.com')).toBe(false);
    });

    it('should return true for HTTP URLs when current page is HTTPS', () => {
        expect(isInsecureContentRequest('http://example.com')).toBe(true);
    });

    it('should return false for data URLs', () => {
        expect(isInsecureContentRequest('data:image/png;base64,iVBORw0KGgo=')).toBe(false);
    });

    it('should return false for WSS URLs', () => {
        expect(isInsecureContentRequest('wss://example.com')).toBe(false);
    });
});

describe('stringStartsWith', () => {
    it('should return true if string starts with given prefix', () => {
        expect(stringStartsWith('hello world', 'hello')).toBe(true);
    });

    it('should return false if string does not start with given prefix', () => {
        expect(stringStartsWith('hello world', 'world')).toBe(false);
    });

    it('should be case-sensitive by default', () => {
        expect(stringStartsWith('Hello world', 'hello')).toBe(false);
    });

    it('should be case-insensitive when specified', () => {
        expect(stringStartsWith('Hello world', 'hello', true)).toBe(true);
    });

    it('should handle empty strings', () => {
        expect(stringStartsWith('', 'hello')).toBe(false);
        expect(stringStartsWith('hello', '')).toBe(true);
    });
});

describe('getEvaluatedExprValue', () => {
    const testObject = {
        name: 'John Doe',
        age: 30,
        'complex name': 'Complex Value'
    };

    it('should evaluate simple expressions', () => {
        expect(getEvaluatedExprValue(testObject, 'name')).toBe('John Doe');
        expect(getEvaluatedExprValue(testObject, 'age')).toBe(30);
    });

    it('should handle fields with spaces', () => {
        expect(getEvaluatedExprValue(testObject, 'complex name')).toBe('Complex Value');
    });

    it('should return undefined for non-existent properties', () => {
        expect(getEvaluatedExprValue(testObject, 'nonExistent')).toBeUndefined();
    });
});

describe('isImageFile', () => {
    it('should return true for supported image formats', () => {
        expect(isImageFile('image.jpg')).toBe(true);
        expect(isImageFile('photo.PNG')).toBe(true);
        expect(isImageFile('graphic.gif')).toBe(true);
    });

    it('should return false for unsupported formats', () => {
        expect(isImageFile('document.pdf')).toBe(false);
        expect(isImageFile('audio.mp3')).toBe(false);
    });

    it('should be case-insensitive', () => {
        expect(isImageFile('IMAGE.JPG')).toBe(true);
    });
});

describe('isAudioFile', () => {
    it('should return true for supported audio formats', () => {
        expect(isAudioFile('song.mp3')).toBe(true);
        expect(isAudioFile('audio.wav')).toBe(true);
        expect(isAudioFile('sound.ogg')).toBe(true);
    });

    it('should return false for unsupported formats', () => {
        expect(isAudioFile('video.mp4')).toBe(false);
        expect(isAudioFile('image.png')).toBe(false);
    });

    it('should be case-insensitive', () => {
        expect(isAudioFile('MUSIC.MP3')).toBe(true);
    });
});

describe('isVideoFile', () => {
    it('should return true for supported video formats', () => {
        expect(isVideoFile('movie.mp4')).toBe(true);
        expect(isVideoFile('clip.webm')).toBe(true);
        expect(isVideoFile('video.ogg')).toBe(true);
    });

    it('should return false for unsupported formats', () => {
        expect(isVideoFile('audio.mp3')).toBe(false);
        expect(isVideoFile('image.jpg')).toBe(false);
    });

    it('should be case-insensitive', () => {
        expect(isVideoFile('VIDEO.MP4')).toBe(true);
    });
});

describe('isValidWebURL', () => {
    it('should return true for valid URLs', () => {
        expect(isValidWebURL('https://www.example.com')).toBe(true);
        expect(isValidWebURL('http://subdomain.example.co.uk/path')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
        expect(isValidWebURL('not a url')).toBe(false);
        expect(isValidWebURL('ftp://example.com')).toBe(false);
    });
});

describe('getResourceURL', () => {
    it('should return the same URL if it is valid', () => {
        const validUrl = 'https://www.example.com';
        expect(getResourceURL(validUrl)).toBe(validUrl);
    });

    it('should return the input string if it is not a valid URL', () => {
        const invalidUrl = 'not a url';
        expect(getResourceURL(invalidUrl)).toBe(invalidUrl);
    });

    // Note: The actual sanitization is commented out in the function,
    // so we can't test that part without mocking DomSanitizer
});

describe('triggerFn', () => {
    it('should execute the function with given arguments', () => {
        const testFn = jest.fn();
        triggerFn(testFn, 'arg1', 'arg2');
        expect(testFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should return the result of the function', () => {
        const testFn = (a, b) => a + b;
        expect(triggerFn(testFn, 2, 3)).toBe(5);
    });

    it('should do nothing if the first argument is not a function', () => {
        expect(triggerFn('not a function', 'arg1', 'arg2')).toBeUndefined();
    });

    it('should work with no additional arguments', () => {
        const testFn = jest.fn();
        triggerFn(testFn);
        expect(testFn).toHaveBeenCalledWith();
    });
});


describe('hasOffsetStr', () => {
    it('should return true for date string with offset', () => {
        expect(hasOffsetStr('2023-05-20T12:34:56+02:00')).toBe(true);
    });

    it('should return undefined for date string without offset', () => {
        expect(hasOffsetStr('2023-05-20')).toBeUndefined();
    });

    it('should return undefined for non-string input', () => {
        expect(hasOffsetStr(new Date())).toBeUndefined();
    });
});


describe('getFormattedDate', () => {

    // Mock datePipe
    const mockDatePipe = {
        transform: jest.fn((date, format) => moment(date).format(format))
    };
    it('should return undefined for falsy dateObj', () => {
        expect(getFormattedDate(mockDatePipe, null, 'yyyy-MM-dd')).toBeUndefined();
    });

    it('should return timestamp for "timestamp" format', () => {
        const testDate = new Date('2023-05-20T12:34:56Z');
        const result = getFormattedDate(mockDatePipe, testDate, 'timestamp');
        expect(typeof result).toBe('number');
        expect(result).toBe(testDate.getTime());
    });

    it('should return ISO string for "UTC" format', () => {
        const testDate = new Date('2023-05-20T12:34:56Z');
        const result = getFormattedDate(mockDatePipe, testDate, 'UTC');
        expect(result).toBe(testDate.toISOString());
    });

    it('should use moment for formatting with timezone', () => {
        const testDate = new Date('2023-05-20T12:34:56Z');
        const result = getFormattedDate(mockDatePipe, testDate, 'YYYY-MM-DD', 'UTC');
        expect(result).toBe(moment(testDate).utc().format('YYYY-MM-DD'));
    });

    it('should use datePipe for default formatting', () => {
        const testDate = new Date('2023-05-20T12:34:56Z');
        getFormattedDate(mockDatePipe, testDate, 'yyyy-MM-dd');
        expect(mockDatePipe.transform).toHaveBeenCalledWith(testDate, 'yyyy-MM-dd', undefined, undefined);
    });
});

describe('hasOffsetStr', () => {
    it('should return true for date string with offset', () => {
        expect(hasOffsetStr('2023-05-20T12:34:56+02:00')).toBe(true);
    });

    it('should return undefined for date string without offset', () => {
        expect(hasOffsetStr('2023-05-20')).toBeUndefined();
    });

    it('should return undefined for non-string input', () => {
        expect(hasOffsetStr(new Date())).toBeUndefined();
    });
});

describe('getDateObj', () => {
    it('should return the input if it\'s already a Date object', () => {
        const date = new Date('2023-05-20');
        expect(getDateObj(date)).toBe(date);
    });

    it('should convert timestamp string to Date', () => {
        const result = getDateObj('1684584896000');
        expect(result).toBeInstanceOf(Date);
        expect(result.getTime()).toBe(1684584896000);
    });

    it('should return undefined for invalid date', () => {
        expect(getDateObj('invalid date')).toBeUndefined();
    });

    it('should use moment for string dates', () => {
        const result = getDateObj('2023-05-20');
        expect(result).toBeInstanceOf(Date);
        expect(result.toISOString()).toBe('2023-05-19T18:30:00.000Z');
    });

    it('should handle options with pattern', () => {
        const result = getDateObj('20-05-2023', { pattern: 'DD-MM-YYYY' });
        expect(result).toBeInstanceOf(Date);
        expect(result.toISOString()).toBe('2023-05-19T18:30:00.000Z');
    });

    it('should handle timezone option', () => {
        const result = getDateObj('2023-05-20', {}, 'UTC');
        expect(result).toBeInstanceOf(Date);
        expect(result.toISOString()).toBe('2023-05-19T13:00:00.000Z');
    });
});

describe('getClonedObject', () => {
    it('should return a deep clone of the object', () => {
        const original = { a: 1, b: { c: 2 } };
        const clone = getClonedObject(original);
        expect(clone).toEqual(original);
        expect(clone).not.toBe(original);
        expect(clone.b).not.toBe(original.b);
    });
});

describe('generateGUId', () => {
    it('should generate a GUID-like string', () => {
        const guid = generateGUId();
        expect(guid).toMatch(/^[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}$/);
    });
});

describe('validateAccessRoles', () => {
    it('should return true when roles match', () => {
        const roleExp = 'admin, user';
        const loggedInUser = { userRoles: ['user', 'guest'] };

        const result = validateAccessRoles(roleExp, loggedInUser);
        expect(result).toBe(1);
    });

    it('should return false when no roles match', () => {
        const roleExp = 'admin';
        const loggedInUser = { userRoles: ['user', 'guest'] };

        const result = validateAccessRoles(roleExp, loggedInUser);
        expect(result).toBe(0);
    });

    it('should return true when roleExp or loggedInUser is falsy', () => {
        expect(validateAccessRoles(null, {})).toBe(true);
        expect(validateAccessRoles('admin', null)).toBe(true);
    });
});

describe('getValidJSON', () => {
    it('should return undefined for falsy input', () => {
        expect(getValidJSON(null)).toBeUndefined();
        expect(getValidJSON('')).toBeUndefined();
    });

    it('should return the input if it\'s already an object', () => {
        const obj = { a: 1 };
        expect(getValidJSON(obj)).toBe(obj);
    });

    it('should parse valid JSON string', () => {
        const jsonString = '{"a": 1, "b": 2}';
        expect(getValidJSON(jsonString)).toEqual({ a: 1, b: 2 });
    });

    it('should return undefined for invalid JSON string', () => {
        const invalidJson = '{a: 1}';
        expect(getValidJSON(invalidJson)).toBeUndefined();
    });
});

describe('xmlToJson', () => {
    let originalX2JS: any;

    beforeEach(() => {
        originalX2JS = (global as any).X2JS;
    });

    afterEach(() => {
        (global as any).X2JS = originalX2JS;
    });

    it('should convert XML to JSON', () => {
        const xmlString = '<root><item>value</item></root>';
        const expectedJson = { item: 'value' };

        const mockX2JS = function () {
            return {
                xml2js: jest.fn().mockReturnValue({ root: expectedJson })
            };
        };
        (global as any).X2JS = jest.fn().mockImplementation(mockX2JS);

        const result = xmlToJson(xmlString);
        expect(result).toEqual(expectedJson);
        expect((global as any).X2JS).toHaveBeenCalledWith({
            'emptyNodeForm': 'content',
            'attributePrefix': '',
            'enableToStringFunc': false
        });
    });

});


describe('addEventListenerOnElement', () => {
    let element: Element;
    let excludeElement: Element;
    let nativeElement: Element;
    let successCB: jest.Mock;

    beforeEach(() => {
        element = document.createElement('div');
        excludeElement = document.createElement('div');
        nativeElement = document.createElement('div');
        successCB = jest.fn();
        document.body.appendChild(element);
        document.body.appendChild(excludeElement);
        document.body.appendChild(nativeElement);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    const triggerEvent = (target: Element, eventType: string) => {
        const event = new Event(eventType, { bubbles: true, cancelable: true });
        Object.defineProperty(event, 'target', { value: target, enumerable: true });
        element.dispatchEvent(event);
    };

    it('should call successCB when event occurs outside nativeElement', () => {
        addEventListenerOnElement(element, excludeElement, nativeElement, 'click', false, successCB, EVENT_LIFE.WINDOW);
        triggerEvent(document.body, 'click');
        expect(successCB).toHaveBeenCalledTimes(1);
    });

    it('should not call successCB when event occurs inside excludeElement', () => {
        addEventListenerOnElement(element, excludeElement, nativeElement, 'click', false, successCB, EVENT_LIFE.WINDOW);
        triggerEvent(excludeElement, 'click');
        expect(successCB).not.toHaveBeenCalled();
    });

    it('should not call successCB when event occurs inside nativeElement', () => {
        addEventListenerOnElement(element, excludeElement, nativeElement, 'click', false, successCB, EVENT_LIFE.WINDOW);
        triggerEvent(nativeElement, 'click');
        expect(successCB).not.toHaveBeenCalled();
    });

    it('should remove event listener after first event when life is ONCE', () => {
        addEventListenerOnElement(element, excludeElement, nativeElement, 'click', false, successCB, EVENT_LIFE.ONCE);
        triggerEvent(document.body, 'click');
        triggerEvent(document.body, 'click');
        expect(successCB).toHaveBeenCalledTimes(1);
    });

    it('should not remove event listener after first event when life is WINDOW', () => {
        addEventListenerOnElement(element, excludeElement, nativeElement, 'click', false, successCB, EVENT_LIFE.WINDOW);
        triggerEvent(document.body, 'click');
        triggerEvent(document.body, 'click');
        expect(successCB).toHaveBeenCalledTimes(2);
    });

    it('should not call successCB when event occurs on input inside nativeElement and isDropDownDisplayEnabledOnInput is false', () => {
        const input = document.createElement('input');
        nativeElement.appendChild(input);
        addEventListenerOnElement(element, excludeElement, nativeElement, 'click', false, successCB, EVENT_LIFE.WINDOW);
        triggerEvent(input, 'click');
        expect(successCB).not.toHaveBeenCalled();
    });
    it('should remove event listener when removeEventListener is called', () => {
        const removeListener = addEventListenerOnElement(element, excludeElement, nativeElement, 'click', false, successCB, EVENT_LIFE.WINDOW);
        removeListener();
        triggerEvent(document.body, 'click');
        expect(successCB).not.toHaveBeenCalled();
    });
});


describe('findValueOf', () => {
    it('should find value in nested object', () => {
        const obj = {
            a: {
                b: {
                    c: 'test'
                }
            }
        };
        expect(findValueOf(obj, 'a.b.c')).toBe('test');
    });

    it('should return undefined for non-existent key', () => {
        const obj = { a: 1 };
        expect(findValueOf(obj, 'b')).toBeUndefined();
    });

    it('should create nested object when create is true', () => {
        const obj = {};
        findValueOf(obj, 'a.b.c', true);
        expect(obj).toEqual({ a: { b: { c: {} } } });
    });

    it('should handle array notation in key', () => {
        const obj = { a: [{ b: 1 }, { b: 2 }] };
        expect(findValueOf(obj, 'a[1].b')).toBe(2);
    });
});

describe('extractType', () => {
    it('should extract type from typeRef', () => {
        expect(extractType('java.lang.String')).toBe('string');
    });

    it('should return STRING for undefined typeRef', () => {
        expect(extractType(undefined)).toBe(DataType.STRING);
    });

    it('should convert LOCALDATETIME to DATETIME', () => {
        expect(extractType('java.time.LocalDateTime')).toBe(DataType.DATETIME);
    });
});

describe('isNumberType', () => {
    const NUMBER_TYPES = ['int', DataType.INTEGER, DataType.FLOAT, DataType.DOUBLE, DataType.LONG, DataType.SHORT, DataType.BYTE, DataType.BIG_INTEGER, DataType.BIG_DECIMAL];
    it('should return true for number types', () => {
        NUMBER_TYPES.forEach(type => {
            expect(isNumberType(type)).toBe(true);
        });
    });

    it('should return false for non-number types', () => {
        expect(isNumberType('string')).toBe(false);
    });
});

describe('isEmptyObject', () => {
    it('should return true for empty object', () => {
        expect(isEmptyObject({})).toBe(true);
    });

    it('should return false for non-empty object', () => {
        expect(isEmptyObject({ a: 1 })).toBe(false);
    });

    it('should return false for arrays', () => {
        expect(isEmptyObject([])).toBe(false);
    });

    it('should return false for null', () => {
        expect(isEmptyObject(null)).toBe(false);
    });
});

describe('replace', () => {
    it('should replace patterns in string with object keys', () => {
        const result = replace('Hello, ${first} ${last}!', { first: 'wavemaker', last: 'ng' });
        expect(result).toBe('Hello, wavemaker ng!');
    });

    it('should replace patterns in string with array values', () => {
        const result = replace('Hello, ${0} ${1}!', ['wavemaker', 'ng']);
        expect(result).toBe('Hello, wavemaker ng!');
    });

    it('should handle parseError option', () => {
        const result = replace('Hello, {0} {1}!', ['wavemaker', 'ng'], true);
        expect(result).toBe('Hello, wavemaker ng!');
    });

    it('should return undefined for falsy template', () => {
        expect(replace(null, {})).toBeUndefined();
    });
});

describe('isDateTimeType', () => {
    it('should return true for date time types', () => {
        expect(isDateTimeType(DataType.DATE)).toBe(true);
        expect(isDateTimeType(DataType.TIME)).toBe(true);
        expect(isDateTimeType(DataType.TIMESTAMP)).toBe(true);
        expect(isDateTimeType(DataType.DATETIME)).toBe(true);
        expect(isDateTimeType(DataType.LOCALDATETIME)).toBe(true);
    });
    it('should return false for non-date time types', () => {
        expect(isDateTimeType('string')).toBe(false);
        expect(isDateTimeType('number')).toBe(false);
    });
    it('should handle full type references', () => {
        expect(isDateTimeType('java.util.Date')).toBe(true);
    });
});


describe('getBlob', () => {
    it('should return the input if it is already a Blob', () => {
        const inputBlob = new Blob(['test'], { type: 'text/plain' });
        const result = getBlob(inputBlob);
        expect(result).toBe(inputBlob);
    });
    it('should create a Blob with JSON content for object input', () => {
        const input = { key: 'value' };
        const result = getBlob(input);
        expect(result).toBeInstanceOf(Blob);
        expect(result.type).toBe('application/json');
    });
    it('should create a Blob with text content for string input', () => {
        const input = 'Hello, world!';
        const result = getBlob(input);
        expect(result).toBeInstanceOf(Blob);
        expect(result.type).toBe('text/plain');
    });
    it('should use provided content type', () => {
        const input = 'Hello, world!';
        const contentType = 'text/html';
        const result = getBlob(input, contentType);
        expect(result).toBeInstanceOf(Blob);
        expect(result.type).toBe(contentType);
    });
    it('should handle null input', () => {
        const result = getBlob(null);
        expect(result).toBeInstanceOf(Blob);
        expect(result.size).toBe(4); // 'null' as string
    });
    it('should handle undefined input', () => {
        const result = getBlob(undefined);
        expect(result).toBeInstanceOf(Blob);
        expect(result.size).toBe(9); // 'undefined' as string
    });
});

describe('getValidDateObject', () => {
    it('should return undefined for undefined input', () => {
        const result = getValidDateObject(undefined);
        expect(result).toBeUndefined();
    });
    it('should handle meridian replacement', () => {
        const options = { meridians: ['AM', 'PM'] };
        const result = getValidDateObject('2023-05-15 10:30 AM', options);
        expect(typeof result).toBe('string');
        expect(result).toBe('2023-05-15 10:30 AM');
    });
    it('should handle native picker format', () => {
        const options = { isNativePicker: true, pattern: 'YYYY/MM/DD HH:mm:ss' };
        const result = getValidDateObject('2023/05/15 10:30:00', options);
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(4); // May is 4 (zero-based)
        expect(result.getDate()).toBe(15);
    });
    it('should handle timestamp string', () => {
        const timestamp = Date.now().toString();
        const result = getValidDateObject(timestamp);
        expect(result).toBeInstanceOf(Date);
        expect(result.getTime()).toBe(parseInt(timestamp, 10));
    });
    it('should handle HH:mm:ss format', () => {
        const result = getValidDateObject('10:30:00');
        expect(result).toBeInstanceOf(Date);
        expect(result.getHours()).toBe(10);
        expect(result.getMinutes()).toBe(30);
    });
});

describe('getNativeDateObject', () => {
    it('should return a native Date object', () => {
        const result = getNativeDateObject('2023-05-15');
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(4);
        expect(result.getDate()).toBe(15);
    });
    it('should handle options', () => {
        const options = { pattern: 'DD-MM-YYYY' };
        const result = getNativeDateObject('15-05-2023', options);
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(4);
        expect(result.getDate()).toBe(15);
    });
});


describe('isEqualWithFields', () => {
    it('should return true for equal objects with single field comparison', () => {
        const obj1 = { id: 1, name: 'John' };
        const obj2 = { id: 1, name: 'Jane' };
        expect(isEqualWithFields(obj1, obj2, 'id')).toBe(true);
    });

    it('should return false for unequal objects with single field comparison', () => {
        const obj1 = { id: 1, name: 'John' };
        const obj2 = { id: 2, name: 'John' };
        expect(isEqualWithFields(obj1, obj2, 'id')).toBe(false);
    });

    it('should return true for equal objects with multiple field comparison', () => {
        const obj1 = { id: 1, name: 'John', age: 30 };
        const obj2 = { id: 1, name: 'John', age: 25 };
        expect(isEqualWithFields(obj1, obj2, 'id, name')).toBe(true);
    });

    it('should return false for unequal objects with multiple field comparison', () => {
        const obj1 = { id: 1, name: 'John', age: 30 };
        const obj2 = { id: 1, name: 'Jane', age: 30 };
        expect(isEqualWithFields(obj1, obj2, 'id, name')).toBe(false);
    });

    it('should handle nested object comparison', () => {
        const obj1 = { id: 1, details: { name: 'John' } };
        const obj2 = { id: 1, details: { name: 'John' } };
        expect(isEqualWithFields(obj1, obj2, 'id, details.name')).toBe(true);
    });

    it('should handle comparison with different field names', () => {
        const obj1 = { id: 1, name: 'John' };
        const obj2 = { userId: 1, fullName: 'Jane' };
        expect(isEqualWithFields(obj1, obj2, 'id:userId')).toBe(true);
    });

    it('should handle array input for compareBy', () => {
        const obj1 = { id: 1, name: 'John', age: 30 };
        const obj2 = { id: 1, name: 'John', age: 25 };
        expect(isEqualWithFields(obj1, obj2, ['id', 'name'])).toBe(true);
    });

    it('should return false when compared fields are undefined', () => {
        const obj1 = { id: 1 };
        const obj2 = { name: 'John' };
        expect(isEqualWithFields(obj1, obj2, 'id')).toBe(false);
    });

    it('should handle empty compareBy', () => {
        const obj1 = { id: 1, name: 'John' };
        const obj2 = { id: 2, name: 'Jane' };
        expect(isEqualWithFields(obj1, obj2, '')).toBe(true);
    });

    it('should handle objects with different structures', () => {
        const obj1 = { id: 1, details: { name: 'John' } };
        const obj2 = { userId: 1, fullName: 'John' };
        expect(isEqualWithFields(obj1, obj2, 'id:userId, details.name:fullName')).toBe(true);
    });
});


describe('getUrlParams', () => {
    it('should return an empty object for a URL without parameters', () => {
        const url = 'https://example.com/page';
        expect(getUrlParams(url)).toEqual({});
    });

    it('should parse single parameter correctly', () => {
        const url = 'https://example.com/page?param1=value1';
        expect(getUrlParams(url)).toEqual({ param1: 'value1' });
    });

    it('should parse multiple parameters correctly', () => {
        const url = 'https://example.com/page?param1=value1&param2=value2&param3=value3';
        expect(getUrlParams(url)).toEqual({
            param1: 'value1',
            param2: 'value2',
            param3: 'value3'
        });
    });

    it('should handle parameters without values', () => {
        const url = 'https://example.com/page?param1=value1&param2=&param3';
        expect(getUrlParams(url)).toEqual({
            param1: 'value1',
            param2: '',
            param3: undefined
        });
    });

    it('should return an empty object for a URL with only a question mark', () => {
        const url = 'https://example.com/page?';
        expect(getUrlParams(url)).toEqual({});
    });
});

describe('getRouteNameFromLink', () => {
    it('should return the route without hash and parameters', () => {
        const link = '#/route/to/page?param1=value1';
        expect(getRouteNameFromLink(link)).toBe('/route/to/page');
    });

    it('should handle links without hash', () => {
        const link = '/route/to/page?param1=value1';
        expect(getRouteNameFromLink(link)).toBe('/route/to/page');
    });

    it('should return the full path if there are no parameters', () => {
        const link = '#/route/to/page';
        expect(getRouteNameFromLink(link)).toBe('/route/to/page');
    });

    it('should handle root path', () => {
        const link = '#/?param1=value1';
        expect(getRouteNameFromLink(link)).toBe('/');
    });

    it('should return empty string for empty input', () => {
        const link = '';
        expect(getRouteNameFromLink(link)).toBe('');
    });

    it('should handle links with multiple question marks', () => {
        const link = '#/route/to/page?param1=value1?param2=value2';
        expect(getRouteNameFromLink(link)).toBe('/route/to/page');
    });
});

describe('Session Storage Functions', () => {
    let mockSessionStorage;

    beforeEach(() => {
        // Create a mock sessionStorage
        mockSessionStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
        };

        // Mock the window object
        Object.defineProperty(global, 'window', {
            value: {
                sessionStorage: mockSessionStorage,
            },
            writable: true,
        });

        // Set a test id for _WM_APP_PROJECT
        _WM_APP_PROJECT.id = 'test-project-id';
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('setSessionStorageItem', () => {
        it('should create a new item if it does not exist', () => {
            mockSessionStorage.getItem.mockReturnValue(null);

            setSessionStorageItem('testKey', 'testValue');

            expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
                'test-project-id',
                JSON.stringify({ testKey: 'testValue' })
            );
        });

        it('should update an existing item', () => {
            mockSessionStorage.getItem.mockReturnValue(JSON.stringify({ existingKey: 'existingValue' }));

            setSessionStorageItem('testKey', 'testValue');

            expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
                'test-project-id',
                JSON.stringify({ existingKey: 'existingValue', testKey: 'testValue' })
            );
        });
    });

    describe('getSessionStorageItem', () => {
        it('should return the value for an existing key', () => {
            mockSessionStorage.getItem.mockReturnValue(JSON.stringify({ testKey: 'testValue' }));

            const result = getSessionStorageItem('testKey');

            expect(result).toBe('testValue');
        });

        it('should return undefined for a non-existing key', () => {
            mockSessionStorage.getItem.mockReturnValue(JSON.stringify({ otherKey: 'otherValue' }));

            const result = getSessionStorageItem('testKey');

            expect(result).toBeUndefined();
        });

        it('should return undefined if the item does not exist', () => {
            mockSessionStorage.getItem.mockReturnValue(null);

            const result = getSessionStorageItem('testKey');

            expect(result).toBeUndefined();
        });
    });
});


describe('convertToBlob', () => {
    (global as any).resolveLocalFileSystemURL = jest.fn();
    let mockFileEntry;
    let mockFile;
    let mockFileReader;

    beforeEach(() => {
        mockFileEntry = {
            file: jest.fn()
        };

        mockFile = {
            type: 'image/jpeg'
        };

        mockFileReader = {
            onloadend: null,
            onerror: null,
            readAsArrayBuffer: jest.fn(),
            result: new ArrayBuffer(8)
        };

        (global as any).FileReader = jest.fn(() => mockFileReader);
    });
    it('should reject when resolveLocalFileSystemURL fails', async () => {
        const testFilePath = 'file:///path/to/image.jpg';
        const testError = new Error('File not found');

        (global as any).resolveLocalFileSystemURL.mockImplementation((filepath, success, error) => {
            error(testError);
        });

        await expect(convertToBlob(testFilePath)).rejects.toEqual(testError);
    });

    it('should reject when FileReader encounters an error', async () => {
        const testFilePath = 'file:///path/to/image.jpg';
        const testError = new Error('Read error');

        (global as any).resolveLocalFileSystemURL.mockImplementation((filepath, success) => {
            success(mockFileEntry);
        });

        mockFileEntry.file.mockImplementation((callback) => {
            callback(mockFile);
        });

        const result = convertToBlob(testFilePath);

        // Simulate FileReader error
        mockFileReader.onerror(testError);

        await expect(result).rejects.toEqual(testError);
    });
});


describe('hasCordova', () => {
    it('should return true when window.cordova exists', () => {
        window['cordova'] = {};
        expect(hasCordova()).toBe(true);
        delete window['cordova'];
    });

    it('should return false when window.cordova does not exist', () => {
        expect(hasCordova()).toBe(false);
    });
});

describe('openLink', () => {
    let originalWindowOpen;
    let originalLocationHash;

    beforeEach(() => {
        originalWindowOpen = window.open;
        originalLocationHash = location.hash;
        (window as any).open = jest.fn();
        Object.defineProperty(window, 'location', {
            value: { hash: '' },
            writable: true
        });
    });

    afterEach(() => {
        window.open = originalWindowOpen;
        location.hash = originalLocationHash;
    });

    it('should set location.hash when hasCordova is true and link starts with #', () => {
        window['cordova'] = {};
        openLink('#test');
        expect(location.hash).toBe('#test');
        delete window['cordova'];
    });

    it('should call window.open when hasCordova is false', () => {
        openLink('https://example.com');
        expect(window.open).toHaveBeenCalledWith('https://example.com', '_self');
    });

    it('should call window.open with custom target', () => {
        openLink('https://example.com', '_blank');
        expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank');
    });
});

describe('toPromise', () => {
    it('should return the input if it is already a Promise', async () => {
        const inputPromise = Promise.resolve('test');
        const result = toPromise(inputPromise);
        expect(result).toBe(inputPromise);
        await expect(result).resolves.toBe('test');
    });

    it('should wrap non-Promise value in a Promise', async () => {
        const input = 'test';
        const result = toPromise(input);
        expect(result instanceof Promise).toBe(true);
        await expect(result).resolves.toBe('test');
    });
});

describe('removeExtraSlashes', () => {
    test('should remove extra slashes from URL', () => {
        const url = 'http://example.com//path///to//resource';
        expect(removeExtraSlashes(url)).toBe('http://example.com/path/to/resource');
    });

    test('should not modify file:/// URLs', () => {
        const url = 'file:///path/to/file';
        expect(removeExtraSlashes(url)).toBe('file:///path/to/file');
    });

    test('should not modify base64 image URLs', () => {
        const url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
        expect(removeExtraSlashes(url)).toBe(url);
    });

    test('should handle non-string input', () => {
        const nonString = 123;
        expect(removeExtraSlashes(nonString)).toBeUndefined();
    });

    test('should handle empty string', () => {
        expect(removeExtraSlashes('')).toBe('');
    });
});


describe('triggerItemAction', () => {
    let mockScope: any;
    let mockItem: any;

    beforeEach(() => {
        mockScope = {
            itemActionFn: undefined,
            userDefinedExecutionContext: {},
            route: {
                navigate: jest.fn(),
            },
        };
        mockItem = {
            link: '',
            action: '',
            target: '',
        };
        jest.clearAllMocks();
    });

    test('should call itemActionFn when action is provided', () => {
        mockItem.action = 'someAction';
        mockScope.itemActionFn = jest.fn();

        triggerItemAction(mockScope, mockItem);

        expect(mockScope.itemActionFn).toHaveBeenCalledWith(
            mockScope.userDefinedExecutionContext,
            expect.any(Object)
        );
    });

    test('should navigate using router when link starts with "#/" and target is "_self"', () => {
        mockItem.link = '#/some/route?param1=value1';
        mockItem.target = '_self';

        triggerItemAction(mockScope, mockItem);

        expect(mockScope.route.navigate).toHaveBeenCalledWith(
            ['/some/route'],
            { queryParams: { param1: 'value1' } }
        );
    });
    test('should use menuRef.route if scope.route is not available', () => {
        mockItem.link = '#/some/route';
        mockItem.target = '_self';
        mockScope.route = undefined;
        mockScope.menuRef = {
            route: {
                navigate: jest.fn(),
            },
        };
        triggerItemAction(mockScope, mockItem);
        expect(mockScope.menuRef.route.navigate).toHaveBeenCalledWith(
            ['/some/route'],
            { queryParams: {} }
        );
    });
});


describe('getDatasourceFromExpr', () => {
    let mockScope: any;

    beforeEach(() => {
        mockScope = {
            viewParent: {
                Variables: {
                    staticVar1: {
                        dataSet: {
                            details: [
                                { addresses: [] }
                            ]
                        }
                    }
                },
                Widgets: {
                    list1: {
                        $attrs: new Map(),
                        binddataset: 'Variables.staticVar1.dataSet.details',
                        datasource: null
                    }
                }
            }
        };
    });

    test('should return datasource for expression bound to Variables', () => {
        const expr = 'Variables.staticVar1.dataSet.details[$i].addresses';
        const result = getDatasourceFromExpr(expr, mockScope);
        expect(result).toBe(mockScope.viewParent.Variables.staticVar1);
    });
    test('should return undefined for invalid expressions', () => {
        const expr = 'InvalidExpression.something';
        const result = getDatasourceFromExpr(expr, mockScope);
        expect(result).toBeUndefined();
    });

    test('should handle expressions not starting with Variables or Widgets', () => {
        const expr = 'someOtherExpression.property';
        const result = getDatasourceFromExpr(expr, mockScope);
        expect(result).toBeUndefined();
    });
});


describe('extractCurrentItemExpr', () => {
    let mockScope;
    beforeEach(() => {
        mockScope = {
            viewParent: {
                Widgets: {
                    list1: {
                        $attrs: new Map(),
                        datasource: null,
                        binddataset: '',
                    },
                },
            },
        };
    });

    it('should return the original expression if it does not match the currentItem pattern', () => {
        const expr = 'Variables.someVar.someProperty';
        const result = extractCurrentItemExpr(expr, mockScope);
        expect(result).toBe(expr);
    });

    it('should replace currentItem with datasetboundexpr when datasource is null', () => {
        const expr = 'Widgets.list1.currentItem.details';
        mockScope.viewParent.Widgets.list1.$attrs.set('datasetboundexpr', 'Variables.staticVar1.dataSet');
        const result = extractCurrentItemExpr(expr, mockScope);
        expect(result).toBe('Variables.staticVar1.dataSet[$i].details');
    });

    it('should replace currentItem with binddataset when datasource is not null', () => {
        const expr = 'Widgets.list1.currentItem.details';
        mockScope.viewParent.Widgets.list1.datasource = {};
        mockScope.viewParent.Widgets.list1.binddataset = 'Variables.dynamicVar1.dataSet';
        const result = extractCurrentItemExpr(expr, mockScope);
        expect(result).toBe('Variables.dynamicVar1.dataSet[$i].details');
    });
});


describe('findViewParent', () => {
    it('should return lView[15][8] when lView[15] exists', () => {
        const mockLView = {
            15: {
                8: 'parentView'
            }
        };
        expect(findViewParent(mockLView)).toBe('parentView');
    });

    it('should return undefined when lView[15] does not exist', () => {
        const mockLView = {};
        expect(findViewParent(mockLView)).toBeUndefined();
    });
});

describe('findParent', () => {
    it('should return the result of findViewParent when it is truthy', () => {
        const mockLView = {
            15: {
                8: 'parentView'
            }
        };
        expect(findParent(mockLView)).toBe('parentView');
    });

    it('should return viewParentApp when findViewParent returns falsy', () => {
        const mockLView = {};
        const mockViewParentApp = 'viewParentApp';
        expect(findParent(mockLView, mockViewParentApp)).toBe(mockViewParentApp);
    });

    it('should return undefined when findViewParent returns falsy and viewParentApp is not provided', () => {
        const mockLView = {};
        expect(findParent(mockLView)).toBeUndefined();
    });
});


describe('WM Project Properties', () => {
    let originalWindow: any;

    beforeEach(() => {
        // Store the original window object
        originalWindow = (global as any).window;
        // Create a mock window object
        (global as any).window = {} as any;
    });

    afterEach(() => {
        // Restore the original window object
        (global as any).window = originalWindow;
    });

    describe('getWmProjectProperties', () => {
        it('should return window._WM_APP_PROPERTIES when it exists', () => {
            const mockProperties = { key: 'value' };
            (global as any).window._WM_APP_PROPERTIES = mockProperties;

            const result = getWmProjectProperties();

            expect(result).toBe(mockProperties);
        });

        it('should return an empty object when window._WM_APP_PROPERTIES does not exist', () => {
            const result = getWmProjectProperties();

            expect(result).toEqual({});
        });
    });

    describe('setWmProjectProperties', () => {
        it('should set the prototype of the properties object', () => {
            const mockProps = { key: 'value' };

            setWmProjectProperties(mockProps);

            const result = getWmProjectProperties();
            expect(Object.getPrototypeOf(result)).toBe(mockProps);
        });

    });
});