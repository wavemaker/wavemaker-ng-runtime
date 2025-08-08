import {ComponentFixture, waitForAsync} from '@angular/core/testing';
import {Component, OnInit, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {TypeaheadModule} from 'ngx-bootstrap/typeahead';
import {DatePipe} from '@angular/common';
import {$unwatch, $watch, AbstractI18nService, App, AppDefaults, isAppleProduct, PartialRefProvider} from '@wm/core';
import {ChipsComponent} from './chips.component';
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from '../../../../base/src/test/common-widget.specs';
import {compileTestComponent, mockApp} from '../../../../base/src/test/util/component-test-util';
import {DataSetItem, TextContentDirective, ToDatePipe} from '@wm/components/base';
import {SearchComponent} from '@wm/components/basic/search';
import {MockAbstractI18nService} from '../../../../base/src/test/util/date-test-util';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    isAppleProduct: jest.fn(),
    $unwatch: jest.fn(),
    $watch: jest.fn()
}));

const markup = `<ul wmChips name="chips1" readonly="false" class= "text-success" show="true" width="800" height="200" backgroundcolor="#00ff29"
                    placeholder="" tabindex="0" overflow="auto"></ul>`; // placeholder and tabindex are not working because .bind is not working
@Component({
    template: markup
})
class ChipsWrapperComponent implements OnInit {
    @ViewChild(ChipsComponent, /* TODO: add static flag */ { static: true }) wmComponent: ChipsComponent;
    public testdata: any = [{ name: 'Peter', age: 21 }, { name: 'Tony', age: 42 }, { name: 'John', age: 25 }, { name: 'Peter Son', age: 28 }];
    ngOnInit() {
        setTimeout(() => {
            (this.wmComponent.searchComponent as any).placeholder = 'updated';
        });
    }

}
const testModuleDef: ITestModuleDef = {
    imports: [
        FormsModule,
        TypeaheadModule.forRoot(),
        ChipsComponent, SearchComponent
    ],
    declarations: [ChipsWrapperComponent],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AppDefaults, useClass: AppDefaults },
        { provide: PartialRefProvider, useClass: PartialRefProvider },
        { provide: AbstractI18nService, useClass: MockAbstractI18nService },
        TextContentDirective
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-chips',
    widgetSelector: '[wmChips]',
    inputElementSelector: 'input.app-search-input',
    testModuleDef: testModuleDef,
    testComponent: ChipsWrapperComponent
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
// TestBase.verifyPropsInitialization();  /* to be fixed for readonly issue */
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();

