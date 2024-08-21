import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractI18nService, App, AppDefaults, DataSource, PartialRefProvider, setPipeProvider } from '@wm/core';
import { Component, QueryList, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ListComponent } from './list.component';
import { ListItemDirective } from './list-item.directive';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { PipeProvider } from '../../../../../runtime-base/src/services/pipe-provider.service';
import { PaginationModule as WmPaginationModule } from '@wm/components/data/pagination';
import { WmComponentsModule, ToDatePipe, NAVIGATION_TYPE } from '@wm/components/base';
import { MockAbstractI18nService } from 'projects/components/base/src/test/util/date-test-util';
import { DatePipe } from '@angular/common';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { configureDnD } from '@wm/components/base';
import { isMobile, isMobileApp } from '@wm/core';  
import { ComponentRefProviderService } from 'projects/runtime-dynamic/src/app/services/component-ref-provider.service';
import { AppResourceManagerService } from '@wm/runtime/dynamic';

const testdata: any = [{ name: 'Peter', age: 21 }, { name: 'Tony', age: 42 }];


jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    isMobile: jest.fn(),
    isMobileApp: jest.fn(),
}));

jest.mock('@wm/components/base', () => ({
    ...jest.requireActual('@wm/components/base'),
    configureDnD: jest.fn(),
}));

@Component({
    template: `
          <div wmList wmLiveActions  listclass="list-group" itemclass="list-group-item" template="true" template-name="Action List" itemsperrow="xs-1 sm-1 md-1 lg-1" class="media-list" statehandler="URL" name="NameDataList1" dataset.bind="testdata" navigation="Basic" datasource={{testdata}}>
                <ng-template #listTemplate let-item="item" let-$index="$index" let-itemRef="itemRef" let-$first="$first" let-$last="$last"  let-currentItemWidgets="currentItemWidgets" >
                    <div wmContainer partialContainer wmSmoothscroll="false"  class="media-left" name="container4">
                        <img wmPicture #wm_picture4="wmPicture" alt="image" wmImageCache="true" [attr.aria-label]="wm_picture4.hint || 'Image'"  width="32pt" height="32pt" name="Picture" shape="circle" picturesource.bind="item.name" class="media-object">
                    </div>
                    <div wmContainer partialContainer wmSmoothscroll="false"  class="media-body" name="container5" paddingleft="1.25em">
                        <p wmLabel #wm_label8="wmLabel" [attr.aria-label]="wm_label8.hint"  name="Name" class="p media-heading" caption.bind="item.name" fontsize="1.143" fontunit="em" type="p"></p>
                        <p wmLabel #wm_label9="wmLabel" [attr.aria-label]="wm_label9.hint"  name="JobTitle" caption.bind="item.age" class="p text-muted" type="p"></p>
                    </div>
                    <div wmContainer partialContainer wmSmoothscroll="false"  class="media-right media-top" name="container6">
                        <button wmButton #wm_button5="wmButton" [attr.aria-label]="wm_button5.hint || wm_button5.caption || null"  type="button" class="btn-transparent" iconclass="wi wi-share fa-2x" name="button2"></button>
                    </div>
                </ng-template>
            </div>
    `
})
class ListWrapperComponent {
    @ViewChild(ListComponent, /* TODO: add static flag */ { static: true })
    listComponent: ListComponent;
    public testdata1: any = [{ firstname: 'Peter', id: 1 }, { firstname: '', id: 2 }];
    onBeforeRender(widget, $data) {
        // console.log('calling on before render');
    }

    onRender(widget, $data) {
        // console.log('calling on render');
    }

    onListClick($event, widget) {
        // console.log('clicked list component ')
    }

    constructor(_pipeProvider: PipeProvider) {
        setPipeProvider(_pipeProvider);
    }
}

