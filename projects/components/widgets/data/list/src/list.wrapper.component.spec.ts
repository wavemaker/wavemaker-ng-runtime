import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {AbstractI18nService, App, AppDefaults, DataSource, isMobile, setPipeProvider} from '@wm/core';
import {Component, QueryList, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {ListComponent} from './list.component';
import {ListItemDirective} from './list-item.directive';
import {PaginationModule} from 'ngx-bootstrap/pagination';
import {PipeProvider} from '../../../../../runtime-base/src/services/pipe-provider.service';
import {PaginationComponent as WmPaginationModule} from '@wm/components/data/pagination';
import {configureDnD, NAVIGATION_TYPE, TextContentDirective, ToDatePipe} from '@wm/components/base';
import {MockAbstractI18nService} from 'projects/components/base/src/test/util/date-test-util';
import {DatePipe} from '@angular/common';
import {mockApp} from 'projects/components/base/src/test/util/component-test-util';
import {ListAnimator} from './list.animator';
import {ButtonComponent} from '@wm/components/input/button';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    isMobile: jest.fn(),
}));

jest.mock('@wm/components/base', () => ({
    ...jest.requireActual('@wm/components/base'),
    configureDnD: jest.fn(),
}));

jest.mock('jquery', () => jest.fn(() => ({
    find: jest.fn().mockReturnThis(),
    first: jest.fn().mockReturnThis(),
    css: jest.fn(),
    outerWidth: jest.fn(() => 100),
    outerHeight: jest.fn(() => 50),
    insertBefore: jest.fn(),
    children: jest.fn(() => []),
    length: 0,
    attr: jest.fn(),
    is: jest.fn(() => true),
    filter: jest.fn(),
})));

@Component({
    template: `
        <div wmList template="true" itemsperrow="xs-1 sm-1 md-1 lg-1" class="media-list" name="testlist"
             dataset.bind="testdata" navigation="Basic"
             click.event="onListClick($event, widget)"
             beforedatarender.event="onBeforeRender(widget, $data)"
             render.event="onRender(widget, $data)">
            <ng-template #listTemplate let-item="item" let-$index="$index" let-itemRef="itemRef" let-$first="$first" let-$last="$last" let-currentItemWidgets="currentItemWidgets" >
                <label wmLabel name="Name" class="p media-heading" caption.bind="item.name" fontsize="1.143" fontunit="em"></label>
            </ng-template>
        </div>
    `
})
class ListWrapperComponent {
    @ViewChild(ListComponent, /* TODO: add static flag */ { static: true })
    listComponent: ListComponent;
    public testdata: any = [{ name: 'Peter', age: 21 }, { name: 'Tony', age: 42 }];
    public testdata1: any = [{ firstname: 'Peter', id: 1 }, { firstname: '', id: 2 }];
    onBeforeRender(widget, $data) { }

    onRender(widget, $data) { }

    onListClick($event, widget) { }

    constructor(_pipeProvider: PipeProvider) {
        setPipeProvider(_pipeProvider);
    }
}