describe('wm-chips: Component Specific Tests', () => {
    let wrapperComponent: ChipsWrapperComponent;
    let wmComponent: ChipsComponent;
    let fixture: ComponentFixture<ChipsWrapperComponent>;
    let getwmSearchEle = () => {
        return fixture.debugElement.query(By.css('[wmSearch]'));
    };
    beforeEach(async () => {
        fixture = compileTestComponent(testModuleDef, ChipsWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        wmComponent = wrapperComponent.wmComponent;
        fixture.detectChanges();
    });

    it('should create chips component', () => {
        expect(wrapperComponent).toBeTruthy();
    });
    it('should add chip item', (done) => {
        const testValue = 'Option 3';
        addItem(testValue, 'keyup').then(() => {
            done();
            expect(wmComponent.chipsList.length).toEqual(1);
        });
    });
    it('should add custom chip item', (done) => {
        const testValue = 'Option 4';
        addItem(testValue, 'keydown').then(() => {
            done();
            expect(wmComponent.chipsList.length).toEqual(1);
        });
    });

    /* ****************************************** TestCase for "CONTAINS" match mode ********************************************** */
    it('should add chipitems with "CONTAINS" matchmode', waitForAsync(() => {
        applyMatchMode('anywhere', 'Option 2', 'option 2');
    }))

    it('should add chipitems with "CONTAINS" matchmode with search key', waitForAsync(() => {
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.getWidget().displayfield = 'name';
        // Setting searchkey property manually on search because .bind is not working
        getwmSearchEle().componentInstance.getWidget().searchkey = 'name';
        fixture.detectChanges();
        applyMatchMode('anywhere', 'Tony', 'tony');
    }));

    /* ****************************************** TestCase for "CONTAINS_IGNORE_CASE" match mode *********************************** */
    it('should add chipitems with "CONTAINS_IGNORE_CASE" matchmode', (done) => {
        applyIgnoreCaseMatchMode('anywhereignorecase', 'Option 2', 'option 2', done);
    });
    it('should add chipitems with "CONTAINS_IGNORE_CASE" matchmode with search key', (done) => {
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.getWidget().displayfield = 'name';
        // Setting searchkey property manually on search because .bind is not working
        getwmSearchEle().componentInstance.getWidget().searchkey = 'name';
        fixture.detectChanges();
        applyIgnoreCaseMatchMode('anywhereignorecase', 'Tony', 'tony', done);
    });

    /* ****************************************** TestCase for "STARTS_WITH" match mode ******************************************** */
    it('should add chipitems with "STARTS_WITH" matchmode', waitForAsync(() => {
        applyMatchMode('start', 'Option 2', 'option 2');
    }))
    it('should add chipitems with "STARTS_WITH" matchmode with search key', waitForAsync(() => {
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.getWidget().displayfield = 'name';
        // Setting searchkey property manually on search because .bind is not working
        getwmSearchEle().componentInstance.getWidget().searchkey = 'name';
        fixture.detectChanges();
        applyMatchMode('start', 'Tony', 'tony');
    }));

    /* ****************************************** TestCase for "STARTS_WITH_IGNORE_CASE" match mode ********************************** */
    it('should add chipitems with "STARTS_WITH_IGNORE_CASE" matchmode', (done) => {
        applyIgnoreCaseMatchMode('startignorecase', 'Option 2', 'option 2', done);
    });
    it('should add chipitems with "STARTS_WITH_IGNORE_CASE" matchmode with search key', (done) => {
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.getWidget().displayfield = 'name';
        // Setting searchkey property manually on search because .bind is not working
        getwmSearchEle().componentInstance.getWidget().searchkey = 'name';
        fixture.detectChanges();
        applyIgnoreCaseMatchMode('startignorecase', 'Tony', 'tony', done);
    });

    /* ****************************************** TestCase for "ENDS_WITH" match mode ************************************************ */
    it('should add chipitems with "ENDS_WITH" matchmode', waitForAsync(() => {
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        fixture.detectChanges();
        applyMatchMode('end', 'script', 'Script');
    }));

    it('should add chipitems with "ENDS_WITH" matchmode with search key', waitForAsync(() => {
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.getWidget().displayfield = 'name';
        // Setting searchkey property manually on search because .bind is not working
        getwmSearchEle().componentInstance.getWidget().searchkey = 'name';
        fixture.detectChanges();
        applyMatchMode('end', 'Son', 'son');
    }));

    /* ****************************************** TestCase for "ENDS_WITH_IGNORE_CASE" match mode ************************************* */
    it('should add chipitems with "ENDS_WITH_IGNORE_CASE" matchmode', (done) => {
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        fixture.detectChanges();
        applyIgnoreCaseMatchMode('endignorecase', 'script', 'Script', done);
    });
    it('should add chipitems with "ENDS_WITH_IGNORE_CASE" matchmode with search key', (done) => {
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.getWidget().displayfield = 'name';
        // Setting searchkey property manually on search because .bind is not working
        getwmSearchEle().componentInstance.getWidget().searchkey = 'name';
        fixture.detectChanges();
        applyIgnoreCaseMatchMode('endignorecase', 'Son', 'son', done);
    });

    /* ****************************************** TestCase for "IS_EQUAL" match mode ************************************************** */
    it('should add chipitems with "IS_EQUAL" matchmode', waitForAsync(() => {
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        fixture.detectChanges();
        applyMatchMode('exact', 'java', 'Java');
    }));
    it('should add chipitems with "IS_EQUAL" matchmode with search key', waitForAsync(() => {
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.getWidget().displayfield = 'name';
        // Setting searchkey property manually on search because .bind is not working
        getwmSearchEle().componentInstance.getWidget().searchkey = 'name';
        fixture.detectChanges();
        applyMatchMode('exact', 'Peter', 'peter');
    }));

    /* ****************************************** TestCase for "IS_EQUAL_WITH_IGNORE_CASE" match mode ********************************** */
    it('should add chipitems with "IS_EQUAL_WITH_IGNORE_CASE" matchmode', (done) => {
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        fixture.detectChanges();
        applyIgnoreCaseMatchMode('exactignorecase', 'java', 'Java', done);
    });

    it('should add chipitems with "IS_EQUAL_WITH_IGNORE_CASE" matchmode with search key', (done) => {
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.getWidget().displayfield = 'name';
        // Setting searchkey property manually on search because .bind is not working
        getwmSearchEle().componentInstance.getWidget().searchkey = 'name';
        fixture.detectChanges();
        applyIgnoreCaseMatchMode('exactignorecase', 'Peter', 'peter', done);
    });


    it('should delete chip item', async () => {
        const testValue = 'Option 3';
        addItem(testValue, 'keyup').then(async () => {
            expect(wmComponent.chipsList.length).toEqual(1);
            const chipItem = wmComponent.chipsList[0];
            chipItem.removeChipItem();
            fixture.detectChanges();
            await fixture.whenStable();
            expect(wmComponent.chipsList.length).toEqual(0);
        });
    });

    it('should trigger onArrowLeft when left arrow key is pressed', () => {
        wmComponent.readonly = true;
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        fixture.detectChanges();
        jest.spyOn(wmComponent, 'onArrowLeft');
        const chipItem = fixture.debugElement.query(By.css('.app-chip-input'));
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        chipItem.nativeElement.dispatchEvent(event);
        expect(wmComponent.onArrowLeft).toHaveBeenCalled();
    });

    it('should trigger onArrowRight when right arrow key is pressed', () => {
        wmComponent.readonly = true;
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        fixture.detectChanges();
        jest.spyOn(wmComponent, 'onArrowRight');
        const chipItem = fixture.debugElement.query(By.css('.app-chip-input'));
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        chipItem.nativeElement.dispatchEvent(event);
        expect(wmComponent.onArrowRight).toHaveBeenCalled();
    });

    it('should trigger onBackspace when backspace key is pressed', () => {
        wmComponent.readonly = true;
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        fixture.detectChanges();
        const chipItem = fixture.debugElement.query(By.css('.app-chip-input'));
        const event = new KeyboardEvent('keydown', { key: 'Backspace' });
        chipItem.nativeElement.dispatchEvent(event);
    });

    it('should trigger onArrowLeft when search input query is empty', () => {
        wmComponent.readonly = false;
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        fixture.detectChanges();
        jest.spyOn(wmComponent, 'onArrowLeft');
        const chipItem = fixture.debugElement.query(By.css('.app-chip-input'));
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        chipItem.nativeElement.dispatchEvent(event);
        expect(wmComponent.onArrowLeft).toHaveBeenCalled();
    });

    it('should trigger onArrowRight when search input query is empty', () => {
        wmComponent.readonly = false;
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        fixture.detectChanges();
        const chipItem = fixture.debugElement.query(By.css('.app-chip-input'));
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        chipItem.nativeElement.dispatchEvent(event);
    });

    it('should set displayfield', () => {
        wmComponent.getWidget().displayfield = 'java, javascript, mongoDB';
        fixture.detectChanges();
        expect(wmComponent.getWidget().displayfield).toEqual('java, javascript, mongoDB');
    });

    it('should limit the number of chips', () => {
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        wmComponent.getWidget().limit = 2;
        fixture.detectChanges();
        const testValue = 'java';
        addItem(testValue, 'keydown').then(() => {
            expect(wmComponent.chipsList.length).toEqual(1);
        });
    });

    it('should set readonly property', () => {
        wmComponent.readonly = true;
        fixture.detectChanges();
        expect(wmComponent.readonly).toBeTruthy();
    });

    it('should enable order property', () => {
        wmComponent.enablereorder = true;
        fixture.detectChanges();
        expect(wmComponent.enablereorder).toBeTruthy();
    });

    it('should set displayimagesrc property', () => {
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        wmComponent.getWidget().displayimagesrc = 'https://www.w3schools.com/howto/img_avatar.png';
        fixture.detectChanges();
        expect(wmComponent.getWidget().displayimagesrc).toEqual('https://www.w3schools.com/howto/img_avatar.png');
    });

    it('should set displayexpression property', () => {
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        wmComponent.getWidget().displayexpression = 'java';
        fixture.detectChanges();
        expect(wmComponent.getWidget().displayexpression).toEqual('java');
    });

    it('should set datafield property', () => {
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        wmComponent.getWidget().datafield = 'java';
        fixture.detectChanges();
        expect(wmComponent.getWidget().datafield).toEqual('java');
    });

    it('should set dataoptions property', () => {
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        wmComponent.getWidget().dataoptions = 'java';
        fixture.detectChanges();
        expect(wmComponent.getWidget().dataoptions).toEqual('java');
    });

    it('should set groupby property', () => {
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        wmComponent.getWidget().groupby = 'chips1groupby(row)';
        fixture.detectChanges();
        expect(wmComponent.getWidget().groupby).toEqual('chips1groupby(row)');
    });


    it('should onTextDelete when delete key is pressed', () => {
        wmComponent.readonly = true;
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        fixture.detectChanges();
        jest.spyOn(wmComponent, 'onTextDelete');
        const chipItem = fixture.debugElement.query(By.css('.app-chip-input'));
        const event = new KeyboardEvent('keydown', { key: 'Delete' });
        chipItem.nativeElement.dispatchEvent(event);
        expect(wmComponent.onTextDelete).toHaveBeenCalled();
    });


    describe('onTextDelete', () => {
        it('should call onInputClear when on Apple product', () => {
            const mockEvent = new Event('keydown');
            (isAppleProduct as unknown as jest.Mock).mockReturnValue(true);
            jest.spyOn(wmComponent, 'onInputClear');

            wmComponent.onTextDelete(mockEvent);

            expect(wmComponent.onInputClear).toHaveBeenCalledWith(mockEvent);
        });
    });

    describe('onInputClear', () => {
        it('should focus on last chip when conditions are met', () => {
           const mockEvent = {
                target: { value: 'chip text' },
                stopPropagation: jest.fn(),
                preventDefault: jest.fn()
            } as unknown as KeyboardEvent;
            wmComponent.chipsList = [{}, {}];
            wmComponent.searchComponent = { query: '' } as any;
            const lastChipMock = { focus: jest.fn() };
            jest.spyOn($.fn, 'last').mockReturnValue(lastChipMock as any);
            jest.spyOn(wmComponent, 'stopEvent');

            wmComponent.onInputClear(mockEvent);

            expect(lastChipMock.focus).toHaveBeenCalled();
            expect(wmComponent.stopEvent).toHaveBeenCalledWith(mockEvent);
        });

        it('should not focus when conditions are not met', () => {
            const mockEvent = new Event('keydown');
            wmComponent.chipsList = [];
            wmComponent.searchComponent = { query: 'test' } as any;
            const lastChipMock = { focus: jest.fn() };
            jest.spyOn($.fn, 'last').mockReturnValue(lastChipMock as any);
            jest.spyOn(wmComponent, 'stopEvent');

            wmComponent.onInputClear(mockEvent);

            expect(lastChipMock.focus).not.toHaveBeenCalled();
            expect(wmComponent.stopEvent).not.toHaveBeenCalled();
        });
    });
    describe('onBackspace', () => {
        it('should call removeItem when not readonly', () => {
            const mockEvent = new Event('keydown');
            const mockItem = {} as DataSetItem;
            wmComponent.readonly = false;
            jest.spyOn(wmComponent as any, 'removeItem');

            (wmComponent as any).onBackspace(mockEvent, mockItem, 0);

            expect(wmComponent['removeItem']).toHaveBeenCalledWith(mockEvent, mockItem, 0, true);
        });

        it('should not call removeItem when readonly', () => {
            const mockEvent = new Event('keydown');
            const mockItem = {} as DataSetItem;
            wmComponent.readonly = true;
            jest.spyOn(wmComponent as any, 'removeItem');

            (wmComponent as any).onBackspace(mockEvent, mockItem, 0);

            expect(wmComponent['removeItem']).not.toHaveBeenCalled();
        });
    });

    describe('onDelete', () => {
        it('should call removeItem when not readonly', () => {
            const mockEvent = new Event('keydown');
            const mockItem = {} as DataSetItem;
            wmComponent.readonly = false;
            jest.spyOn(wmComponent as any, 'removeItem');

            (wmComponent as any).onDelete(mockEvent, mockItem, 0);

            expect(wmComponent['removeItem']).toHaveBeenCalledWith(mockEvent, mockItem, 0);
        });

        it('should not call removeItem when readonly', () => {
            const mockEvent = new Event('keydown');
            const mockItem = {} as DataSetItem;
            wmComponent.readonly = true;
            jest.spyOn(wmComponent as any, 'removeItem');

            (wmComponent as any).onDelete(mockEvent, mockItem, 0);

            expect(wmComponent['removeItem']).not.toHaveBeenCalled();
        });
    });

    describe('handleChipClick', () => {
        it('should focus on the clicked chip and invoke chipclick callback when not readonly', () => {
            const mockEvent = { currentTarget: { focus: jest.fn() } } as any;
            const mockChip = {} as DataSetItem;
            wmComponent.readonly = false;
            jest.spyOn(wmComponent as any, 'invokeEventCallback');

            (wmComponent as any).handleChipClick(mockEvent, mockChip);

            expect(mockEvent.currentTarget.focus).toHaveBeenCalled();
            expect(wmComponent['invokeEventCallback']).toHaveBeenCalledWith('chipclick', {
                $event: mockEvent,
                $item: mockChip
            });
        });

        it('should not focus or invoke callback when readonly', () => {
            const mockEvent = { currentTarget: { focus: jest.fn() } } as any;
            const mockChip = {} as DataSetItem;
            wmComponent.readonly = true;
            jest.spyOn(wmComponent as any, 'invokeEventCallback');

            (wmComponent as any).handleChipClick(mockEvent, mockChip);

            expect(mockEvent.currentTarget.focus).not.toHaveBeenCalled();
            expect(wmComponent['invokeEventCallback']).not.toHaveBeenCalled();
        });
    });

    describe('handleChipFocus', () => {
        it('should set chip as active and invoke chipselect callback when not readonly', () => {
            const mockEvent = {} as Event;
            const mockChip = {} as any;
            wmComponent.readonly = false;
            jest.spyOn(wmComponent as any, 'invokeEventCallback');

            (wmComponent as any).handleChipFocus(mockEvent, mockChip);

            expect(mockChip.active).toBe(true);
            expect(wmComponent['invokeEventCallback']).toHaveBeenCalledWith('chipselect', {
                $event: mockEvent,
                $item: mockChip
            });
        });

        it('should not set chip as active or invoke callback when readonly', () => {
            const mockEvent = {} as Event;
            const mockChip = {} as any;
            wmComponent.readonly = true;
            jest.spyOn(wmComponent as any, 'invokeEventCallback');

            (wmComponent as any).handleChipFocus(mockEvent, mockChip);

            expect(mockChip.active).toBeUndefined();
            expect(wmComponent['invokeEventCallback']).not.toHaveBeenCalled();
        });
    });

    describe('updateQueryModel', () => {
        it('should clear chipsList when data is null', async () => {
            wmComponent.chipsList = [{ label: 'Test', value: 'test' }];
            await wmComponent['updateQueryModel'](null);
            expect(wmComponent.chipsList).toEqual([]);
        });

        it('should update chipsList based on datasetItems', async () => {
            wmComponent.datasetItems = [
                {
                    label: 'Item 1', value: 'item1',
                    key: 'Item 1'
                },
                {
                    label: 'Item 2', value: 'item2',
                    key: 'Item 2'
                }
            ];
            await wmComponent['updateQueryModel'](['item1', 'item2']);
            expect(wmComponent.chipsList).toEqual(wmComponent.datasetItems);
        });

        it('should limit chipsList to maxsize', async () => {
            wmComponent.maxsize = 2;
            wmComponent.datasetItems = [
                {
                    label: 'Item 1', value: 'item1',
                    key: 'Item 1'
                },
                {
                    label: 'Item 2', value: 'item2',
                    key: 'Item 2'
                },
                {
                    label: 'Item 3', value: 'item3',
                    key: 'Item 3'
                }
            ];
            await wmComponent['updateQueryModel'](['item1', 'item2', 'item3']);
            expect(wmComponent.chipsList.length).toBe(2);
        });

        it('should make default query for non-existing values', async () => {
            wmComponent.datafield = 'someField';
            wmComponent['getDefaultModel'] = jest.fn().mockResolvedValue([{ label: 'New Item', value: 'newItem' }]);
            await wmComponent['updateQueryModel'](['newItem']);
            expect(wmComponent['getDefaultModel']).toHaveBeenCalledWith(['newItem'], expect.any(Number));
            expect(wmComponent.chipsList[0]).toEqual({ label: 'New Item', value: 'newItem' });
        });
    });

    describe('getDefaultModel', () => {
        beforeEach(() => {
            (wmComponent as any).searchComponent = {
                getDataSource: jest.fn()
            };
        });

        it('should increment nextItemIndex', async () => {
            const initialIndex = wmComponent['nextItemIndex'];
            (wmComponent as any)['searchComponent'].getDataSource.mockResolvedValue([]);
            await wmComponent['getDefaultModel'](['test']);
            expect(wmComponent['nextItemIndex']).toBe(initialIndex + 1);
        });

        it('should call searchComponent.getDataSource with correct parameters', async () => {
            const query = ['test'];
            const index = 1;
            (wmComponent as any)['searchComponent'].getDataSource.mockResolvedValue([]);
            await wmComponent['getDefaultModel'](query, index);
            expect(wmComponent['searchComponent'].getDataSource).toHaveBeenCalledWith(query, true, index);
        });

        it('should filter the response based on the query', async () => {
            const query = ['item1', 'item2'];
            const mockResponse = [{ value: 'item1' }, { value: 'item3' }];
            (wmComponent as any)['searchComponent'].getDataSource.mockResolvedValue(mockResponse);
            const result = await wmComponent['getDefaultModel'](query);
            expect(result).toEqual([]);
        });
    });

    describe('createCustomDataModel', () => {
        it('should create a custom object with displayfield as key', () => {
            wmComponent.displayfield = 'name';
            const result = wmComponent['createCustomDataModel']('John');
            expect(result).toEqual({ name: 'John' });
        });

        it('should create a custom object with datafield as key when displayfield is not set', () => {
            wmComponent.displayfield = '';
            wmComponent.datafield = 'username';
            const result = wmComponent['createCustomDataModel']('john_doe');
            expect(result).toEqual({ username: 'john_doe' });
        });
    });


    describe('swapElementsInArray', () => {
        it('should swap elements in the array', () => {
            const data = ['a', 'b', 'c', 'd'];
            wmComponent['swapElementsInArray'](data, 2, 0);
            expect(data).toEqual(['b', 'c', 'a', 'd']);
        });

        it('should handle swapping to the end of the array', () => {
            const data = ['a', 'b', 'c', 'd'];
            wmComponent['swapElementsInArray'](data, 3, 1);
            expect(data).toEqual(['a', 'c', 'd', 'b']);
        });
    });

    describe('invokeOnBeforeServiceCall', () => {
        it('should invoke beforeservicecall event with inputData', () => {
            wmComponent.invokeEventCallback = jest.fn();
            const inputData = { test: 'data' };
            wmComponent['invokeOnBeforeServiceCall'](inputData);
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('beforeservicecall', { inputData });
        });
    });

    describe('handleEvent', () => {
        it('should not call super.handleEvent for specific events', () => {
            const superHandleEvent = jest.spyOn(Object.getPrototypeOf(ChipsComponent.prototype), 'handleEvent');
            const node = document.createElement('div');
            const eventCallback = jest.fn();
            const locals = {};

            ['remove', 'beforeremove', 'chipselect', 'chipclick', 'add', 'reorder', 'change'].forEach(eventName => {
                (wmComponent as any).handleEvent(node, eventName, eventCallback, locals);
                expect(superHandleEvent).not.toHaveBeenCalled();
            });
        });

        it('should call super.handleEvent for other events', () => {
            const superHandleEvent = jest.spyOn(Object.getPrototypeOf(ChipsComponent.prototype), 'handleEvent');
            const node = document.createElement('div');
            const eventCallback = jest.fn();
            const locals = {};
            (wmComponent as any).handleEvent(node, 'click', eventCallback, locals);
            expect(superHandleEvent).toHaveBeenCalledWith(node, 'click', eventCallback, locals);
        });
    });

    describe('resetReorder', () => {
        it('should remove oldIndex data from $element', () => {
            const removeDataMock = jest.fn();
            Object.defineProperty(wmComponent, '$element', {
                get: () => ({ removeData: removeDataMock })
            });
            wmComponent['resetReorder']();
            expect(removeDataMock).toHaveBeenCalledWith('oldIndex');
        });
    });

    describe('onReorderStart', () => {
        it('should set oldIndex data and adjust helper width', () => {
            const dataMock = jest.fn();
            Object.defineProperty(wmComponent, '$element', {
                get: () => ({ data: dataMock })
            });
            (wmComponent as any).inputposition = 'first';
            const evt = {} as Event;
            const ui = {
                helper: {
                    width: jest.fn().mockReturnValue(100)
                },
                item: {
                    index: jest.fn().mockReturnValue(2)
                }
            };
            wmComponent['onReorderStart'](evt, ui);
            expect(ui.helper.width).toHaveBeenCalledWith(101);
            expect(dataMock).toHaveBeenCalledWith('oldIndex', 1);
        });

        it('should handle inputposition not being first', () => {
            const dataMock = jest.fn();
            Object.defineProperty(wmComponent, '$element', {
                get: () => ({ data: dataMock })
            });
            (wmComponent as any).inputposition = 'last';
            const evt = {} as Event;
            const ui = {
                helper: {
                    width: jest.fn().mockReturnValue(100)
                },
                item: {
                    index: jest.fn().mockReturnValue(2)
                }
            };
            wmComponent['onReorderStart'](evt, ui);
            expect(dataMock).toHaveBeenCalledWith('oldIndex', 2);
        });
    });


    describe('update', () => {
        let mockEvent: Event;
        let mockUi: { item: { index: jest.Mock } };

        beforeEach(() => {
            mockEvent = {} as Event;
            mockUi = { item: { index: jest.fn() } };
            wmComponent.chipsList = ['item1', 'item2', 'item3'];
            wmComponent._modelByValue = ['value1', 'value2', 'value3'];
            (wmComponent as any).inputposition = 'first';
            wmComponent['resetReorder'] = jest.fn();
            wmComponent['swapElementsInArray'] = jest.fn();
            wmComponent.invokeEventCallback = jest.fn();

            Object.defineProperty(wmComponent, '$element', {
                get: () => ({ data: jest.fn().mockReturnValue(1) }) // oldIndex
            });
        });

        it('should do nothing if newIndex equals oldIndex', () => {
            mockUi.item.index.mockReturnValue(2); // newIndex will be 1 after adjustment
            wmComponent['update'](mockEvent, mockUi);
            expect(wmComponent['resetReorder']).toHaveBeenCalled();
            expect(wmComponent['swapElementsInArray']).not.toHaveBeenCalled();
        });

        it('should update chipsList and _modelByValue when reordering', () => {
            mockUi.item.index.mockReturnValue(3); // newIndex will be 2 after adjustment
            wmComponent['update'](mockEvent, mockUi);
            expect(wmComponent['swapElementsInArray']).toHaveBeenCalledTimes(2);
            expect(wmComponent['swapElementsInArray']).toHaveBeenCalledWith(wmComponent.chipsList, 2, 1);
            expect(wmComponent['swapElementsInArray']).toHaveBeenCalledWith(wmComponent._modelByValue, 2, 1);
        });

        it('should handle reordering to the end of the list', () => {
            mockUi.item.index.mockReturnValue(4); // equal to chipsList.length + 1
            wmComponent['update'](mockEvent, mockUi);
            expect(wmComponent['swapElementsInArray']).toHaveBeenCalledWith(wmComponent.chipsList, 2, 1);
        });

        it('should invoke beforereorder and reorder callbacks', () => {
            mockUi.item.index.mockReturnValue(3);
            wmComponent['update'](mockEvent, mockUi);
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('beforereorder', expect.any(Object));
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('reorder', expect.any(Object));
        });

        it('should not reorder if beforereorder returns false', () => {
            mockUi.item.index.mockReturnValue(3);
            (wmComponent.invokeEventCallback as jest.Mock).mockReturnValueOnce(false);
            wmComponent['update'](mockEvent, mockUi);
            expect(wmComponent['resetReorder']).toHaveBeenCalled();
            expect(wmComponent['swapElementsInArray']).not.toHaveBeenCalled();
        });

        it('should handle inputposition being "last"', () => {
            (wmComponent as any).inputposition = 'last';
            mockUi.item.index.mockReturnValue(2); // newIndex will be 2 (no adjustment)
            wmComponent['update'](mockEvent, mockUi);
            expect(wmComponent['swapElementsInArray']).toHaveBeenCalledWith(wmComponent.chipsList, 2, 1);
        });
    });

    describe('onPropertyChange', () => {
        const mockJQueryObject = {
            addClass: jest.fn(),
            removeClass: jest.fn(),
            on: jest.fn(),
            off: jest.fn()
        };
        beforeEach(() => {
            jest.clearAllMocks();

            // Mock the $element property
            Object.defineProperty(wmComponent, '$element', {
                get: jest.fn().mockReturnValue({
                    hasClass: jest.fn(),
                    addClass: jest.fn(),
                    removeClass: jest.fn(),
                    find: jest.fn().mockReturnValue(mockJQueryObject),
                    prepend: jest.fn(),
                    append: jest.fn(),
                    sortable: jest.fn()
                })
            });
        });

        it('should enable/disable sortable when enablereorder changes', () => {
            wmComponent.$element.hasClass.mockReturnValue(true);

            wmComponent.onPropertyChange('enablereorder', true, false);
            expect(wmComponent.$element.sortable).toHaveBeenCalledWith('option', 'disabled', false);
            expect(mockJQueryObject.removeClass).toHaveBeenCalledWith('no-drag');
            expect(mockJQueryObject.off).toHaveBeenCalledWith('dragstart');

            wmComponent.onPropertyChange('enablereorder', false, true);
            expect(wmComponent.$element.sortable).toHaveBeenCalledWith('option', 'disabled', true);
            expect(mockJQueryObject.addClass).toHaveBeenCalledWith('no-drag');
            expect(mockJQueryObject.on).toHaveBeenCalledWith('dragstart', expect.any(Function));
        });

        it('should call configureDnD when enablereorder is true and element is not sortable', () => {
            wmComponent.$element.hasClass.mockReturnValue(false);
            const configureDnDSpy = jest.spyOn((wmComponent as any), 'configureDnD').mockImplementation();

            wmComponent.onPropertyChange('enablereorder', true, false);

            expect(configureDnDSpy).toHaveBeenCalled();
            expect(mockJQueryObject.removeClass).toHaveBeenCalledWith('no-drag');
            expect(mockJQueryObject.off).toHaveBeenCalledWith('dragstart');

            configureDnDSpy.mockRestore();
        });

        it('should prevent drag when enablereorder is false', () => {
            wmComponent.$element.hasClass.mockReturnValue(true);
            const mockEvent = { preventDefault: jest.fn() };

            wmComponent.onPropertyChange('enablereorder', false, true);

            // Get the dragstart handler that was registered
            const dragStartHandler = mockJQueryObject.on.mock.calls[0][1];

            // Call the handler and verify it prevents default
            const result = dragStartHandler(mockEvent);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(result).toBe(false);
        });

        it('should add/remove readonly class when readonly changes', () => {
            wmComponent.onPropertyChange('readonly', true, false);
            expect(wmComponent.$element.addClass).toHaveBeenCalledWith('readonly');
            wmComponent.onPropertyChange('readonly', false, true);
            expect(wmComponent.$element.removeClass).toHaveBeenCalledWith('readonly');
        });

        it('should change input position when inputposition changes', () => {
            const mockInputEl = { length: 1 };
            wmComponent.$element.find.mockReturnValue(mockInputEl);
            wmComponent.onPropertyChange('inputposition', 'first', 'last');
            expect(wmComponent.$element.prepend).toHaveBeenCalledWith(mockInputEl);
            wmComponent.onPropertyChange('inputposition', 'last', 'first');
            expect(wmComponent.$element.append).toHaveBeenCalledWith(mockInputEl);
        });

        xit('should focus search box when autofocus is true', (done) => {
            const mockChipsList = { length: 1 };
            wmComponent.$element.find.mockReturnValue(mockChipsList);
            const focusSearchBoxSpy = jest.spyOn((wmComponent as any), 'focusSearchBox').mockImplementation();
            wmComponent.onPropertyChange('autofocus', true, false);
            setTimeout(() => {
                expect(focusSearchBoxSpy).toHaveBeenCalled();
                focusSearchBoxSpy.mockRestore();
                done();
            }, 0);
        });

        it('should call super.onPropertyChange', () => {
            const superSpy = jest.spyOn(Object.getPrototypeOf(ChipsComponent.prototype), 'onPropertyChange');
            wmComponent.onPropertyChange('someKey', 'newValue', 'oldValue');
            expect(superSpy).toHaveBeenCalledWith('someKey', 'newValue', 'oldValue');
            superSpy.mockRestore();
        });
    });

    describe('registerChipItemClass', () => {
        it('should register a watch when bindChipclass is defined', () => {
            const mockItem = { key: 'key1', value: 'value1', label: 'label1' };
            const mockIndex = 0;

            // Mock necessary properties
            Object.defineProperty(wmComponent, 'bindChipclass', {
                get: jest.fn(() => 'someExpression')
            });
            Object.defineProperty(wmComponent, 'widgetId', {
                get: jest.fn(() => 'testWidget')
            });

            // Reset mocks
            ($unwatch as jest.Mock).mockClear();
            ($watch as jest.Mock).mockClear();

            // Access private method
            const registerChipItemClass = (wmComponent as any).registerChipItemClass.bind(wmComponent);

            registerChipItemClass(mockItem, mockIndex);

            expect($unwatch).toHaveBeenCalledWith('testWidget_chipItemClass_0');
            expect($watch).toHaveBeenCalledWith(
                'someExpression',
                (wmComponent as any).viewParent,
                { item: mockItem, $index: mockIndex },
                expect.any(Function),
                'testWidget_chipItemClass_0'
            );
        });

        it('should not register a watch when bindChipclass is undefined', () => {
            const mockItem = { key: 'key1', value: 'value1', label: 'label1' };
            const mockIndex = 0;

            // Ensure bindChipclass is undefined
            Object.defineProperty(wmComponent, 'bindChipclass', {
                get: jest.fn(() => undefined)
            });

            // Reset mocks
            ($unwatch as jest.Mock).mockClear();
            ($watch as jest.Mock).mockClear();

            // Access private method
            const registerChipItemClass = (wmComponent as any).registerChipItemClass.bind(wmComponent);

            registerChipItemClass(mockItem, mockIndex);

            expect($unwatch).not.toHaveBeenCalled();
            expect($watch).not.toHaveBeenCalled();
        });
    });

    describe('applyItemClass', () => {
        it('should apply classes correctly', () => {
            const mockIndex = 0;
            const mockVal = { toRemove: 'class1 class2', toAdd: 'class3 class4' };
            const mockChipItem = {
                classList: {
                    remove: jest.fn(),
                    add: jest.fn()
                }
            };
            const mockNativeElement = {
                querySelectorAll: jest.fn().mockReturnValue({
                    item: jest.fn().mockReturnValue(mockChipItem)
                })
            };
            Object.defineProperty(wmComponent, 'nativeElement', {
                get: jest.fn(() => mockNativeElement)
            });
            (global as any).$ = jest.fn().mockReturnValue({
                removeClass: jest.fn().mockReturnThis(),
                addClass: jest.fn().mockReturnThis()
            });
            const applyItemClass = (wmComponent as any).applyItemClass.bind(wmComponent);
            applyItemClass(mockVal, mockIndex);
            expect(mockNativeElement.querySelectorAll).toHaveBeenCalledWith('.chip-item');
            expect((global as any).$).toHaveBeenCalledWith(mockChipItem);
            expect((global as any).$().removeClass).toHaveBeenCalledWith('class1 class2');
            expect((global as any).$().addClass).toHaveBeenCalledWith('class3 class4');
        });
    });

    async function applyIgnoreCaseMatchMode(matchMode: string, value1: string, value2: string, done: jest.DoneCallback) {
        try {
            wmComponent.setProperty('matchmode', matchMode);
            fixture.detectChanges();
            await fixture.whenStable();

            // Ensure the search component is initialized
            expect(wmComponent.searchComponent).toBeTruthy();

            // Set query value directly on the search component
            wmComponent.searchComponent.query = value1;
            fixture.detectChanges();
            await fixture.whenStable();

            // Manually trigger the addItem method instead of key events
            (wmComponent as any).addItem(new Event('keyup'));
            fixture.detectChanges();
            await fixture.whenStable();

            console.log(`After adding ${value1}, chipsList:`, wmComponent.chipsList);
            expect(wmComponent.chipsList.length).toEqual(1);

            // Set second value and add
            wmComponent.searchComponent.query = value2;
            fixture.detectChanges();
            await fixture.whenStable();

            // Manually trigger the addItem method for the second value
            (wmComponent as any).addItem(new Event('keyup'));
            fixture.detectChanges();
            await fixture.whenStable();

            console.log(`After adding ${value2}, chipsList:`, wmComponent.chipsList);
            expect(wmComponent.chipsList.length).toEqual(2);
            done();
        } catch (error) {
            console.error("Error in applyIgnoreCaseMatchMode:", error);
            done.fail(error);
        }
    }

    function applyMatchMode(matchMode: string, value1: string, value2: string) {
        return async () => {
            wmComponent.setProperty('matchmode', matchMode);
            fixture.detectChanges();
            console.log("Apply Match mode failure hit first")
            await addItem(value1, 'keyup');
            fixture.detectChanges();
            await fixture.whenStable();
            console.log(`After adding ${value1}, chipsList length: ${wmComponent.chipsList.length}`);
            expect(wmComponent.chipsList.length).toEqual(1);
            await addItem(value2, 'keydown');
            fixture.detectChanges();
            await fixture.whenStable();
            console.log(`After adding ${value2}, chipsList length: ${wmComponent.chipsList.length}`);
            expect(wmComponent.chipsList.length).toEqual(2);
        };
    }

    async function addItem(testValue: string, eventName: string) {
        // Set query directly on the search component
        wmComponent.searchComponent.query = testValue;
        fixture.detectChanges();
        await fixture.whenStable();

        // Manually trigger the component's addItem method
        (wmComponent as any).addItem(new Event(eventName));

        // Ensure Angular processes the event
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        return fixture.whenStable();
    }

});