describe('ListComponent', () => {
    let wrapperComponent: ListWrapperComponent;
    let listComponent: ListComponent;
    let fixture: ComponentFixture<ListWrapperComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                PaginationModule.forRoot(),
                WmPaginationModule,
                WmComponentsModule.forRoot()
            ],
            declarations: [ListWrapperComponent, ListComponent, ListItemDirective],
            providers: [
                { provide: App, useValue: mockApp },
                { provide: ToDatePipe, useClass: ToDatePipe },
                { provide: AppDefaults, useClass: AppDefaults },
                { provide: AbstractI18nService, useClass: MockAbstractI18nService },
                { provide: DatePipe, useValue: DatePipe },
                { provide: PartialRefProvider, useClass: ComponentRefProviderService },
                AppResourceManagerService
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ListWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        listComponent = wrapperComponent.listComponent;
        fixture.detectChanges();
        listComponent.dataset = testdata;
        listComponent.onPropertyChange('dataset', listComponent.dataset);
        listComponent.groupby = ""
        expect(fixture).toMatchSnapshot();
    }));

    it('should create the List Component', () => {
        fixture.detectChanges();
        expect(wrapperComponent).toBeTruthy();
    });

    xit('should apply list class to ul element', () => {
        const listclass = 'my-list-class';
        listComponent.listclass = listclass;
        fixture.detectChanges();
        const ulElem = fixture.debugElement.query(By.css('ul.app-livelist-container'));
        expect(ulElem.nativeElement.classList).toContain(listclass);
    });

    it('should apply list-item class to li element', () => {
        const itemclass = 'my-listitem-class';
        listComponent.itemclass = itemclass;
        fixture.detectChanges();
        const liElem = fixture.debugElement.query(By.directive(ListItemDirective));
        expect(liElem.nativeElement.classList).toContain(itemclass);
    });

    it('should select first item & first li should have "active" class applied', () => {
        listComponent.selectfirstitem = true;
        fixture.detectChanges();

        // selected item should be the first one in dataset
        expect(listComponent.selecteditem).toEqual(listComponent.dataset[0]);
        // active class to be applied on the first element
        const liElem = fixture.debugElement.query(By.directive(ListItemDirective));
        expect(liElem.nativeElement.classList).toContain('active');
    });

    it('should apply disable-item class to li element', () => {
        listComponent.disableitem = true;
        fixture.detectChanges();
        const liElem = fixture.debugElement.query(By.directive(ListItemDirective));
        expect(liElem.nativeElement.classList).toContain('disable-item');
        // the click handler should not be called on disabling the item
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
        jest.spyOn(wrapperComponent, 'onRender');
        fixture.detectChanges();

        expect(wrapperComponent.onRender).toHaveBeenCalledTimes(1);
        // select item by passing index
        listComponent.selectItem(1);
        fixture.detectChanges();

        // selected item should be the second one in dataset
        expect(listComponent.selecteditem).toEqual(listComponent.dataset[1]);
    });

    it('should render items depending on the page size provided', (done) => {
        jest.spyOn(wrapperComponent, 'onRender');
        listComponent.setProperty('pagesize', 1);
        fixture.detectChanges();
        expect(wrapperComponent.onRender).toHaveBeenCalledTimes(1);

        // 1 item should be selected
        setTimeout(() => {
            expect(listComponent.fieldDefs.length).toEqual(1);
            done();
        }, 1000);
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

    it('should apply pagination type as classic', () => {
        listComponent.navigation = 'Classic';
        jest.spyOn(listComponent, 'onPropertyChange');
        listComponent.onPropertyChange('navigation', 'Classic');
        fixture.detectChanges();
        const paginationElem = fixture.debugElement.query(By.css('.advanced'));
        expect(paginationElem).toBeTruthy();
    });

    it('should apply pagination type as basic', () => {
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

    it('should apply pagination type as advanced', () => {
        listComponent.navigation = 'Advanced';
        jest.spyOn(listComponent, 'onPropertyChange');
        listComponent.onPropertyChange('navigation', 'Advanced');
        fixture.detectChanges();
        const paginationElem = fixture.debugElement.query(By.css('.pagination'));
        expect(paginationElem).toBeTruthy();
    });

    it('should apply pagination type as pager', () => {
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
            expect(listComponent.lastSelectedItem).toBeUndefined();
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
        it('should set appendTo to parent if height attribute is present', () => {
            jest.spyOn(listComponent, 'getAttr').mockReturnValue('100px');
            (isMobileApp as jest.Mock).mockReturnValue(false);

            listComponent['configureDnD']();

            expect(configureDnD).toHaveBeenCalledWith(
                expect.anything(),
                { appendTo: 'parent' },
                expect.any(Function),
                expect.any(Function),
                expect.any(Function)
            );
        });

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

        it('should set appendTo to body by default', () => {
            jest.spyOn(listComponent, 'getAttr').mockReturnValue(null);
            (isMobileApp as jest.Mock).mockReturnValue(false);

            listComponent['configureDnD']();

            expect(configureDnD).toHaveBeenCalledWith(
                expect.anything(),
                { appendTo: 'body' },
                expect.any(Function),
                expect.any(Function),
                expect.any(Function)
            );
        });

        it('should handle touchstart event on mobile app', () => {
            (isMobileApp as jest.Mock).mockReturnValue(true);
            const touchstartEvent = $.Event('touchstart', { cancelable: true });
            const touchendEvent = $.Event('touchend');
            const touchmoveEvent = $.Event('touchmove');
            const sortableSpy = jest.fn();
            //@ts-ignore
            $.fn.sortable = sortableSpy;

            listComponent['configureDnD']();

            // Simulate touchstart event
            (listComponent as any).$ulEle.trigger(touchstartEvent);

            // Verify touchstart behavior
            expect((listComponent as any).$ulEle.hasClass('no-selection')).toBe(false);
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

    it('should setup handlers correctly', () => {
        // Mock the listItems
        const mockChanges = {
            subscribe: jest.fn()
        };
        Object.defineProperty(listComponent, 'listItems', {
            value: { changes: mockChanges },
            writable: true
        });

        // Mock the nativeElement and its querySelector method
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
                WmPaginationModule,
                WmComponentsModule.forRoot()
            ],
            declarations: [ListWrapperComponent, ListComponent, ListItemDirective],
            providers: [
                { provide: App, useValue: mockApp },
                { provide: ToDatePipe, useClass: ToDatePipe },
                { provide: AppDefaults, useClass: AppDefaults },
                { provide: AbstractI18nService, useClass: MockAbstractI18nService },
                { provide: DatePipe, useValue: DatePipe }
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
