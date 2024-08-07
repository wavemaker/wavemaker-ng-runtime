import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractI18nService, App, AppDefaults, setPipeProvider } from '@wm/core';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ListComponent } from './list.component';
import { ListItemDirective } from './list-item.directive';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { PipeProvider } from '../../../../../runtime-base/src/services/pipe-provider.service';
import { PaginationModule as WmPaginationModule } from '@wm/components/data/pagination';
import { WmComponentsModule, ToDatePipe } from '@wm/components/base';
import { MockAbstractI18nService } from 'projects/components/base/src/test/util/date-test-util';
import { DatePipe } from '@angular/common';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';


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
    onBeforeRender(widget, $data) {
        console.log('calling on before render');
    }

    onRender(widget, $data) {
        console.log('calling on render');
    }

    onListClick($event, widget) {
        console.log('clicked list component ')
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
                { provide: DatePipe, useValue: DatePipe }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ListWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        listComponent = wrapperComponent.listComponent;

        fixture.detectChanges();
        listComponent.dataset = wrapperComponent.testdata;
        listComponent.onPropertyChange('dataset', listComponent.dataset);
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