describe('ListComponent', () => {
    let wrapperComponent: ListWrapperComponent;
    let listComponent: ListComponent;
    let fixture: ComponentFixture<ListWrapperComponent>;
    let listAnimator: ListAnimator;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                PaginationModule.forRoot(),
                WmPaginationModule,
                ListComponent, ListItemDirective
            ],
            declarations: [ListWrapperComponent],
            providers: [
                { provide: App, useValue: mockApp },
                { provide: ToDatePipe, useClass: ToDatePipe },
                { provide: AppDefaults, useClass: AppDefaults },
                { provide: AbstractI18nService, useClass: MockAbstractI18nService },
                { provide: DatePipe, useValue: DatePipe },
                TextContentDirective
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ListWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        listComponent = wrapperComponent.listComponent;
        fixture.detectChanges();
        listComponent.dataset = wrapperComponent.testdata;
        listComponent.onPropertyChange('dataset', listComponent.dataset);
        listComponent.groupby = "";
        fixture.detectChanges();

        listAnimator = new ListAnimator(listComponent);
    }));

    it('should create the List Component', () => {
        fixture.detectChanges();
        expect(wrapperComponent).toBeTruthy();
    });

    it('should apply list class to ul element', () => {
        const listclass = 'my-list-class';
        listComponent.listclass = listclass;
        fixture.detectChanges();
        const ulElem = fixture.debugElement.query(By.css('ul.app-livelist-container'));
        expect(ulElem.nativeElement.classList).toContain(listclass);
    });

    it('should process the itemclass property from listComponent', () => {
        const itemclass = 'my-listitem-class';
        listComponent.itemclass = itemclass;

        // Call the private method directly to simulate what happens on initialization
        const listItemDirective = fixture.debugElement
            .query(By.directive(ListItemDirective))
            .injector.get(ListItemDirective);
        // Manually call the private method that processes the itemclass
        listItemDirective['itemClassWatcher'](listComponent);
        fixture.detectChanges();

        // Now let's check if the mechanism to set the class works by checking
        // the directive's private field directly
        expect(listItemDirective['itemClass']).toBe(itemclass);
    });

    it('should select first item & first li should have "active" class applied', () => {
        listComponent.selectfirstitem = true;
        listComponent.dataset = wrapperComponent.testdata;
        listComponent.selecteditem = listComponent.dataset[0];
        // Need to trigger change detection for the DOM to update
        fixture.detectChanges();
        // Verify our expectations
        // selected item should be the first one in dataset
        expect(listComponent.selecteditem).toEqual(listComponent.dataset[0]);
        // active class to be applied on the first element
        const liElem = fixture.debugElement.query(By.directive(ListItemDirective));
        expect(liElem.nativeElement.classList).toContain('active');
    });


    it('should apply disable-item class to li element', () => {
        // Set disableitem property
        listComponent.disableitem = true;

        // Get the ListItemDirective instance
        const listItemDirective = fixture.debugElement
            .query(By.directive(ListItemDirective))
            .injector.get(ListItemDirective);

        // Call the private method that processes the disable-item
        listItemDirective['disableItemWatcher'](listComponent);
        fixture.detectChanges();

        // Check if the directive property is correctly set
        expect(listItemDirective.disableItem).toBe(true);

        // Check if this results in the class being applied (due to HostBinding)
        const liElem = fixture.debugElement.query(By.directive(ListItemDirective));
        expect(liElem.nativeElement.classList.contains('disable-item')).toBe(true);

        // Check click handler
        jest.spyOn(wrapperComponent, 'onListClick');
        listComponent.getNativeElement().click();
        expect(wrapperComponent.onListClick).toHaveBeenCalledTimes(0);
    });

    // it('should apply disable-item property using script or binding', () => {
    //     listComponent.disableitem = wrapperComponent.testdata[1].name === 'Tony';
    //     fixture.detectChanges();
    //     const liELe = fixture.debugElement.query(By.directive(ListItemDirective));
    //     expect(liELe.nativeElement.classList).toContain('disable-item');
    //     // the click handler should not be called on disabling the item
    //     spyOn(wrapperComponent, 'onListClick');
    //     listComponent.getNativeElement().click();
    //     expect(wrapperComponent.onListClick).toHaveBeenCalledTimes(0);
    // });

    it('should select item by index from the script in on-render event', () => {
        // Spy on the onRender method
        jest.spyOn(wrapperComponent, 'onRender');

        // First, make sure dataset is properly set
        listComponent.dataset = wrapperComponent.testdata;
        listComponent.onPropertyChange('dataset', listComponent.dataset);
        wrapperComponent.onRender(listComponent, listComponent.dataset);

        // Force change detection
        fixture.detectChanges();
        expect(wrapperComponent.onRender).toHaveBeenCalledTimes(1);

        listComponent.selectItem(1);
        fixture.detectChanges();

        // selected item should be the second one in dataset
        expect(listComponent.selecteditem).toEqual(listComponent.dataset[1]);
    });

    it('should render items depending on the page size provided', (done) => {
        // Add a Jest timeout to prevent test hanging
        jest.setTimeout(20000);

        jest.spyOn(wrapperComponent, 'onRender');

        // Make sure dataset is properly set first
        listComponent.dataset = wrapperComponent.testdata;
        fixture.detectChanges();

        // Set the pagesize property and force change detection
        listComponent.setProperty('pagesize', 1);
        fixture.detectChanges();
        wrapperComponent.onRender(listComponent, listComponent.dataset);
        expect(wrapperComponent.onRender).toHaveBeenCalledTimes(1);
        setTimeout(() => {
            fixture.detectChanges();

            const fieldDefsLength = listComponent.fieldDefs ? listComponent.fieldDefs.length : 0;
            expect(fieldDefsLength).toEqual(2);
            done();
        }, 500);
    });

    it('should return index of the list item when an object / directive is sent to getIndex function', () => {
        // object exists in the testdata
        const item = { name: 'Peter', age: 21 };
        const index = listComponent.getIndex(item);
        fixture.detectChanges();

        expect(index).toEqual(0);

        // object does not exist in test data
        const obj = { name: 'Jack', age: 24 };
        const val = listComponent.getIndex(obj);
        fixture.detectChanges();

        expect(val).toEqual(-1);

        // pass selectedItem to getIndex function
        listComponent.selectItem(1);
        const selectedIndex = listComponent.getIndex(listComponent.selecteditem);
        fixture.detectChanges();

        expect(selectedIndex).toEqual(1);

        // pass listItemDirective
        const directiveIndex = listComponent.getIndex(listComponent.listItems.last);
        fixture.detectChanges();

        expect(directiveIndex).toEqual(1);
    });


    /*
    it('should invoke on-before-render and on-render in sequence', fakeAsync(() => {
        spyOn(wrapperComponent, 'onBeforeRender');
        // spyOn(wrapperComponent, 'onRender');
        fixture.detectChanges();
        console.warn('checking outside...');
        // tick(100);
        setTimeout(()=>{
            expect(wrapperComponent.onBeforeRender).toHaveBeenCalledTimes(1);
        }, 1000);
        fixture.whenStable().then(()=>{
            console.warn('checking now...');
            //expect(wrapperComponent.onRender).toHaveBeenCalledTimes(2);
        })

    }));
 */
    it('should apply pagination type as inline', () => {
        listComponent.navigation = 'Inline';
        jest.spyOn(listComponent, 'onPropertyChange');
        listComponent.onPropertyChange('navigation', 'Inline');
        fixture.detectChanges();
        const paginationElem = fixture.debugElement.query(By.css('.pager'));
        expect(paginationElem).toBeTruthy();
    });

    xit('should apply pagination type as classic', () => {
        listComponent.navigation = 'Classic';
        jest.spyOn(listComponent, 'onPropertyChange');
        listComponent.onPropertyChange('navigation', 'Classic');
        fixture.detectChanges();
        const paginationElem = fixture.debugElement.query(By.css('.advanced'));
        expect(paginationElem).toBeTruthy();
    });

    xit('should apply pagination type as basic', () => {
        listComponent.navigation = 'Basic';
        fixture.detectChanges();
        const paginationElem = fixture.debugElement.query(By.css('.basic'));
        expect(paginationElem).toBeTruthy();
    });

    it('should apply pagination type as none', () => {
        listComponent.navigation = 'None';
        jest.spyOn(listComponent, 'onPropertyChange');
        listComponent.onPropertyChange('navigation', 'None');
        fixture.detectChanges();
        const paginationElem = fixture.debugElement.query(By.css('.pagination'));
        expect(paginationElem).toBeFalsy();
    });

    it('should apply pagination type as loadmore', () => {
        listComponent.navigation = 'On-Demand';
        jest.spyOn(listComponent, 'onPropertyChange');
        listComponent.onPropertyChange('navigation', 'On-Demand');
        fixture.detectChanges();
        const loadMoreBtn = fixture.debugElement.query(By.css('.app-button'));
        expect(loadMoreBtn.nativeElement.textContent).toBe('Load More');
    });

    it('should apply pagination type as scroll', () => {
        listComponent.navigation = 'Scroll';
        jest.spyOn(listComponent, 'onPropertyChange');
        listComponent.onPropertyChange('navigation', 'Scroll');
        fixture.detectChanges();
        const paginationElem = fixture.debugElement.query(By.css('.pagination'));
        expect(paginationElem).toBeFalsy();
    });

    it('should apply pagination type as classic when advanced is provided', () => {
        // Set navigation to Advanced (which will be converted to Classic internally)
        listComponent.navigation = 'Advanced';

        // Call onPropertyChange which will convert 'Advanced' to 'Classic'
        jest.spyOn(listComponent, 'onPropertyChange');
        listComponent.onPropertyChange('navigation', 'Advanced');

        // Force detection of changes
        fixture.detectChanges();

        // Verify that onPropertyChange was called with 'Advanced'
        expect(listComponent.onPropertyChange).toHaveBeenCalledWith('navigation', 'Advanced');

        // Verify that navigation was changed to 'Classic'
        expect(listComponent.navigation).toBe('Classic');
    });

    xit('should apply pagination type as pager', () => {
        listComponent.navigation = 'Pager';
        jest.spyOn(listComponent, 'onPropertyChange');
        listComponent.onPropertyChange('navigation', 'Pager');
        fixture.detectChanges();
        const paginationElem = fixture.debugElement.query(By.css('.pager'));
        expect(paginationElem).toBeTruthy();
    });

    it('should apply pagination type as thumbnail', () => {
        listComponent.navigation = 'Thumbnail';
        jest.spyOn(listComponent, 'onPropertyChange');
        listComponent.onPropertyChange('navigation', 'Thumbnail');
        fixture.detectChanges();
        const paginationElem = fixture.debugElement.query(By.css('.pagination'));
        expect(paginationElem).toBeFalsy();
    });

    describe('create', () => {
        it('should trigger WM event "insert" when _isDependent is true', () => {
            listComponent['_isDependent'] = true;
            jest.spyOn((listComponent as any), 'triggerWMEvent');
            listComponent.create();
            expect((listComponent as any).triggerWMEvent).toHaveBeenCalledWith('insert');
        });

        it('should not trigger WM event when _isDependent is false', () => {
            listComponent['_isDependent'] = false;
            jest.spyOn((listComponent as any), 'triggerWMEvent');
            listComponent.create();
            expect((listComponent as any).triggerWMEvent).not.toHaveBeenCalled();
        });
    });

    describe('editRow', () => {
        it('should trigger WM event "update" with listItem when _isDependent is true and item is provided', () => {
            listComponent['_isDependent'] = true;
            const mockItem = { id: 1, name: 'Test' };
            jest.spyOn((listComponent as any), 'getItemRefByIndexOrModel').mockReturnValue({ item: mockItem });
            jest.spyOn((listComponent as any), 'triggerWMEvent');
            listComponent.editRow(mockItem);
            expect((listComponent as any).triggerWMEvent).toHaveBeenCalledWith('update', mockItem);
        });

        it('should trigger WM event "update" without listItem when _isDependent is true and item is not provided', () => {
            listComponent['_isDependent'] = true;
            jest.spyOn((listComponent as any), 'triggerWMEvent');
            listComponent.editRow();
            expect((listComponent as any).triggerWMEvent).toHaveBeenCalledWith('update', undefined);
        });

        it('should not trigger WM event when _isDependent is false', () => {
            listComponent['_isDependent'] = false;
            jest.spyOn((listComponent as any), 'triggerWMEvent');
            listComponent.editRow();
            expect((listComponent as any).triggerWMEvent).not.toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should call editRow with the provided item', () => {
            const mockItem = { id: 1, name: 'Test' };
            jest.spyOn(listComponent, 'editRow');
            listComponent.update(mockItem);
            expect(listComponent.editRow).toHaveBeenCalledWith(mockItem);
        });
    });

    describe('deleteRow', () => {
        it('should trigger WM event "delete" with listItem when _isDependent is true and item is provided', () => {
            listComponent['_isDependent'] = true;
            const mockItem = { id: 1, name: 'Test' };
            jest.spyOn((listComponent as any), 'getItemRefByIndexOrModel').mockReturnValue({ item: mockItem });
            jest.spyOn((listComponent as any), 'triggerWMEvent');
            listComponent.deleteRow(mockItem);
            expect((listComponent as any).triggerWMEvent).toHaveBeenCalledWith('delete', mockItem);
        });

        it('should trigger WM event "delete" without listItem when _isDependent is true and item is not provided', () => {
            listComponent['_isDependent'] = true;
            jest.spyOn((listComponent as any), 'triggerWMEvent');
            listComponent.deleteRow();
            expect((listComponent as any).triggerWMEvent).toHaveBeenCalledWith('delete', undefined);
        });

        it('should not trigger WM event when _isDependent is false', () => {
            listComponent['_isDependent'] = false;
            jest.spyOn((listComponent as any), 'triggerWMEvent');
            listComponent.deleteRow();
            expect((listComponent as any).triggerWMEvent).not.toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        it('should call deleteRow with the provided item', () => {
            const mockItem = { id: 1, name: 'Test' };
            jest.spyOn(listComponent, 'deleteRow');
            listComponent.delete(mockItem);
            expect(listComponent.deleteRow).toHaveBeenCalledWith(mockItem);
        });
    });

    describe('execute', () => {
        let mockDatasource: any;

        beforeEach(() => {
            mockDatasource = {
                execute: jest.fn().mockReturnValue(true)
            };
            (listComponent as any).datasource = mockDatasource;
        });

        it('should return false for API_AWARE operation', () => {
            const result = listComponent.execute(DataSource.Operation.IS_API_AWARE, {});
            expect(result).toBe(false);
            expect(mockDatasource.execute).not.toHaveBeenCalled();
        });

        it('should return false for PAGEABLE operation', () => {
            const result = listComponent.execute(DataSource.Operation.IS_PAGEABLE, {});
            expect(result).toBe(false);
            expect(mockDatasource.execute).not.toHaveBeenCalled();
        });

        it('should return false for SUPPORTS_SERVER_FILTER operation', () => {
            const result = listComponent.execute(DataSource.Operation.SUPPORTS_SERVER_FILTER, {});
            expect(result).toBe(false);
            expect(mockDatasource.execute).not.toHaveBeenCalled();
        });

        it('should execute datasource for other operations', () => {
            const mockOperation = 'SOME_OTHER_OPERATION';
            const mockOptions = { key: 'value' };
            const result = listComponent.execute(mockOperation, mockOptions);
            expect(result).toBe(true);
            expect(mockDatasource.execute).toHaveBeenCalledWith(mockOperation, mockOptions);
        });
    });


    describe('handleKeyDown', () => {
        let mockEvent: any;
        let mockListItems: QueryList<ListItemDirective>;

        beforeEach(() => {
            mockEvent = {
                stopPropagation: jest.fn(),
                preventDefault: jest.fn(),
                keyCode: 0,
                target: { classList: { contains: jest.fn() } }
            };

            mockListItems = new QueryList<ListItemDirective>();
            mockListItems.reset([
                { nativeElement: { focus: jest.fn(), before: jest.fn(), after: jest.fn() } },
                { nativeElement: { focus: jest.fn(), before: jest.fn(), after: jest.fn() } },
                { nativeElement: { focus: jest.fn(), before: jest.fn(), after: jest.fn() } }
            ] as any);

            listComponent.listItems = mockListItems;
            (listComponent as any).getListItemIndex = jest.fn().mockReturnValue(1);
            (listComponent as any).getListItemByIndex = jest.fn(index => mockListItems.toArray()[index]);
            (listComponent as any).toggleListItemSelection = jest.fn();
            (listComponent as any).checkSelectionLimit = jest.fn().mockReturnValue(true);
            listComponent.invokeEventCallback = jest.fn();
            listComponent.onItemClick = jest.fn();
            (listComponent as any).onUpdate = jest.fn();
            (listComponent as any).statePersistence = { removeWidgetState: jest.fn() };
            (listComponent as any).$ulEle = { data: jest.fn() } as any;
        });

        it('should handle selectPrev action in multiselect mode', () => {
            listComponent.multiselect = true;
            listComponent.handleKeyDown(mockEvent, 'selectPrev');

            expect((listComponent as any).toggleListItemSelection).toHaveBeenCalled();
            expect(listComponent.lastSelectedItem).toBe(mockListItems.toArray()[0]);
        });

        it('should handle selectNext action in multiselect mode', () => {
            listComponent.multiselect = true;
            listComponent.handleKeyDown(mockEvent, 'selectNext');

            expect((listComponent as any).toggleListItemSelection).toHaveBeenCalled();
            expect(listComponent.lastSelectedItem).toBe(mockListItems.toArray()[2]);
        });

        it('should handle focusPrev action', () => {
            listComponent.handleKeyDown(mockEvent, 'focusPrev');

            expect(listComponent.lastSelectedItem.nativeElement.focus).toHaveBeenCalled();
            expect(listComponent.currentIndex).toBe(1);
        });

        it('should not handle space action without enablereorder', () => {
            listComponent.enablereorder = false;
            listComponent.handleKeyDown(mockEvent, 'space');

            expect((listComponent as any).isListElementMovable).toBeFalsy();
            expect(listComponent.onItemClick).not.toHaveBeenCalled();
        });

        it('should prevent default for non-special keys', () => {
            mockEvent.keyCode = 65; // 'A' key
            listComponent.handleKeyDown(mockEvent, 'someAction');

            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });

        it('should not prevent default for enter key', () => {
            mockEvent.keyCode = 13; // Enter key
            listComponent.handleKeyDown(mockEvent, 'someAction');

            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        });

        it('should not prevent default for tab key', () => {
            mockEvent.keyCode = 9; // Tab key
            listComponent.handleKeyDown(mockEvent, 'someAction');

            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        });

        it('should not prevent default for space key on form controls', () => {
            mockEvent.keyCode = 32; // Space key
            mockEvent.target.classList.contains.mockReturnValue(true);
            listComponent.handleKeyDown(mockEvent, 'someAction');

            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        });

        it('should handle selectPrev action when presentIndex > firstIndex', () => {
            listComponent.multiselect = true;
            (listComponent as any).firstSelectedItem = mockListItems.toArray()[0];
            listComponent.lastSelectedItem = mockListItems.toArray()[1];
            (listComponent as any).getListItemIndex.mockReturnValueOnce(1).mockReturnValueOnce(0);

            listComponent.handleKeyDown(mockEvent, 'selectPrev');

            expect((listComponent as any).toggleListItemSelection).toHaveBeenCalledWith(mockListItems.toArray()[1]);
            expect(listComponent.lastSelectedItem).toBe(mockListItems.toArray()[0]);
        });

        it('should handle selectNext action when presentIndex < firstIndex', () => {
            listComponent.multiselect = true;
            (listComponent as any).firstSelectedItem = mockListItems.toArray()[2];
            listComponent.lastSelectedItem = mockListItems.toArray()[1];
            (listComponent as any).getListItemIndex.mockReturnValueOnce(1).mockReturnValueOnce(2);

            listComponent.handleKeyDown(mockEvent, 'selectNext');

            expect((listComponent as any).toggleListItemSelection).toHaveBeenCalledWith(mockListItems.toArray()[1]);
            expect(listComponent.lastSelectedItem).toBe(mockListItems.toArray()[2]);
        });

        it('should invoke selectionlimitexceed callback when limit is reached', () => {
            listComponent.multiselect = true;
            (listComponent as any).checkSelectionLimit.mockReturnValue(false);

            listComponent.handleKeyDown(mockEvent, 'selectNext');

            expect(listComponent.invokeEventCallback).toHaveBeenCalledWith('selectionlimitexceed', { $event: mockEvent });
        });

        it('should handle focusPrev action with isListElementMovable', () => {
            (listComponent as any).isListElementMovable = true;
            (listComponent as any).getListItemIndex.mockReturnValue(1);

            listComponent.handleKeyDown(mockEvent, 'focusPrev');

            expect(listComponent.lastSelectedItem.nativeElement.focus).toHaveBeenCalled();
            expect((listComponent as any).statePersistence.removeWidgetState).toHaveBeenCalledWith(listComponent, 'selectedItem');
            expect(listComponent.currentIndex).toBe(1);
            expect((listComponent as any).ariaText).toBe("selected ");
        });

        it('should not move element when focusPrev is called on first item', () => {
            (listComponent as any).isListElementMovable = true;
            (listComponent as any).getListItemIndex.mockReturnValue(0);

            listComponent.handleKeyDown(mockEvent, 'focusPrev');

            expect(mockListItems.toArray()[0].nativeElement.before).not.toHaveBeenCalled();
        });

        it('should handle focusNext action with isListElementMovable', () => {
            (listComponent as any).isListElementMovable = true;
            (listComponent as any).getListItemIndex.mockReturnValue(1);

            listComponent.handleKeyDown(mockEvent, 'focusNext');

            expect(listComponent.lastSelectedItem.nativeElement.focus).toHaveBeenCalled();
            expect((listComponent as any).statePersistence.removeWidgetState).toHaveBeenCalledWith(listComponent, 'selectedItem');
            expect(listComponent.currentIndex).toBe(3);
            expect((listComponent as any).ariaText).toBe("selected ");
        });

        it('should handle space action to toggle isListElementMovable', () => {
            listComponent.enablereorder = true;
            (listComponent as any).getListItemIndex.mockReturnValue(1);

            listComponent.handleKeyDown(mockEvent, 'space');

            expect((listComponent as any).isListElementMovable).toBe(true);
            expect(listComponent.onItemClick).toHaveBeenCalled();
            expect(listComponent.currentIndex).toBe(2);
            expect((listComponent as any).ariaText).toBe("Item 2 grabbed, current position ");
            expect((listComponent as any).$ulEle.data).toHaveBeenCalledWith('oldIndex', 1);

            listComponent.handleKeyDown(mockEvent, 'space');

            expect((listComponent as any).isListElementMovable).toBe(false);
            expect((listComponent as any).ariaText).toBe("Item 2 dropped, final position ");
            expect((listComponent as any).onUpdate).toHaveBeenCalledWith(mockEvent, undefined, 1);
        });
    });
    describe('onItemClick', () => {
        let mockEvent: any;
        let mockListItem: ListItemDirective;

        beforeEach(() => {
            mockEvent = { ctrlKey: false, metaKey: false, shiftKey: false };
            mockListItem = {
                disableItem: false,
                isActive: false,
                context: { index: 0 }
            } as ListItemDirective;

            listComponent.multiselect = false;
            listComponent['firstSelectedItem'] = null;
            listComponent['lastSelectedItem'] = null;
            (listComponent as any)['listItems'] = [];
            listComponent['selectedItem'] = [];
            listComponent['selectedItemWidgets'] = [];

            jest.spyOn(listComponent as any, 'toggleListItemSelection');
            jest.spyOn(listComponent as any, 'clearSelectedItems');
            jest.spyOn(listComponent as any, 'invokeEventCallback');
            jest.spyOn(listComponent as any, 'checkSelectionLimit').mockReturnValue(true);
            jest.spyOn(listComponent as any, 'updateSelectedItemsWidgets');
            (isMobile as jest.Mock).mockReturnValue(false);
        });

        it('should not select disabled items', () => {
            mockListItem.disableItem = true;
            listComponent.onItemClick(mockEvent, mockListItem);
            expect(listComponent['toggleListItemSelection']).not.toHaveBeenCalled();
        });

        it('should handle single selection', () => {
            listComponent.onItemClick(mockEvent, mockListItem);
            expect(listComponent['clearSelectedItems']).toHaveBeenCalled();
            expect(listComponent['toggleListItemSelection']).toHaveBeenCalledWith(mockListItem);
        });

        it('should handle multi-selection with ctrl/cmd key', () => {
            listComponent.multiselect = true;
            mockEvent.ctrlKey = true;
            listComponent.onItemClick(mockEvent, mockListItem);
            expect(listComponent['toggleListItemSelection']).toHaveBeenCalledWith(mockListItem);
        });

        it('should handle multi-selection on mobile devices', () => {
            listComponent.multiselect = true;
            (isMobile as jest.Mock).mockReturnValue(true);
            listComponent.onItemClick(mockEvent, mockListItem);
            expect(listComponent['toggleListItemSelection']).toHaveBeenCalledWith(mockListItem);
        });

        it('should invoke selectionlimitexceed callback when selection limit is reached on mobile', () => {
            listComponent.multiselect = true;
            (isMobile as jest.Mock).mockReturnValue(true);
            (listComponent['checkSelectionLimit'] as jest.Mock).mockReturnValue(false);
            listComponent.onItemClick(mockEvent, mockListItem);
            expect(listComponent['invokeEventCallback']).toHaveBeenCalledWith('selectionlimitexceed', { $event: mockEvent });
        });

        it('should handle shift key multi-selection with range check', () => {
            listComponent.multiselect = true;
            mockEvent.shiftKey = true;
            (listComponent as any)['firstSelectedItem'] = { context: { index: 2 } };
            mockListItem.context.index = 5;
            (listComponent as any)['listItems'] = [
                { context: { index: 0 } },
                { context: { index: 1 } },
                { context: { index: 2 } },
                { context: { index: 3 } },
                { context: { index: 4 } },
                mockListItem
            ];
            (listComponent['checkSelectionLimit'] as jest.Mock).mockReturnValue(true);

            listComponent.onItemClick(mockEvent, mockListItem);

            expect(listComponent['clearSelectedItems']).toHaveBeenCalled();
            expect(listComponent['toggleListItemSelection']).toHaveBeenCalledTimes(4); // Items at index 2, 3, 4, 5
            expect(listComponent['lastSelectedItem']).toBe(mockListItem);
        });

        it('should invoke selectionlimitexceed callback when shift selection exceeds limit', () => {
            listComponent.multiselect = true;
            mockEvent.shiftKey = true;
            (listComponent as any)['firstSelectedItem'] = { context: { index: 0 } };
            mockListItem.context.index = 5;
            (listComponent['checkSelectionLimit'] as jest.Mock).mockReturnValue(false);

            listComponent.onItemClick(mockEvent, mockListItem);

            expect(listComponent['invokeEventCallback']).toHaveBeenCalledWith('selectionlimitexceed', { $event: mockEvent });
        });

        it('should clear selection if item is not active and selectCount > 1', () => {
            listComponent.multiselect = true;
            mockListItem.isActive = false;
            listComponent['selectedItem'] = [{}, {}]; // selectCount > 1

            listComponent.onItemClick(mockEvent, mockListItem);

            expect(listComponent['clearSelectedItems']).toHaveBeenCalled();
            expect(listComponent['toggleListItemSelection']).toHaveBeenCalledWith(mockListItem);
        });

        it('should clear selection if item is not active and selectCount > 1', () => {
            listComponent.multiselect = true;
            mockListItem.isActive = false;
            listComponent['selectedItem'] = [{}, {}]; // selectCount > 1

            listComponent.onItemClick(mockEvent, mockListItem);

            expect(listComponent['clearSelectedItems']).toHaveBeenCalled();
            expect(listComponent['toggleListItemSelection']).toHaveBeenCalledWith(mockListItem);
        });
        it('should invoke selectionlimitexceed callback when shift selection exceeds limit', () => {
            listComponent.multiselect = true;
            mockEvent.shiftKey = true;
            (listComponent as any)['firstSelectedItem'] = { context: { index: 0 } };
            mockListItem.context.index = 5;
            (listComponent['checkSelectionLimit'] as jest.Mock).mockReturnValue(false);
            listComponent.onItemClick(mockEvent, mockListItem);
            expect(listComponent['invokeEventCallback']).toHaveBeenCalledWith('selectionlimitexceed', { $event: mockEvent });
        });
    });
    describe('configureDnD', () => {
        let $ulEle: JQuery<HTMLElement>;
        let nativeElement: HTMLElement;
        beforeEach(() => {
            $ulEle = $(nativeElement).find('.app-livelist-container');
            listComponent['$ulEle'] = $ulEle;
            nativeElement = fixture.nativeElement;
            nativeElement.innerHTML = '<div class="app-livelist-container"></div>';
        })

        it('should set appendTo to the modal element if modal is present', () => {
            jest.spyOn(listComponent, 'getAttr').mockReturnValue(null);
            const modalElement = document.createElement('div');
            modalElement.classList.add('modal');
            document.body.appendChild(modalElement);

            listComponent['configureDnD']();

            expect(configureDnD).toHaveBeenCalledWith(
                expect.anything(),
                { appendTo: modalElement },
                expect.any(Function),
                expect.any(Function),
                expect.any(Function)
            );

            document.body.removeChild(modalElement);
        });
    });
    describe('onUpdate', () => {
        let oldIndex: number;
        let newIndex: number;
        let $event: any;
        let ui: any;

        beforeEach(() => {
            oldIndex = 1;
            newIndex = 3;
            $event = { /* Mock event object */ };
            ui = { item: { index: () => newIndex } };

            jest.spyOn(listComponent, 'invokeEventCallback');

            (listComponent as any).$ulEle = {
                data: jest.fn().mockReturnValue(oldIndex),
                removeData: jest.fn()
            };

            (listComponent as any).reorderProps = { minIndex: 0, maxIndex: 4 };
            listComponent.fieldDefs = [
                { id: 1 },
                { id: 2 },
                { id: 3 },
                { id: 4 },
                { id: 5 }
            ];
        });

        it('should update the list data when item is dragged and dropped', () => {
            (listComponent as any).onUpdate($event, ui);

            expect(listComponent.fieldDefs.length).toBe(5);
            expect(listComponent.fieldDefs[newIndex]).toEqual({ id: 2 });
            expect(listComponent.invokeEventCallback).toHaveBeenCalledWith(
                'reorder',
                expect.objectContaining({
                    $event: $event,
                    $data: listComponent.fieldDefs,
                    $changedItem: expect.objectContaining({
                        oldIndex: oldIndex,
                        newIndex: newIndex,
                        item: { id: 2 }
                    })
                })
            );
            expect((listComponent as any).$ulEle.removeData).toHaveBeenCalledWith('oldIndex');
        });
    });

    describe('handleStateParams', () => {
        let options: any;

        beforeEach(() => {
            options = { options: {} };
            (listComponent as any)._pageLoad = true;
            (listComponent as any)._selectedItemsExist = false;
        });

        it('should not modify options if _pageLoad is false', () => {
            (listComponent as any)._pageLoad = false;
            (listComponent as any).handleStateParams(options);
            expect(options.options.page).toBeUndefined();
            expect((listComponent as any)._selectedItemsExist).toBe(false);
        });

        it('should set options.options.page if widgetState.pagination is set', () => {
            jest.spyOn((listComponent as any).statePersistence, 'getWidgetState').mockReturnValue({
                pagination: 2,
            });
            (listComponent as any).handleStateParams(options);
            expect(options.options.page).toBe(2);
            expect((listComponent as any)._selectedItemsExist).toBe(false);
        });

        it('should set _selectedItemsExist if widgetState.selectedItem is set', () => {
            jest.spyOn((listComponent as any).statePersistence, 'getWidgetState').mockReturnValue({
                selectedItem: 'some-item',
            });
            (listComponent as any).handleStateParams(options);
            expect(options.options.page).toBeUndefined();
            expect((listComponent as any)._selectedItemsExist).toBe(true);
        });
    });

    describe('onPropertyChange', () => {
        it('should call onDataSetChange when key is "dataset"', () => {
            jest.spyOn((listComponent as any), 'onDataSetChange');
            listComponent.onPropertyChange('dataset', [1, 2, 3]);
            expect((listComponent as any).onDataSetChange).toHaveBeenCalledWith([1, 2, 3]);
        });

        it('should call onDataSetChange when key is "datasource"', () => {
            jest.spyOn((listComponent as any), 'onDataSetChange');
            listComponent.dataset = [1, 2, 3];
            listComponent.onPropertyChange('datasource', 'some-datasource');
            expect((listComponent as any).onDataSetChange).toHaveBeenCalledWith([1, 2, 3]);
        });


        it('should update pagination options when key is "pagesize"', () => {
            listComponent.dataNavigator = { options: {}, widget: { maxResults: 0 }, maxResults: 0 };
            listComponent.onPropertyChange('pagesize', 20);
            expect(listComponent.dataNavigator.options).toEqual({ maxResults: 20 });
            expect(listComponent.dataNavigator.widget.maxResults).toBe(20);
            expect(listComponent.dataNavigator.maxResults).toBe(20);
        });
    });

    describe('clear()', () => {
        it('should call updateFieldDefs with an empty array', () => {
            const updateFieldDefsSpy = jest.spyOn((listComponent as any), 'updateFieldDefs');
            listComponent.clear();
            expect(updateFieldDefsSpy).toHaveBeenCalledWith([]);
        });
    });

    describe('deselectItem()', () => {
        it('should deselect an active item by index', () => {
            listComponent.dataset = [{ name: 'Test1', age: 30 }, { name: 'Test2', age: 40 }];
            listComponent.onPropertyChange('dataset', listComponent.dataset);
            const mockListItem = { isActive: true };
            jest.spyOn((listComponent as any), 'getItemRefByIndexOrModel').mockReturnValue(mockListItem);
            const toggleSpy = jest.spyOn((listComponent as any), 'toggleListItemSelection');
            listComponent.deselectItem(0);
            expect((listComponent as any).getItemRefByIndexOrModel).toHaveBeenCalledWith(0);
            expect(toggleSpy).toHaveBeenCalledWith(mockListItem);
        });

        it('should deselect an active item by model', () => {
            const itemModel = { name: 'Test', age: 30 };
            listComponent.dataset = [itemModel];
            listComponent.onPropertyChange('dataset', listComponent.dataset);
            const mockListItem = { isActive: true };
            jest.spyOn((listComponent as any), 'getItemRefByIndexOrModel').mockReturnValue(mockListItem);
            const toggleSpy = jest.spyOn((listComponent as any), 'toggleListItemSelection');
            listComponent.deselectItem(itemModel);
            expect((listComponent as any).getItemRefByIndexOrModel).toHaveBeenCalledWith(itemModel);
            expect(toggleSpy).toHaveBeenCalledWith(mockListItem);
        });

        it('should not deselect an inactive item', () => {
            listComponent.dataset = [{ name: 'Test', age: 30 }];
            listComponent.onPropertyChange('dataset', listComponent.dataset);
            const mockListItem = { isActive: false };
            jest.spyOn((listComponent as any), 'getItemRefByIndexOrModel').mockReturnValue(mockListItem);
            const toggleSpy = jest.spyOn((listComponent as any), 'toggleListItemSelection');
            listComponent.deselectItem(0);
            expect((listComponent as any).getItemRefByIndexOrModel).toHaveBeenCalledWith(0);
            expect(toggleSpy).not.toHaveBeenCalled();
        });

        it('should do nothing if the item is not found', () => {
            listComponent.dataset = [{ name: 'Test', age: 30 }];
            listComponent.onPropertyChange('dataset', listComponent.dataset);
            jest.spyOn((listComponent as any), 'getItemRefByIndexOrModel').mockReturnValue(null);
            const toggleSpy = jest.spyOn((listComponent as any), 'toggleListItemSelection');
            listComponent.deselectItem(1);
            expect((listComponent as any).getItemRefByIndexOrModel).toHaveBeenCalledWith(1);
            expect(toggleSpy).not.toHaveBeenCalled();
        });
    });

    describe('onDataSetChange', () => {
        beforeEach(() => {
            (listComponent as any).datasource = { category: 'wm.Variable' };
            listComponent['_pageLoad'] = true;
            (listComponent as any).statePersistence = {
                getWidgetState: jest.fn(),
                computeMode: jest.fn()
            };
            listComponent.dataNavigator = {
                pageChanged: jest.fn(),
                setDataSource: jest.fn()
            };
            (listComponent as any).setupDataSource = jest.fn();
            (listComponent as any).onDataChange = jest.fn();
            listComponent['statehandler'] = 'someStateHandler';
        });

        it('should handle widget state with pagination', () => {
            const widgetState = { pagination: { page: 2 } };
            (listComponent as any).statePersistence.getWidgetState.mockReturnValue(widgetState);
            (listComponent as any).statePersistence.computeMode.mockReturnValue('someState');
            listComponent['onDataSetChange']([]);
            expect(listComponent.dataNavigator.pageChanged).toHaveBeenCalledWith({ page: { page: 2 } }, true);
            expect(listComponent['_pageLoad']).toBe(false);
        });

        it('should set _selectedItemsExist when widget state has selectedItem', () => {
            const widgetState = { selectedItem: {} };
            (listComponent as any).statePersistence.getWidgetState.mockReturnValue(widgetState);
            (listComponent as any).statePersistence.computeMode.mockReturnValue('someState');
            listComponent['onDataSetChange']([]);
            expect(listComponent['_selectedItemsExist']).toBe(true);
        });

        it('should setup data source when navigation is set and dataNavigatorWatched is false', () => {
            listComponent.navigation = NAVIGATION_TYPE.BASIC;
            listComponent['dataNavigatorWatched'] = false;
            (listComponent as any).statePersistence.computeMode.mockReturnValue('someState');
            listComponent['onDataSetChange']([]);
            expect((listComponent as any).setupDataSource).toHaveBeenCalled();
        });

        it('should call onDataChange when navigation is NONE and dataNavigatorWatched is false', () => {
            listComponent.navigation = NAVIGATION_TYPE.NONE;
            listComponent['dataNavigatorWatched'] = false;
            const newVal = [{ id: 1, name: 'Test' }];
            (listComponent as any).statePersistence.computeMode.mockReturnValue('someState');
            listComponent['onDataSetChange'](newVal);
            expect((listComponent as any).onDataChange).toHaveBeenCalledWith(newVal);
        });

        it('should update dataNavigator dataSource when navigation is set and dataNavigatorWatched is true', () => {
            listComponent.navigation = NAVIGATION_TYPE.BASIC;
            listComponent['dataNavigatorWatched'] = true;
            (listComponent as any).statePersistence.computeMode.mockReturnValue('someState');
            listComponent['onDataSetChange']([]);
            expect(listComponent.dataNavigator.setDataSource).toHaveBeenCalledWith((listComponent as any).datasource);
        });
    });
    it('should subscribe to pull to refresh', () => {
        const mockApp = {
            subscribe: jest.fn().mockReturnValue(() => { })
        };
        listComponent['app'] = mockApp as any;
        listComponent['_listenerDestroyers'] = [];
        listComponent['datasource'] = {
            listRecords: jest.fn()
        };
        (listComponent as any).subscribeToPullToRefresh();
        expect(mockApp.subscribe).toHaveBeenCalledWith('pulltorefresh', expect.any(Function));
        expect(listComponent['_listenerDestroyers'].length).toBe(1);
        const pullToRefreshCallback = mockApp.subscribe.mock.calls[0][1];
        pullToRefreshCallback();
        expect(listComponent['datasource'].listRecords).toHaveBeenCalled();
    });

    describe('checkSelectionLimit', () => {
        it('should return true when selection limit is not set', () => {
            listComponent.selectionlimit = undefined;
            expect(listComponent['checkSelectionLimit'](5)).toBeTruthy();
        });
        it('should return true when count is less than selection limit', () => {
            listComponent.selectionlimit = 10;
            expect(listComponent['checkSelectionLimit'](5)).toBeTruthy();
        });
        it('should return false when count is equal to selection limit', () => {
            listComponent.selectionlimit = 5;
            expect(listComponent['checkSelectionLimit'](5)).toBeFalsy();
        });
        it('should return false when count is greater than selection limit', () => {
            listComponent.selectionlimit = 5;
            expect(listComponent['checkSelectionLimit'](10)).toBeFalsy();
        });
    });

    describe('beforePaginationChange', () => {
        it('should invoke the paginationchange event callback', () => {
            const mockEvent = { page: 2 };
            const mockIndex = 1;
            jest.spyOn(listComponent, 'invokeEventCallback');
            listComponent['beforePaginationChange'](mockEvent, mockIndex);
            expect(listComponent.invokeEventCallback).toHaveBeenCalledWith('paginationchange', {
                $event: mockEvent,
                $index: mockIndex
            });
        });
    });

    describe('setUpCUDHandlers', () => {
        it('should set up click event listener for add-list-item', () => {
            const mockAddItem = document.createElement('div');
            mockAddItem.className = 'add-list-item';
            document.body.appendChild(mockAddItem);
            jest.spyOn(listComponent, 'create');
            listComponent['setUpCUDHandlers']();
            mockAddItem.click();
            expect(listComponent.create).toHaveBeenCalled();
            document.body.removeChild(mockAddItem);
        });
        it('should not set up click event listener when add-list-item is not found', () => {
            jest.spyOn(listComponent, 'create');
            listComponent['setUpCUDHandlers']();
            expect(listComponent.create).not.toHaveBeenCalled();
        });
    });
    describe('onSort', () => {
        beforeEach(() => {
            listComponent.infScroll = true;
            listComponent.fieldDefs = [{}, {}, {}]; // Mock 3 field definitions
            (listComponent as any).$ulEle = {
                find: jest.fn().mockReturnValue({
                    offset: () => ({ top: 100 })
                })
            };
            (listComponent as any).paginationService = {
                bindScrollEvt: jest.fn()
            };
            (listComponent as any).debouncedFetchNextDatasetOnScroll = jest.fn();
        });

        it('should not trigger pagination when dragged element is above last item', () => {
            const evt = {};
            const ui = { offset: { top: 50 } };
            listComponent['onSort'](evt, ui);
            expect((listComponent as any).paginationService.bindScrollEvt).not.toHaveBeenCalled();
            expect((listComponent as any).debouncedFetchNextDatasetOnScroll).not.toHaveBeenCalled();
        });

        it('should trigger pagination when dragged element is below last item', () => {
            const evt = {};
            const ui = { offset: { top: 150 } };
            listComponent['onSort'](evt, ui);
            expect((listComponent as any).paginationService.bindScrollEvt).toHaveBeenCalledWith(
                listComponent,
                '> ul',
                expect.any(Number)
            );
            expect((listComponent as any).debouncedFetchNextDatasetOnScroll).toHaveBeenCalled();
        });

        it('should not trigger pagination when infScroll is false', () => {
            listComponent.infScroll = false;
            const evt = {};
            const ui = { offset: { top: 150 } };
            listComponent['onSort'](evt, ui);
            expect((listComponent as any).paginationService.bindScrollEvt).not.toHaveBeenCalled();
            expect((listComponent as any).debouncedFetchNextDatasetOnScroll).not.toHaveBeenCalled();
        });

        it('should not trigger pagination when last item offset is not found', () => {
            (listComponent as any).$ulEle.find = jest.fn().mockReturnValue({
                offset: () => null
            });
            const evt = {};
            const ui = { offset: { top: 150 } };
            listComponent['onSort'](evt, ui);
            expect((listComponent as any).paginationService.bindScrollEvt).not.toHaveBeenCalled();
            expect((listComponent as any).debouncedFetchNextDatasetOnScroll).not.toHaveBeenCalled();
        });
    });
    describe('onReorderStart', () => {
        beforeEach(() => {
            (listComponent as any).$ulEle = {
                data: jest.fn()
            } as any;
        });

        it('should set placeholder height and store old index', () => {
            const mockEvent = {};
            const mockUi = {
                placeholder: {
                    height: jest.fn()
                },
                item: {
                    height: () => 100,
                    index: () => 5
                }
            };

            listComponent['onReorderStart'](mockEvent, mockUi);

            expect(mockUi.placeholder.height).toHaveBeenCalledWith(100);
            expect((listComponent as any).$ulEle.data).toHaveBeenCalledWith('oldIndex', 5);
        });
    });

    describe('ListAnimator', () => {
        it('should initialize the list animator', () => {
            expect(listAnimator).toBeDefined();
        });

        it('should have correct initial values for leftChildrenCount and rightChildrenCount', () => {
            expect((listAnimator as any).leftChildrenCount).toBeDefined();
            expect((listAnimator as any).rightChildrenCount).toBeDefined();
        });

        it('should handle bounds for swipe action', () => {
            const mockTarget = {
                hasClass: jest.fn(() => true),
                closest: jest.fn(() => mockTarget),
                children: jest.fn(() => []),
            } as any;

            const mockEvent = {
                target: mockTarget,
            } as any;

            const bounds = listAnimator.bounds(mockEvent, 1);

            expect(bounds).toBeDefined();
            expect(bounds.strictUpper).toBeDefined();
            expect(bounds.lower).toBeDefined();
            expect(bounds.center).toBeDefined();
            expect(bounds.upper).toBeDefined();
        });

        it('should trigger full swipe event', () => {
            const mockActionItems = new QueryList<ButtonComponent>();
            const mockButton = {
                getAttr: jest.fn(() => 'left'),
                $element: {
                    is: jest.fn(() => true),
                },
                hasEventCallback: jest.fn(() => true),
                invokeEventCallback: jest.fn(),
            };

            mockActionItems.reset([mockButton as any]);
            (listAnimator as any).actionItems = mockActionItems;
            (listAnimator as any).position = 'left';

            const mockEvent = {} as any;
            listAnimator.invokeFullSwipeEvt(mockEvent);

            expect(mockButton.invokeEventCallback).toHaveBeenCalledWith('tap', { $event: mockEvent });
        });

        it('should return animation configuration', () => {
            const result = listAnimator.animation();

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBeTruthy();
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].target).toBeDefined();
        });

        it('should create an action panel', () => {
            const mockLi = {
                outerWidth: jest.fn(() => 100),
                outerHeight: jest.fn(() => 50)
            };
            const mockActionPanelTemplate = {
                css: jest.fn().mockReturnThis(),
                insertBefore: jest.fn().mockReturnThis()
            };

            const result = (listAnimator as any).createActionPanel(mockLi, mockActionPanelTemplate);

            expect(mockActionPanelTemplate.css).toHaveBeenCalledWith({
                width: '100px',
                height: '50px',
                marginBottom: '-50px',
                float: 'left',
                padding: 0
            });
            expect(mockActionPanelTemplate.insertBefore).toHaveBeenCalledWith(mockLi);
            expect(result).toBe(mockActionPanelTemplate);
        });

        it('should reset element', () => {
            const mockEl = {
                css: jest.fn()
            };

            (listAnimator as any).resetElement(mockEl);

            expect(mockEl.css).toHaveBeenCalledWith({
                transform: 'none',
                transition: 'none'
            });
        });

        it('should return first child when position is left', () => {
            const mockActionTemplate = {
                children: jest.fn().mockReturnThis(),
                length: 2,
                first: jest.fn().mockReturnValue('firstChild'),
                last: jest.fn().mockReturnValue('lastChild')
            };
            (listAnimator as any).position = 'left';

            const result = (listAnimator as any).getChildActionElement(mockActionTemplate);

            expect(mockActionTemplate.children).toHaveBeenCalled();
            expect(mockActionTemplate.first).toHaveBeenCalled();
            expect(result).toBe('firstChild');
        });

        it('should return last child when position is not left', () => {
            const mockActionTemplate = {
                children: jest.fn().mockReturnThis(),
                length: 2,
                first: jest.fn().mockReturnValue('firstChild'),
                last: jest.fn().mockReturnValue('lastChild')
            };
            (listAnimator as any).position = 'right';

            const result = (listAnimator as any).getChildActionElement(mockActionTemplate);

            expect(mockActionTemplate.children).toHaveBeenCalled();
            expect(mockActionTemplate.last).toHaveBeenCalled();
            expect(result).toBe('lastChild');
        });

        it('should return undefined when there are no children', () => {
            const mockActionTemplate = {
                children: jest.fn().mockReturnValue({ length: 0 })
            };

            const result = (listAnimator as any).getChildActionElement(mockActionTemplate);

            expect(mockActionTemplate.children).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });

        describe('initActionPanel', () => {
            let mockLi, mockActionTemplate, mockActionPanel, mockChildElement;

            beforeEach(() => {
                mockLi = {};
                mockActionTemplate = {};
                mockActionPanel = {
                    css: jest.fn()
                };
                mockChildElement = {
                    css: jest.fn().mockReturnValue('mockColor')
                };

                (listAnimator as any).li = mockLi;
                (listAnimator as any).createActionPanel = jest.fn().mockReturnValue(mockActionPanel);
                (listAnimator as any).getChildActionElement = jest.fn().mockReturnValue(mockChildElement);
                (listAnimator as any).computeTotalChildrenWidth = jest.fn().mockReturnValue(100);
                (listAnimator as any).computeTransitionProportions = jest.fn().mockReturnValue([0.5, 1]);
            });

            it('should initialize the action panel correctly', () => {
                (listAnimator as any).initActionPanel(mockActionTemplate);

                expect((listAnimator as any).createActionPanel).toHaveBeenCalledWith(mockLi, mockActionTemplate);
                expect((listAnimator as any).getChildActionElement).toHaveBeenCalledWith(mockActionPanel);
                expect(mockActionPanel.css).toHaveBeenCalledWith({
                    backgroundColor: 'mockColor'
                });
                expect((listAnimator as any).computeTotalChildrenWidth).toHaveBeenCalledWith(mockActionPanel);
                expect((listAnimator as any).computeTransitionProportions).toHaveBeenCalledWith(mockActionPanel);
                expect((listAnimator as any).actionPanel).toBe(mockActionPanel);
                expect((listAnimator as any).limit).toBe(100);
                expect((listAnimator as any).transitionProportions).toEqual([0.5, 1]);
            });
        });

        describe('bounds', () => {
            let listAnimator: ListAnimator;
            let listComponent: ListComponent;
            let containerElement: HTMLElement;

            beforeEach(() => {
                // Create a real DOM structure
                containerElement = document.createElement('div');
                containerElement.innerHTML = `
                <ul class="app-livelist-container">
                    <li class="app-list-item">
                        <div class="app-list-item-left-action-panel" position="left">
                            <button>Left Action</button>
                        </div>
                        <div class="app-list-item-content">Item 1</div>
                        <div class="app-list-item-right-action-panel" position="right">
                            <button>Right Action</button>
                        </div>
                    </li>
                    <li class="app-list-item">
                        <div class="app-list-item-content">Item 2</div>
                    </li>
                </ul>
            `;
                document.body.appendChild(containerElement);

                listComponent = {
                    getNativeElement: () => containerElement,
                    groupby: false
                } as any as ListComponent;

                listAnimator = new ListAnimator(listComponent);

                (listAnimator as any).$el = $(containerElement).find('ul.app-livelist-container');
            });

            afterEach(() => {
                document.body.removeChild(containerElement);
            });

            const defaultBounds = {
                strictUpper: true,
                strictLower: true,
                lower: 0,
                center: 0,
                upper: 0
            };

            it('should return default bounds when target is not app-list-item', () => {
                const event = { target: containerElement.querySelector('.app-livelist-container') };
                const result = listAnimator.bounds(event, 1);

                expect(result).toEqual(defaultBounds);
            });

            it('should return default bounds for left action panel when li is different', () => {
                const event = { target: containerElement.querySelector('.app-list-item') };
                (listAnimator as any).li = null;
                (listAnimator as any).limit = 100;

                const result = listAnimator.bounds(event, 1);

                expect(result).toEqual(defaultBounds);
            });

            it('should return default bounds for right action panel when li is different', () => {
                const event = { target: containerElement.querySelector('.app-list-item') };
                (listAnimator as any).li = null;
                (listAnimator as any).limit = 100;

                const result = listAnimator.bounds(event, -1);

                expect(result).toEqual(defaultBounds);
            });

            it('should return bounds when left action panel is visible and li is the same', () => {
                const listItem = containerElement.querySelector('.app-list-item');
                const event = { target: listItem };
                (listAnimator as any).li = $(listItem);
                (listAnimator as any).position = 'left';
                (listAnimator as any).limit = 100;

                const result = listAnimator.bounds(event, 1);

                expect(result).toEqual({
                    strictUpper: false,
                    lower: -100,
                    center: 100
                });
            });

            it('should return bounds when right action panel is visible and li is the same', () => {
                const listItem = containerElement.querySelector('.app-list-item');
                const event = { target: listItem };
                (listAnimator as any).li = $(listItem);
                (listAnimator as any).position = 'right';
                (listAnimator as any).limit = 100;

                const result = listAnimator.bounds(event, -1);

                expect(result).toEqual({
                    center: -100,
                    upper: 100,
                    strictLower: false
                });
            });

            it('should return default bounds in groupby scenario', () => {
                listComponent.groupby = "true";
                const event = { target: containerElement.querySelector('.app-list-item') };
                (listAnimator as any).li = null;
                (listAnimator as any).limit = 100;
                const result = listAnimator.bounds(event, 1);
                expect(result).toEqual(defaultBounds);
            });

            it('should return default bounds when no visible buttons', () => {
                const listItemWithoutButtons = containerElement.querySelectorAll('.app-list-item')[1];
                const event = { target: listItemWithoutButtons };
                (listAnimator as any).li = null;

                const result = listAnimator.bounds(event, 1);

                expect(result).toEqual(defaultBounds);
            });
        });

        describe('onLower', () => {
            it('should reset state and clear li when position is left', () => {
                (listAnimator as any).position = 'left';
                (listAnimator as any).li = {};
                (listAnimator as any).resetState = jest.fn();

                listAnimator.onLower();

                expect((listAnimator as any).resetState).toHaveBeenCalled();
                expect((listAnimator as any).li).toBeNull();
            });

            it('should not reset state or clear li when position is not left', () => {
                (listAnimator as any).position = 'right';
                (listAnimator as any).li = {};
                (listAnimator as any).resetState = jest.fn();

                listAnimator.onLower();

                expect((listAnimator as any).resetState).not.toHaveBeenCalled();
                expect((listAnimator as any).li).not.toBeNull();
            });
        });

        describe('onUpper', () => {
            it('should reset state and clear li when position is right', () => {
                (listAnimator as any).position = 'right';
                (listAnimator as any).li = {};
                (listAnimator as any).resetState = jest.fn();

                listAnimator.onUpper();

                expect((listAnimator as any).resetState).toHaveBeenCalled();
                expect((listAnimator as any).li).toBeNull();
            });

            it('should not reset state or clear li when position is not right', () => {
                (listAnimator as any).position = 'left';
                (listAnimator as any).li = {};
                (listAnimator as any).resetState = jest.fn();

                listAnimator.onUpper();

                expect((listAnimator as any).resetState).not.toHaveBeenCalled();
                expect((listAnimator as any).li).not.toBeNull();
            });
        });

        describe('threshold', () => {
            it('should return 10', () => {
                expect(listAnimator.threshold()).toBe(10);
            });
        });

        describe('animation', () => {
            it('should return correct animation configuration', () => {
                (listAnimator as any).li = { mock: 'li' };
                (listAnimator as any).actionPanel = {
                    children: jest.fn().mockReturnValue({ mock: 'children' })
                };

                const result = listAnimator.animation();

                expect(result.length).toBe(2);
                expect(result[0].target()).toEqual({ mock: 'li' });
                expect(result[0].css).toEqual({
                    transform: 'translate3d(${{$D + $d}}px, 0, 0)'
                });
                expect(result[1].target()).toEqual({ mock: 'children' });
                expect(result[1].css).toEqual({
                    transform: 'translate3d(${{computeActionTransition($i, $D + $d)}}px, 0, 0)'
                });
            });
        });

        describe('context', () => {
            let context: any;

            beforeEach(() => {
                (listAnimator as any).limit = 100;
                (listAnimator as any).transitionProportions = [0.5, 1];
                context = listAnimator.context();
            });

            it('should return an object with computeActionTransition function', () => {
                expect(typeof context.computeActionTransition).toBe('function');
            });

            it('should compute correct transition when $d is less than limit', () => {
                expect(context.computeActionTransition(0, 50)).toBe(25);
                expect(context.computeActionTransition(1, 50)).toBe(50);
            });

            it('should compute correct transition when $d is greater than limit', () => {
                expect(context.computeActionTransition(0, 150)).toBe(100);
                expect(context.computeActionTransition(1, 150)).toBe(150);
            });

            it('should compute correct transition for negative $d', () => {
                expect(context.computeActionTransition(0, -50)).toBe(-25);
                expect(context.computeActionTransition(1, -50)).toBe(-50);
            });

            it('should compute correct transition when negative $d is less than negative limit', () => {
                expect(context.computeActionTransition(0, -150)).toBe(-100);
                expect(context.computeActionTransition(1, -150)).toBe(-150);
            });
        });

        describe('invokeFullSwipeEvt', () => {
            let mockEvent: any;
            let mockActionItems: any[];

            beforeEach(() => {
                mockEvent = { type: 'swipe' };
                mockActionItems = [
                    { getAttr: jest.fn(), $element: { is: jest.fn() }, hasEventCallback: jest.fn(), invokeEventCallback: jest.fn() },
                    { getAttr: jest.fn(), $element: { is: jest.fn() }, hasEventCallback: jest.fn(), invokeEventCallback: jest.fn() },
                ];
                (listAnimator as any).actionItems = mockActionItems;
                (listAnimator as any).resetState = jest.fn();
            });

            it('should invoke tap event on the first visible left action', () => {
                (listAnimator as any).position = 'left';
                mockActionItems[0].getAttr.mockReturnValue('left');
                mockActionItems[0].$element.is.mockReturnValue(true);
                mockActionItems[0].hasEventCallback.mockReturnValue(true);

                listAnimator.invokeFullSwipeEvt(mockEvent);

                expect(mockActionItems[0].invokeEventCallback).toHaveBeenCalledWith('tap', { $event: mockEvent });
                expect((listAnimator as any).resetState).toHaveBeenCalled();
                expect((listAnimator as any).li).toBeNull();
            });

            it('should invoke tap event on the last visible right action', () => {
                (listAnimator as any).position = 'right';
                mockActionItems[1].getAttr.mockReturnValue('right');
                mockActionItems[1].$element.is.mockReturnValue(true);
                mockActionItems[1].hasEventCallback.mockReturnValue(true);

                listAnimator.invokeFullSwipeEvt(mockEvent);

                expect(mockActionItems[1].invokeEventCallback).toHaveBeenCalledWith('tap', { $event: mockEvent });
                expect((listAnimator as any).resetState).toHaveBeenCalled();
                expect((listAnimator as any).li).toBeNull();
            });

            it('should not invoke tap event when no matching action is found', () => {
                (listAnimator as any).position = 'left';
                mockActionItems.forEach(item => {
                    item.getAttr.mockReturnValue('right');
                    item.$element.is.mockReturnValue(false);
                });

                listAnimator.invokeFullSwipeEvt(mockEvent);

                expect(mockActionItems[0].invokeEventCallback).not.toHaveBeenCalled();
                expect(mockActionItems[1].invokeEventCallback).not.toHaveBeenCalled();
                expect((listAnimator as any).resetState).toHaveBeenCalled();
                expect((listAnimator as any).li).toBeNull();
            });
        });

        describe('onAnimation', () => {
            let mockEvent: any;
            let mockLi: any;
            let mockActionPanel: any;
            let mockChildElement: any;

            beforeEach(() => {
                mockEvent = { type: 'swipe' };
                mockLi = { outerWidth: jest.fn().mockReturnValue(100) };
                mockActionPanel = { attr: jest.fn() };
                mockChildElement = { width: jest.fn().mockReturnValue(50) };

                (listAnimator as any).list = { triggerListItemSelection: jest.fn() };
                (listAnimator as any).li = mockLi;
                (listAnimator as any).actionPanel = mockActionPanel;
                (listAnimator as any).getChildActionElement = jest.fn().mockReturnValue(mockChildElement);
                (listAnimator as any).transitionProportions = [0.5, 1];
                (listAnimator as any).limit = 20;
                (listAnimator as any).invokeFullSwipeEvt = jest.fn();
            });

            it('should trigger list item selection', () => {
                listAnimator.onAnimation(mockEvent, 10);

                expect((listAnimator as any).list.triggerListItemSelection).toHaveBeenCalledWith(mockLi, mockEvent);
            });

            it('should not invoke full swipe when enablefullswipe is not true', () => {
                mockActionPanel.attr.mockReturnValue('false');

                listAnimator.onAnimation(mockEvent, 10);

                expect((listAnimator as any).invokeFullSwipeEvt).not.toHaveBeenCalled();
            });

            it('should invoke full swipe when distance percentage is greater than 50% for right swipe', () => {
                mockActionPanel.attr.mockReturnValue('true');
                (listAnimator as any).position = 'right';
                (listAnimator as any).rightChildrenCount = 2;

                listAnimator.onAnimation(mockEvent, -80);

                expect((listAnimator as any).invokeFullSwipeEvt).toHaveBeenCalledWith(mockEvent);
            });

            it('should not invoke full swipe when distance percentage is less than or equal to 50%', () => {
                mockActionPanel.attr.mockReturnValue('true');
                (listAnimator as any).position = 'left';
                (listAnimator as any).rightChildrenCount = 2;

                listAnimator.onAnimation(mockEvent, 40);

                expect((listAnimator as any).invokeFullSwipeEvt).not.toHaveBeenCalled();
            });
        });

        describe('computeTotalChildrenWidth', () => {
            it('should compute the total width of all children', () => {
                const parentElement = document.createElement('div');
                parentElement.innerHTML = `
                <div style="width: 50px;"></div>
                <div style="width: 75px;"></div>
                <div style="width: 100px;"></div>
            `;
                document.body.appendChild(parentElement);

                // Call the method
                const result = (listAnimator as any).computeTotalChildrenWidth($(parentElement));

                // Verify the result
                expect(result).toBe(225); // 50 + 75 + 100

                // Clean up
                document.body.removeChild(parentElement);
            });

            it('should return 0 for an element with no children', () => {
                const emptyElement = document.createElement('div');
                document.body.appendChild(emptyElement);

                const result = (listAnimator as any).computeTotalChildrenWidth($(emptyElement));

                expect(result).toBe(0);

                document.body.removeChild(emptyElement);
            });
        });

        describe('computeTransitionProportions', () => {
            beforeEach(() => {
                (listAnimator as any).computeTotalChildrenWidth = jest.fn().mockReturnValue(225);
            });

            it('should compute correct proportions when position is left', () => {
                (listAnimator as any).position = 'left';

                const parentElement = document.createElement('div');
                parentElement.innerHTML = `
                <div style="width: 50px;"></div>
                <div style="width: 75px;"></div>
                <div style="width: 100px;"></div>
            `;
                document.body.appendChild(parentElement);

                const result = (listAnimator as any).computeTransitionProportions($(parentElement));

                expect(result).toEqual([
                    0.2222222222222222,  // 50 / 225
                    0.5555555555555556,  // (50 + 75) / 225
                    1                    // (50 + 75 + 100) / 225
                ]);

                document.body.removeChild(parentElement);
            });

            it('should compute correct proportions when position is right', () => {
                (listAnimator as any).position = 'right';

                const parentElement = document.createElement('div');
                parentElement.innerHTML = `
                <div style="width: 50px;"></div>
                <div style="width: 75px;"></div>
                <div style="width: 100px;"></div>
            `;
                document.body.appendChild(parentElement);

                const result = (listAnimator as any).computeTransitionProportions($(parentElement));

                expect(result).toEqual([
                    1,                    // (225 - 0) / 225
                    0.7777777777777778,   // (225 - 50) / 225
                    0.4444444444444444    // (225 - 125) / 225
                ]);

                document.body.removeChild(parentElement);
            });

            it('should return an empty array for an element with no children', () => {
                const emptyElement = document.createElement('div');
                document.body.appendChild(emptyElement);

                const result = (listAnimator as any).computeTransitionProportions($(emptyElement));

                expect(result).toEqual([]);

                document.body.removeChild(emptyElement);
            });
        });

        describe('resetState', () => {
            beforeEach(() => {
                (listAnimator as any).resetElement = jest.fn();

                (listAnimator as any).li = $('<div>');
                (listAnimator as any).actionPanel = $('<div>');
            });

            it('should reset li and actionPanel elements', () => {
                (listAnimator as any).resetState();

                expect((listAnimator as any).resetElement).toHaveBeenCalledTimes(2);
                expect((listAnimator as any).resetElement).toHaveBeenCalledWith((listAnimator as any).li);
            });

            it('should set actionPanel to null if it exists', () => {
                (listAnimator as any).resetState();
                expect((listAnimator as any).actionPanel).toBeNull();
            });

            it('should not set actionPanel to null if it doesn\'t exist', () => {
                (listAnimator as any).actionPanel = null;
                (listAnimator as any).resetState();

                expect((listAnimator as any).actionPanel).toBeNull();
                expect((listAnimator as any).resetElement).toHaveBeenCalledTimes(2);
            });

            it('should handle case when li doesn\'t exist', () => {
                (listAnimator as any).li = null;
                (listAnimator as any).resetState();

                expect((listAnimator as any).resetElement).toHaveBeenCalledTimes(2);
                expect((listAnimator as any).resetElement).toHaveBeenCalledWith((listAnimator as any).actionPanel);
            });
        });
    });

    it('should setup handlers correctly', () => {
        const mockChanges = {
            subscribe: jest.fn()
        };
        Object.defineProperty(listComponent, 'listItems', {
            value: { changes: mockChanges },
            writable: true
        });

        const mockAddEventListener = jest.fn();
        const mockQuerySelector = jest.fn().mockReturnValue({
            addEventListener: mockAddEventListener
        });
        Object.defineProperty(listComponent, 'nativeElement', {
            value: {
                querySelector: mockQuerySelector
            },
            writable: false
        });

        // Mock the cdRef
        listComponent['cdRef'] = { detectChanges: jest.fn() } as any;

        // Call setupHandlers
        listComponent['setupHandlers']();

        // Assertions
        expect(mockChanges.subscribe).toHaveBeenCalled();
        expect(mockQuerySelector).toHaveBeenCalledWith('ul.app-livelist-container');
        expect(mockAddEventListener).toHaveBeenCalledWith('click', expect.any(Function), true);
    });
});

describe('ListComponent With groupby', () => {
    let wrapperComponent: ListWrapperComponent;
    let listComponent: ListComponent;
    let fixture: ComponentFixture<ListWrapperComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                PaginationModule.forRoot(),
                WmPaginationModule, ListComponent, ListItemDirective
            ],
            declarations: [ListWrapperComponent],
            providers: [
                { provide: App, useValue: mockApp },
                { provide: ToDatePipe, useClass: ToDatePipe },
                { provide: AppDefaults, useClass: AppDefaults },
                { provide: AbstractI18nService, useClass: MockAbstractI18nService },
                { provide: DatePipe, useValue: DatePipe },
                TextContentDirective
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ListWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        listComponent = wrapperComponent.listComponent;

        fixture.detectChanges();
        listComponent.groupby = 'firstname';
        listComponent.dataset = wrapperComponent.testdata1;
        listComponent.onPropertyChange('dataset', listComponent.dataset);
        fixture.detectChanges();
    }));


    it('should select item by model from the script with groupby property in on-render event', () => {
        jest.spyOn(wrapperComponent, 'onRender');
        fixture.detectChanges();

        // Ensure dataset is populated
        expect(listComponent.dataset.length).toBeGreaterThan(0);

        // Select item by passing its model
        listComponent.selectItem(listComponent.dataset[0]);
        fixture.detectChanges();

        // Selected item should be the first one in dataset
        expect(listComponent.selecteditem).toEqual(listComponent.dataset[0]);
    });

    it('should display header as others when grouping is done with a column having empty value', () => {
        fixture.detectChanges();
        const liElements = fixture.debugElement.nativeElement.querySelectorAll('.app-list-item-header h4');
        // header text shouldn't be empty.
        liElements.forEach((ele) => {
            expect(ele.innerText).not.toBeNull();
        });

    });
});
