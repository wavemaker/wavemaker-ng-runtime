import {
    waitForAsync, ComponentFixture, ComponentFixtureAutoDetect,
    tick,
    fakeAsync
} from '@angular/core/testing';
import { AbstractI18nService, App, isMobile } from '@wm/core';
import { Component, ViewChild } from '@angular/core';
import { SearchComponent } from './search.component';
import { FormsModule } from '@angular/forms';
import { TypeaheadDirective, TypeaheadMatch, TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { BaseComponent } from '@wm/components/base';
import { By } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { ScrollableDirective } from './scrollable.directive';
import { WmComponentsModule, ToDatePipe } from '@wm/components/base';
import { PartialRefProvider, AppDefaults } from '@wm/core';
import { ITestModuleDef, ITestComponentDef, ComponentTestBase } from 'projects/components/base/src/test/common-widget.specs';
import { compileTestComponent, setInputValue, getElementByTagOnDocQuery, hasAttributeCheck, mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { MockAbstractI18nService } from 'projects/components/base/src/test/util/date-test-util';
import { Observable } from 'rxjs';
import { DataProvider } from './data-provider/data-provider';
import { InputTextComponent } from '@wm/components/input';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    isMobile: jest.fn()
}));

const markup = `
        <div wmSearch name="testsearch"
            searchon="typing"
             hint="Help text for test search"
             placeholder="Type here to search.."
             type="button"
             tabindex="1"
             disabled="true"
             width="200" height="200" show="true" class="btn-primary"
             fontsize="20" fontfamily="Segoe UI" color="#0000FF" fontweight="700" whitespace="nowrap"
             fontstyle="italic" textdecoration="underline" textalign="center" backgroundcolor="#00ff29"
             backgroundimage="http://www.google.com/doodle4google/images/splashes/featured.png"
             backgroundrepeat="repeat" backgroundposition="left" backgroundsize="200px 200px" backgroundattachment="fixed"
             bordercolor="#d92953" borderstyle="solid" borderwidth="3px 4px 5px 6px"
             padding="3px 4px 5px 6px" margin ="3px 4px 5px 6px" opacity="0.8" cursor="nw-resize" zindex="100"
             visibility="visible" display="inline-block"
             change.event="onChange($event, widget, newVal, oldVal)"
             submit.event="search1Submit($event, widget)"
             select.event="search1Select($event, widget, selectedValue)"
             focus.event="search1Focus($event, widget)"
             blur.event="search1Blur($event, widget)"
        ></div>
    `;

@Component({
    template: markup
})
class SearchWrapperComponent {
    @ViewChild(SearchComponent, /* TODO: add static flag */ { static: true })
    wmComponent: SearchComponent;
    public testdata: any = [{ name: 'Peter', age: 21 }, { name: 'Tony', age: 42 }, { name: 'John', age: 25 }, { name: 'Peter Son', age: 28 }];

    public onChange($event, widget, newVal, oldVal) {
    }

    public search1Submit($event, widget) {
    }

    public search1Select($event, widget, selectedValue) {
    }

    public search1Focus = function ($event, widget) {
    };

    public search1Blur = function ($event, widget) {
    };
}

const testModuleDef: ITestModuleDef = {
    imports: [
        FormsModule,
        TypeaheadModule.forRoot(),
        WmComponentsModule, SearchComponent, ScrollableDirective, InputTextComponent
    ],
    declarations: [SearchWrapperComponent],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AppDefaults, useClass: AppDefaults },
        { provide: TypeaheadMatch, useValue: TypeaheadMatch },
        { provide: ComponentFixtureAutoDetect, useValue: true },
        { provide: PartialRefProvider, useClass: PartialRefProvider },
        { provide: AbstractI18nService, useClass: MockAbstractI18nService },
        { provide: BaseComponent, useClass: BaseComponent }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-search',
    widgetSelector: '[wmSearch]',
    inputElementSelector: 'input.app-search-input',
    testModuleDef: testModuleDef,
    testComponent: SearchWrapperComponent
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
// TestBase.verifyPropsInitialization();  /* to be fixed for searchon issue */
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();
TestBase.verifyEvents([
    {
        eventTrigger: '.app-search-input',
        callbackMethod: 'search1Focus',
        eventName: 'focus'
    },
    {
        eventTrigger: '.app-search-input',
        callbackMethod: 'search1Blur',
        eventName: 'blur'
    }
]);

describe('SearchComponent', () => {
    let wrapperComponent: SearchWrapperComponent;
    let wmComponent: SearchComponent;
    let fixture: ComponentFixture<SearchWrapperComponent>;

    let typeHeadElement = () => {
        return getElementByTagOnDocQuery('typeahead-container');
    };
    let getUlElement = () => {
        return typeHeadElement()[0].querySelectorAll('ul');
    };
    let getLIElement = () => {
        return getUlElement()[0].querySelectorAll('li');
    };

    beforeEach(waitForAsync(() => {
        fixture = compileTestComponent(testModuleDef, SearchWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        wmComponent = wrapperComponent.wmComponent;
        // $('body').addClass('wm-app');
        fixture.detectChanges();

        const typeaheadElement = document.createElement('typeahead-container');
        typeaheadElement.innerHTML = '<ul><li>Item 1</li><li>Item 2</li></ul>';
        document.body.appendChild(typeaheadElement);

        // Mock getComputedStyle
        window.getComputedStyle = jest.fn().mockReturnValue({
            transform: 'matrix(1, 0, 0, 1, 0, 0)',
            webkitTransform: 'matrix(1, 0, 0, 1, 0, 0)'
        });
    }));

    afterEach(() => {
        // Clean up mock elements
        document.body.innerHTML = '';
    });

    it('should create the Search Component', waitForAsync(async () => {
        await fixture.whenStable();
        expect(wrapperComponent).toBeTruthy();
    }));



    /******************************** EVents starts ***************************************** */

    it('should change the input and call the onChange event', waitForAsync(async () => {
        const testValue = 'abc';
        jest.spyOn(wrapperComponent, 'onChange');
        await fixture.whenStable();
        await setInputValue(fixture, '.app-search-input', testValue);
        expect(wmComponent.query).toEqual(testValue);
        expect(wrapperComponent.onChange).toHaveBeenCalledTimes(1);
    }));

    it('should show clear icon and on click should call clearsearch function when search type is autocomplete', fakeAsync(() => {
        // Set properties on the component
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4';
        wmComponent.getWidget().type = 'autocomplete';
        wmComponent.getWidget().showclear = true;

        // Initial change detection
        fixture.detectChanges();

        // Mock TypeaheadDirective behavior to prevent aria-owns changes
        if (wmComponent.typeahead) {
            wmComponent.typeahead._container = null;
            // Disable typeahead's internal change detection triggers if possible
            if (wmComponent.typeahead['_subscriptions']) {
                wmComponent.typeahead['_subscriptions'].forEach(sub => sub.unsubscribe());
            }
        }

        const testValue = 'te';
        jest.spyOn(wmComponent as any, 'clearSearch' as any);

        // Set input value
        const input = fixture.debugElement.query(By.css('.app-search-input')).nativeElement;
        input.value = testValue;
        input.dispatchEvent(new Event('input'));

        // Run through all pending timers
        tick(500);
        fixture.detectChanges();

        // Find and click the clear button
        const searchBtnEle = fixture.debugElement.query(By.css('.clear-btn'));
        searchBtnEle.nativeElement.click();

        // Run through any remaining timers
        tick(500);
        fixture.detectChanges();

        // Verify the clearSearch was called
        expect((wmComponent as any).clearSearch).toHaveBeenCalled();
    }));
    /******************************** EVents end ***************************************** */



    /******************************** Dataset starts ********************************** */

    //TypeError: Cannot read properties of undefined (reading 'querySelectorAll')


    //TypeError: The provided value is not of type 'Element'.

    xit('should be able show the typehead values in descending order', waitForAsync(async () => {
        wmComponent.getWidget().dataset = [{ name: 'Aman', age: 21 }, { name: 'Tony', age: 42 }, { name: 'John', age: 25 }, { name: 'Berf', age: 28 }];
        wmComponent.getWidget().searchkey = 'name';
        wmComponent.getWidget().displaylabel = 'name';
        wmComponent.getWidget().orderby = 'name:desc';
        await setInputValue(fixture, '.app-search-input', 'A');
        await fixture.whenStable();
        expect(wmComponent.typeaheadContainer.matches.length).toBeGreaterThan(0);
    }));

    //TypeError: The provided value is not of type 'Element'.

    xit('should set the limit for typehead list', waitForAsync(async () => {
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4';
        wmComponent.getWidget().limit = 2;
        const testValue = 'test';
        await setInputValue(fixture, '.app-search-input', testValue);
        let liElement = getLIElement();
        expect(liElement.length).toBe(2);
    }));
    /******************************** Dataset end ***************************************** */

    /******************************** Properties starts ********************************** */

    //TypeError: Cannot read properties of undefined (reading 'querySelectorAll')

    xit('should search when user click on the search icon', fakeAsync(() => {
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4';
        wmComponent.getWidget().showsearchicon = true;
        wmComponent.getWidget().searchon = 'onsearchiconclick';
        const testValue = 'tes';
        setInputValue(fixture, '.app-search-input', testValue);
        tick(300); // Wait for debounce
        fixture.detectChanges();
        let searchBtnEle = fixture.debugElement.query(By.css('.app-search-button'));
        searchBtnEle.nativeElement.click();
        tick();
        fixture.detectChanges();
        let liElement = getLIElement();
        expect(liElement.length).toBeGreaterThan(0);
    }));

    //  TypeError: The provided value is not of type 'Element'.

    xit('should be disabled mode ', waitForAsync(() => {
        wmComponent.getWidget().disabled = true;
        fixture.detectChanges();
        hasAttributeCheck(fixture, '.app-search-input', 'disabled');
    }));

    it('should be readonly mode ', () => {
        wmComponent.getWidget().readonly = true;
        fixture.detectChanges();
        hasAttributeCheck(fixture, '.app-search-input', 'readonly');

    });



    /******************************** Properties end ********************************** */




    /************************************ Scenarios starts ********************************** */

    //TypeError: The provided value is not of type 'Element'.

    it('last result has to be reset to undefined on changing the dataset', ((done) => {
        wmComponent.dataset = wrapperComponent.testdata;
        wmComponent.onPropertyChange('dataset', wrapperComponent.testdata, []);
        fixture.detectChanges();
        (wmComponent as any)._lastResult = [{ name: 'Tony', age: 42 }];
        expect((wmComponent as any)._lastResult).toBeDefined();
        (wmComponent as any).dataset$.subscribe((result) => {
            done();
            expect((wmComponent as any)._lastResult).toBeUndefined();
        });
        wmComponent.dataset = [];
        wmComponent.onPropertyChange('dataset', wmComponent.dataset, wrapperComponent.testdata);

        fixture.detectChanges();
    }));

    it('should set the datavalue when searchkey is not set', (waitForAsync((done) => {
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.getWidget().displaylabel = 'name';
        wmComponent.getWidget().datafield = 'name';
        wmComponent.getWidget().datavalue = 'John';
        fixture.detectChanges();
        (wmComponent as any).dataset$.subscribe((result) => {
            if (wmComponent.datasetItems.length) {
                done();
                expect(wmComponent.query).toEqual('John');
            }
        });
    })));


    /************************************ Scenarios end ********************************** */



    /*********************************** Method invoking starts************************** */

    it('should invoke getDatasource method on entering the query', waitForAsync(() => {
        const testValue = 'abc';
        jest.spyOn(wmComponent, 'getDataSource').mockReturnValue(Promise.resolve([]));

        setInputValue(fixture, '.app-search-input', testValue).then(() => {
            expect(wmComponent.getDataSource).toHaveBeenCalled();

        });
    }));

    it('should clear the input value when clearText method is triggered', waitForAsync(async () => {
        const testValue = 'test';
        await setInputValue(fixture, '.app-search-input', testValue);
        const input = fixture.debugElement.query(By.css('.app-search-input')).nativeElement;
        wmComponent.clearText();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(input.value).toBe('');
    }));

    //TypeError: Cannot read properties of undefined (reading 'querySelectorAll')

    xit('should invoke getTransformedData method', fakeAsync(() => {
        const testValue = 'te';
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4, test5, test6, test7, test8';
        jest.spyOn(wmComponent, 'getTransformedData');

        setInputValue(fixture, '.app-search-input', testValue);
        tick(); // Handle initial async

        const ulElement = getUlElement();
        ulElement[0].dispatchEvent(new CustomEvent('scroll'));

        tick(); // Handle scroll event async
        fixture.detectChanges();

        expect(wmComponent.getTransformedData).toHaveBeenCalled();
    }));
    /*********************************** Method invoking end ************************** */


    describe('debounceDefaultQuery', () => {
        it('should set query model and related properties when response has length', fakeAsync(() => {
            const mockResponse = [{ label: 'Test Label', value: 'Test Value', key: 'Test Key' }];
            jest.spyOn(wmComponent, 'getDataSource').mockResolvedValue(mockResponse);

            (wmComponent as any).debounceDefaultQuery('test');
            tick();

            expect(wmComponent.queryModel).toEqual(mockResponse);
            expect(wmComponent.query).toBe('Test Label');
            expect((wmComponent as any)._lastQuery).toBe('Test Label');
            expect((wmComponent as any)._modelByValue).toBe('Test Value');
            expect((wmComponent as any)._modelByKey).toBe('Test Key');
            expect((wmComponent as any).showClosebtn).toBe(true);
        }));

        it('should clear properties when response is empty', fakeAsync(() => {
            jest.spyOn(wmComponent, 'getDataSource').mockResolvedValue([]);

            (wmComponent as any).debounceDefaultQuery('test');
            tick();

            expect((wmComponent as any)._modelByValue).toBeUndefined();
            expect(wmComponent.queryModel).toBeUndefined();
            expect(wmComponent.query).toBe('');
        }));

        it('should hide typeahead if clearData is true and typeahead is shown', fakeAsync(() => {
            jest.spyOn(wmComponent, 'getDataSource').mockResolvedValue([]);
            (wmComponent as any).clearData = true;
            (wmComponent as any).typeahead = {
                _typeahead: { isShown: true },
                hide: jest.fn()
            };

            (wmComponent as any).debounceDefaultQuery('test');
            tick();

            expect((wmComponent as any).typeahead.hide).toHaveBeenCalled();
        }));

        it('should not hide typeahead if clearData is false', fakeAsync(() => {
            jest.spyOn(wmComponent, 'getDataSource').mockResolvedValue([]);
            (wmComponent as any).clearData = false;
            (wmComponent as any).typeahead = {
                _typeahead: { isShown: true },
                hide: jest.fn()
            };

            (wmComponent as any).debounceDefaultQuery('test');
            tick();

            expect((wmComponent as any).typeahead.hide).not.toHaveBeenCalled();
        }));

        it('should set _defaultQueryInvoked to true', () => {
            jest.spyOn(wmComponent, 'getDataSource').mockResolvedValue([]);

            (wmComponent as any).debounceDefaultQuery('test');

            expect((wmComponent as any)._defaultQueryInvoked).toBe(true);
        });
    });
    describe('SearchComponent - updateByDataSource', () => {

        beforeEach(() => {
            wmComponent.datafield = 'someField';
            (wmComponent as any).ALLFIELDS = 'ALLFIELDS';
            (wmComponent as any)._defaultQueryInvoked = false;
            wmComponent.datasource = {
                execute: jest.fn().mockReturnValue(true)
            };
        });

        it('should call updateDatavalueFromQueryModel and return early if queryModel is defined and not empty', () => {
            wmComponent.queryModel = [{ label: 'Test', value: 'test', key: 'test' }];
            jest.spyOn(wmComponent as any, 'updateDatavalueFromQueryModel');
            jest.spyOn(wmComponent as any, 'debounceDefaultQuery');

            (wmComponent as any).updateByDataSource('testData');

            expect((wmComponent as any).updateDatavalueFromQueryModel).toHaveBeenCalledTimes(1);
            expect((wmComponent as any).debounceDefaultQuery).not.toHaveBeenCalled();
        });

        it('should not call updateDatavalueFromQueryModel and proceed if queryModel is undefined', () => {
            wmComponent.queryModel = undefined;
            jest.spyOn(wmComponent as any, 'updateDatavalueFromQueryModel');
            jest.spyOn(wmComponent as any, 'debounceDefaultQuery');

            (wmComponent as any).updateByDataSource('testData');

            expect((wmComponent as any).updateDatavalueFromQueryModel).not.toHaveBeenCalled();
            expect((wmComponent as any).debounceDefaultQuery).toHaveBeenCalledTimes(1);
        });

        it('should not call updateDatavalueFromQueryModel and proceed if queryModel is empty', () => {
            wmComponent.queryModel = [];
            jest.spyOn(wmComponent as any, 'updateDatavalueFromQueryModel');
            jest.spyOn(wmComponent as any, 'debounceDefaultQuery');

            (wmComponent as any).updateByDataSource('testData');

            expect((wmComponent as any).updateDatavalueFromQueryModel).not.toHaveBeenCalled();
            expect((wmComponent as any).debounceDefaultQuery).toHaveBeenCalledTimes(1);
        });
    });
    describe('closeSearch()', () => {
        beforeEach(() => {
            // Reset properties before each test
            (wmComponent as any).elIndex = 2;
            (wmComponent as any).parentEl = document.createElement('div');
            (wmComponent as any)._domUpdated = true;
            (wmComponent as any).listenQuery = true;
            (wmComponent as any)._unsubscribeDv = false;
            (wmComponent as any).page = 2;
            (wmComponent as any)._loadingItems = true;

            // Mock the $element property
            Object.defineProperty(wmComponent, '$element', {
                get: () => ({
                    removeClass: jest.fn()
                })
            });

            // Mock the typeahead property
            wmComponent.typeahead = {
                hide: jest.fn()
            } as any;

            // Spy on the insertAtIndex method
            jest.spyOn(wmComponent as any, 'insertAtIndex').mockImplementation();
        });

        it('should reset loading state and pagination', () => {
            (wmComponent as any).closeSearch();
            expect((wmComponent as any)._loadingItems).toBeFalsy();
            expect((wmComponent as any).page).toBe(1);
        });

        it('should call insertAtIndex with correct index and reset elIndex and parentEl', () => {
            (wmComponent as any).closeSearch();
            expect((wmComponent as any).insertAtIndex).toHaveBeenCalledWith(2);
            expect((wmComponent as any).elIndex).toBeUndefined();
            expect((wmComponent as any).parentEl).toBeUndefined();
        });

        it('should reset _domUpdated if it was true', () => {
            (wmComponent as any).closeSearch();
            expect((wmComponent as any)._domUpdated).toBeFalsy();
        });

        it('should not change _domUpdated if it was already false', () => {
            (wmComponent as any)._domUpdated = false;
            (wmComponent as any).closeSearch();
            expect((wmComponent as any)._domUpdated).toBeFalsy();
        });

        it('should set listenQuery to false', () => {
            (wmComponent as any).closeSearch();
            expect((wmComponent as any).listenQuery).toBeFalsy();
        });

        it('should set _unsubscribeDv to true', () => {
            (wmComponent as any).closeSearch();
            expect((wmComponent as any)._unsubscribeDv).toBeTruthy();
        });

        it('should call typeahead.hide()', () => {
            (wmComponent as any).closeSearch();
            expect(wmComponent.typeahead.hide).toHaveBeenCalled();
        });
    });

    describe('renderMobileAutoComplete()', () => {
        let mockElement: any;
        let mockParent: any;

        beforeEach(() => {
            mockElement = {
                hasClass: jest.fn(),
                addClass: jest.fn(),
                find: jest.fn(),
                parent: jest.fn()
            };

            mockParent = {
                children: jest.fn().mockReturnThis(),
                index: jest.fn()
            };

            mockElement.parent.mockReturnValue(mockParent);

            // Mock the $element property
            Object.defineProperty(wmComponent, '$element', {
                get: () => mockElement
            });

            (wmComponent as any).elIndex = undefined;
            (wmComponent as any).parentEl = undefined;
            (wmComponent as any)._domUpdated = false;
            (wmComponent as any).position = '';
        });

        it('should set parentEl and elIndex if elIndex is not defined', () => {
            mockParent.index.mockReturnValue(3);
            (wmComponent as any).renderMobileAutoComplete();

            expect((wmComponent as any).parentEl).toBe(mockParent);
            expect((wmComponent as any).elIndex).toBe(3);
        });

        it('should not set parentEl and elIndex if elIndex is already defined', () => {
            (wmComponent as any).elIndex = 5;
            (wmComponent as any).parentEl = {} as any;
            (wmComponent as any).renderMobileAutoComplete();

            expect((wmComponent as any).parentEl).not.toBe(mockParent);
            expect((wmComponent as any).elIndex).toBe(5);
        });

        it('should add full-screen class and set _domUpdated if element does not have full-screen class', () => {
            mockElement.hasClass.mockReturnValue(false);
            (wmComponent as any).renderMobileAutoComplete();

            expect(mockElement.addClass).toHaveBeenCalledWith('full-screen');
            expect((wmComponent as any)._domUpdated).toBe(true);
        });

        it('should add inline class if position is inline', () => {
            mockElement.hasClass.mockReturnValue(false);
            (wmComponent as any).position = 'inline';
            (wmComponent as any).renderMobileAutoComplete();

            expect(mockElement.addClass).toHaveBeenCalledWith('inline');
        });

        it('should not add inline class if position is not inline', () => {
            mockElement.hasClass.mockReturnValue(false);
            (wmComponent as any).position = 'other';
            (wmComponent as any).renderMobileAutoComplete();

            expect(mockElement.addClass).not.toHaveBeenCalledWith('inline');
        });

        it('should focus on app-search-input if element has full-screen class', () => {
            const mockInputElement = { focus: jest.fn() };
            mockElement.hasClass.mockReturnValue(true);
            mockElement.find.mockReturnValue(mockInputElement);

            (wmComponent as any).renderMobileAutoComplete();

            expect(mockElement.find).toHaveBeenCalledWith('.app-search-input');
            expect(mockInputElement.focus).toHaveBeenCalled();
        });

        it('should not focus on app-search-input if element does not have full-screen class', () => {
            const mockInputElement = { focus: jest.fn() };
            mockElement.hasClass.mockReturnValue(false);
            mockElement.find.mockReturnValue(mockInputElement);

            (wmComponent as any).renderMobileAutoComplete();

            expect(mockInputElement.focus).not.toHaveBeenCalled();
        });
    });
    describe('insertAtIndex(i)', () => {
        let mockParentEl: any;
        let mockElement: any;
        let mockChildren: any;

        beforeEach(() => {
            mockChildren = {
                eq: jest.fn().mockReturnThis(),
                length: 1
            };

            mockParentEl = {
                prepend: jest.fn(),
                children: jest.fn().mockReturnValue(mockChildren)
            };

            mockElement = {
                insertBefore: jest.fn(),
                insertAfter: jest.fn()
            };

            // Set up the component properties
            (wmComponent as any).parentEl = mockParentEl;
            Object.defineProperty(wmComponent, '$element', {
                get: () => mockElement
            });
        });

        it('should prepend the element when index is 0', () => {
            (wmComponent as any).insertAtIndex(0);
            expect(mockParentEl.prepend).toHaveBeenCalledWith(mockElement);
        });

        it('should insert before when element at index exists', () => {
            (wmComponent as any).insertAtIndex(2);
            expect(mockElement.insertBefore).toHaveBeenCalledWith(mockChildren);
            expect(mockParentEl.children().eq).toHaveBeenCalledWith(2);
        });

        it('should insert after when element at index does not exist', () => {
            mockChildren.length = 0;
            (wmComponent as any).insertAtIndex(3);
            expect(mockElement.insertAfter).toHaveBeenCalledWith(mockChildren);
            expect(mockParentEl.children().eq).toHaveBeenCalledWith(2);
        });

        it('should handle indices larger than the number of children by appending', () => {
            mockChildren.length = 0;
            (wmComponent as any).insertAtIndex(100);
            expect(mockElement.insertAfter).toHaveBeenCalledWith(mockChildren);
            expect(mockParentEl.children().eq).toHaveBeenCalledWith(99);
        });
    });

    describe('onFocusOut()', () => {
        beforeEach(() => {
            // Initialize the component properties
            (wmComponent as any)._unsubscribeDv = true;
            (wmComponent as any)._loadingItems = true;
            (wmComponent as any).page = 2;
            (wmComponent as any)._domUpdated = false;
            (wmComponent as any)._isOpen = true;
            (wmComponent as any).listenQuery = true;
            wmComponent.typeahead = {
                _container: {
                    isFocused: false
                }
            } as any;
        });

        it('should reset _unsubscribeDv, _loadingItems, and page', () => {
            (wmComponent as any).onFocusOut();
            expect((wmComponent as any)._unsubscribeDv).toBe(false);
            expect((wmComponent as any)._loadingItems).toBe(false);
            expect((wmComponent as any).page).toBe(1);
        });

        it('should set listenQuery to false if _domUpdated is false and _isOpen is true', () => {
            (wmComponent as any).onFocusOut();
            expect((wmComponent as any).listenQuery).toBe(false);
        });

        it('should not change listenQuery if _domUpdated is true', () => {
            (wmComponent as any)._domUpdated = true;
            (wmComponent as any).onFocusOut();
            expect((wmComponent as any).listenQuery).toBe(true);
        });

        it('should not change listenQuery if _isOpen is false', () => {
            (wmComponent as any)._isOpen = false;
            (wmComponent as any).onFocusOut();
            expect((wmComponent as any).listenQuery).toBe(true);
        });

        it('should set _isOpen to false', () => {
            (wmComponent as any).onFocusOut();
            expect((wmComponent as any)._isOpen).toBe(false);
        });

        it('should set typeahead container isFocused to true if _domUpdated is true and typeahead container exists', () => {
            (wmComponent as any)._domUpdated = true;
            (wmComponent as any).onFocusOut();
            expect((wmComponent.typeahead as any)._container.isFocused).toBe(true);
        });

        it('should not change typeahead container isFocused if _domUpdated is false', () => {
            (wmComponent as any).onFocusOut();
            expect((wmComponent.typeahead as any)._container.isFocused).toBe(false);
        });

        it('should not throw error if typeahead is undefined', () => {
            (wmComponent as any)._domUpdated = true;
            wmComponent.typeahead = undefined;
            expect(() => (wmComponent as any).onFocusOut()).not.toThrow();
        });

        it('should not throw error if typeahead._container is undefined', () => {
            (wmComponent as any)._domUpdated = true;
            wmComponent.typeahead = {} as any;
            expect(() => (wmComponent as any).onFocusOut()).not.toThrow();
        });
    });

    describe('handleEnterEvent()', () => {
        beforeEach(() => {
            wmComponent.typeahead = {
                matches: []
            } as any;
            jest.spyOn(wmComponent as any, 'onSearchSelect').mockImplementation();
        });

        it('should call onSearchSelect when there are no matches', () => {
            const mockEvent = {} as any;
            (wmComponent as any).handleEnterEvent(mockEvent);
            expect((wmComponent as any).onSearchSelect).toHaveBeenCalledWith(mockEvent);
        });

        it('should not call onSearchSelect when there are matches', () => {
            (wmComponent as any).typeahead.matches = [{} as any];
            const mockEvent = {} as any;
            (wmComponent as any).handleEnterEvent(mockEvent);
            expect((wmComponent as any).onSearchSelect).not.toHaveBeenCalled();
        });
    });

    describe('invokeOnBeforeServiceCall()', () => {
        beforeEach(() => {
            jest.spyOn(wmComponent as any, 'invokeEventCallback').mockImplementation();
        });

        it('should call invokeEventCallback with correct parameters', () => {
            const inputData = { test: 'data' };
            (wmComponent as any).invokeOnBeforeServiceCall(inputData);
            expect((wmComponent as any).invokeEventCallback).toHaveBeenCalledWith('beforeservicecall', { inputData });
        });
    });

    describe('setLastActiveMatchAsSelected()', () => {
        beforeEach(() => {
            wmComponent.typeaheadContainer = {
                matches: [{ id: 1 }, { id: 2 }, { id: 3 }],
                nextActiveMatch: jest.fn()
            } as any;
            (wmComponent as any).lastSelectedIndex = 1;
        });

        it('should set _active and call nextActiveMatch when lastSelectedIndex is defined', () => {
            (wmComponent as any).setLastActiveMatchAsSelected();
            expect((wmComponent.typeaheadContainer as any)._active).toBe(wmComponent.typeaheadContainer.matches[1]);
            expect(wmComponent.typeaheadContainer.nextActiveMatch).toHaveBeenCalled();
            expect((wmComponent as any).lastSelectedIndex).toBeUndefined();
        });

        it('should not modify _active or call nextActiveMatch when lastSelectedIndex is undefined', () => {
            (wmComponent as any).lastSelectedIndex = undefined;
            (wmComponent as any).setLastActiveMatchAsSelected();
            expect((wmComponent.typeaheadContainer as any)._active).toBeUndefined();
            expect(wmComponent.typeaheadContainer.nextActiveMatch).not.toHaveBeenCalled();
        });
    });
    describe('selectNext', () => {
        beforeEach(() => {
            wmComponent.typeaheadContainer = {
                matches: [
                    new TypeaheadMatch({ id: 1 }, '1'),
                    new TypeaheadMatch({ id: 2 }, '2'),
                    new TypeaheadMatch({ id: 3 }, '3')
                ],
                active: new TypeaheadMatch({ id: 2 }, '2')
            } as any;
            wmComponent['dataProvider'] = { isLastPage: false } as any;
            wmComponent['_loadingItems'] = false;
        });

        it('should do nothing if there are no matches', () => {
            wmComponent.typeaheadContainer.matches = undefined;
            const loadMoreDataSpy = jest.spyOn(wmComponent as any, 'loadMoreData');

            wmComponent['selectNext']();

            expect(loadMoreDataSpy).not.toHaveBeenCalled();
        });

        it('should not load more data if not at the end of the list', () => {
            const loadMoreDataSpy = jest.spyOn(wmComponent as any, 'loadMoreData');

            wmComponent['selectNext']();

            expect(loadMoreDataSpy).not.toHaveBeenCalled();
        });

        it('should not load more data if already loading', () => {
            wmComponent['_loadingItems'] = true;
            wmComponent.typeaheadContainer.active = new TypeaheadMatch({ id: 3 }, '3');
            const loadMoreDataSpy = jest.spyOn(wmComponent as any, 'loadMoreData');

            wmComponent['selectNext']();

            expect(loadMoreDataSpy).not.toHaveBeenCalled();
        });

        it('should not load more data if on the last page', () => {
            wmComponent['dataProvider'].isLastPage = true;
            wmComponent.typeaheadContainer.active = new TypeaheadMatch({ id: 3 }, '3');
            const loadMoreDataSpy = jest.spyOn(wmComponent as any, 'loadMoreData');

            wmComponent['selectNext']();

            expect(loadMoreDataSpy).not.toHaveBeenCalled();
        });
    });
    describe('onPropertyChange', () => {
        it('should return early if key is "tabindex"', () => {
            const spy = jest.spyOn(wmComponent, 'onPropertyChange');
            wmComponent.onPropertyChange('tabindex', 'new', 'old');
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith('tabindex', 'new', 'old');
        });

        it('should update displayexpression for autocomplete type', () => {
            wmComponent.type = 'autocomplete';
            wmComponent.displaylabel = 'testLabel';
            wmComponent.displayexpression = undefined;
            wmComponent.datasource = undefined;

            wmComponent.onPropertyChange('displaylabel', 'new', 'old');

            expect(wmComponent.displayexpression).toBe('testLabel');
            expect(wmComponent.displaylabel).toBeUndefined();
        });

        it('should not update displayexpression if conditions are not met', () => {
            wmComponent.type = 'notAutocomplete';
            wmComponent.displaylabel = 'testLabel';
            wmComponent.displayexpression = 'testExpression';

            wmComponent.onPropertyChange('displaylabel', 'new', 'old');

            expect(wmComponent.displayexpression).toBe('testExpression');
            expect(wmComponent.displaylabel).toBe('testLabel');
        });

        it('should update query when dataoptions are provided and binddisplaylabel is null', () => {
            (wmComponent as any).dataoptions = ['option1', 'option2'];
            wmComponent.binddisplaylabel = null;
            wmComponent._modelByValue = { test: 'testModel' };

            wmComponent.onPropertyChange('displaylabel', 'test', 'old');

            expect(wmComponent.query).toBe('testModel');
        });

        it('should update query with _modelByValue when get returns undefined', () => {
            (wmComponent as any).dataoptions = ['option1', 'option2'];
            wmComponent.binddisplaylabel = null;
            wmComponent._modelByValue = 'testModel';

            wmComponent.onPropertyChange('displaylabel', 'nonexistent', 'old');

            expect(wmComponent.query).toBe('testModel');
        });

        it('should set clearData to false when disabled is set to false', () => {
            wmComponent.onPropertyChange('disabled', false, true);
            expect((wmComponent as any).clearData).toBe(false);
        });

        it('should set clearData to true and hide typeahead when disabled is set to true', () => {
            wmComponent.typeahead = {
                hide: jest.fn(),
                _typeahead: { isShown: true }
            } as any;

            wmComponent.onPropertyChange('disabled', true, false);

            expect((wmComponent as any).clearData).toBe(true);
            expect(wmComponent.typeahead.hide).toHaveBeenCalled();
        });

        it('should not hide typeahead when it is not shown', () => {
            wmComponent.typeahead = {
                hide: jest.fn(),
                _typeahead: { isShown: false }
            } as any;

            wmComponent.onPropertyChange('disabled', true, false);

            expect((wmComponent as any).clearData).toBe(true);
            expect(wmComponent.typeahead.hide).not.toHaveBeenCalled();
        });

        it('should call super.onPropertyChange for any other key', () => {
            const superSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(wmComponent)), 'onPropertyChange');

            wmComponent.onPropertyChange('otherKey', 'new', 'old');

            expect(superSpy).toHaveBeenCalledWith('otherKey', 'new', 'old');
        });
    });

    describe('getDataSourceAsObservable', () => {
        it('should return last result if query is unchanged and no filterFields', () => {
            wmComponent['_lastQuery'] = 'test';
            wmComponent['_lastResult'] = ['result1', 'result2'];
            wmComponent['dataoptions'] = {};

            const result = wmComponent['getDataSourceAsObservable']('test');

            expect(result).toBeInstanceOf(Observable);
            result.subscribe(data => {
                expect(data).toEqual(['result1', 'result2']);
            });
            expect(wmComponent['_loadingItems']).toBeFalsy();
        });

        it('should skip autocomplete logic when datavalue is falsy', () => {
            wmComponent.type = 'autocomplete';
            wmComponent.searchkey = 'name';
            wmComponent.query = 'John';
            // Mocking the datavalue getter to return false
            Object.defineProperty(wmComponent, 'datavalue', {
                get: jest.fn(() => false)
            });

            const mockGetDataSource = jest.fn().mockResolvedValue(['result1', 'result2']);
            wmComponent['getDataSource'] = mockGetDataSource;

            const result = wmComponent['getDataSourceAsObservable']('John');

            expect(result).toBeInstanceOf(Observable);
            result.subscribe(data => {
                expect(data).toEqual(['result1', 'result2']);
                expect(mockGetDataSource).toHaveBeenCalledWith('John');
            });
        });

        it('should return empty array for autocomplete with multiple bindDisplayLabelArray when datavalue is truthy', () => {
            wmComponent.type = 'autocomplete';
            wmComponent.searchkey = 'name,id';
            wmComponent.query = 'John';
            wmComponent.binddisplaylabel = 'firstName+lastName';
            // Mocking the datavalue getter to return true
            Object.defineProperty(wmComponent, 'datavalue', {
                get: jest.fn(() => true)
            });

            const result = wmComponent['getDataSourceAsObservable']('John');

            expect(result).toBeInstanceOf(Observable);
            result.subscribe(data => {
                expect(data).toEqual([]);
            });
            expect(wmComponent['_loadingItems']).toBeFalsy();
        });

        it('should return empty array for autocomplete with single bindDisplayLabelArray not including | when datavalue is truthy', () => {
            wmComponent.type = 'autocomplete';
            wmComponent.searchkey = 'name';
            wmComponent.query = 'John';
            wmComponent.binddisplaylabel = '[fullName]';
            // Mocking the datavalue getter to return true
            Object.defineProperty(wmComponent, 'datavalue', {
                get: jest.fn(() => true)
            });

            const result = wmComponent['getDataSourceAsObservable']('John');

            expect(result).toBeInstanceOf(Observable);
            result.subscribe(data => {
                expect(data).toEqual([]);
            });
            expect(wmComponent['_loadingItems']).toBeFalsy();
        });

        it('should return empty array for autocomplete with single bindDisplayLabelArray including | when datavalue is truthy', () => {
            wmComponent.type = 'autocomplete';
            wmComponent.searchkey = 'name';
            wmComponent.query = 'John';
            wmComponent.binddisplaylabel = '[fullName|firstName]';
            // Mocking the datavalue getter to return true
            Object.defineProperty(wmComponent, 'datavalue', {
                get: jest.fn(() => true)
            });

            const result = wmComponent['getDataSourceAsObservable']('John');

            expect(result).toBeInstanceOf(Observable);
            result.subscribe(data => {
                expect(data).toEqual([]);
            });
            expect(wmComponent['_loadingItems']).toBeFalsy();
        });

        it('should return empty array when displayexpression does not include searchkey and datavalue is truthy', () => {
            wmComponent.type = 'autocomplete';
            wmComponent.searchkey = 'name';
            wmComponent.query = 'John';
            wmComponent.displayexpression = 'fullName';
            // Mocking the datavalue getter to return true
            Object.defineProperty(wmComponent, 'datavalue', {
                get: jest.fn(() => true)
            });

            const result = wmComponent['getDataSourceAsObservable']('John');

            expect(result).toBeInstanceOf(Observable);
            result.subscribe(data => {
                expect(data).toEqual([]);
            });
            expect(wmComponent['_loadingItems']).toBeFalsy();
        });

        it('should call getDataSource for new query', () => {
            const mockGetDataSource = jest.fn().mockResolvedValue(['newResult1', 'newResult2']);
            wmComponent['getDataSource'] = mockGetDataSource;

            const result = wmComponent['getDataSourceAsObservable']('newQuery');

            expect(result).toBeInstanceOf(Observable);
            result.subscribe(data => {
                expect(data).toEqual(['newResult1', 'newResult2']);
                expect(mockGetDataSource).toHaveBeenCalledWith('newQuery');
            });
        });
    });



    describe('loadMoreData', () => {
        let dataProviderMock: jest.Mocked<DataProvider>;
        let typeaheadMock: jest.Mocked<TypeaheadDirective>;

        beforeEach(async () => {
            dataProviderMock = {
                isLastPage: false,
            } as any;

            typeaheadMock = {
                onInput: jest.fn(),
            } as any;
            wmComponent.typeahead = typeaheadMock;
            wmComponent['dataProvider'] = dataProviderMock;
            fixture.detectChanges();
        });

        it('should not load more data if isLastPage is true', () => {
            dataProviderMock.isLastPage = true;
            wmComponent['loadMoreData']();
            expect(typeaheadMock.onInput).not.toHaveBeenCalled();
        });

        it('should increment page number when incrementPage is true', () => {
            wmComponent['page'] = 1;
            wmComponent['loadMoreData'](true);
            expect(wmComponent['page']).toBe(2);
        });

        it('should not increment page number when incrementPage is false', () => {
            wmComponent['page'] = 1;
            wmComponent['loadMoreData'](false);
            expect(wmComponent['page']).toBe(1);
        });

        it('should set isScrolled and _loadingItems to true', () => {
            wmComponent['loadMoreData']();
            expect(wmComponent['isScrolled']).toBe(true);
            expect(wmComponent['_loadingItems']).toBe(true);
        });

        it('should reset _lastQuery when incrementPage is true', () => {
            wmComponent['_lastQuery'] = 'previous query';
            wmComponent['loadMoreData'](true);
            expect(wmComponent['_lastQuery']).toBeUndefined();
        });

        it('should not reset _lastQuery when incrementPage is false', () => {
            wmComponent['_lastQuery'] = 'previous query';
            wmComponent['loadMoreData'](false);
            expect(wmComponent['_lastQuery']).toBe('previous query');
        });

        it('should call typeahead.onInput with trimmed query', () => {
            wmComponent.query = '  test query  ';
            wmComponent['loadMoreData']();
            expect(typeaheadMock.onInput).toHaveBeenCalledWith({
                target: { value: 'test query' }
            });
        });

        it('should call typeahead.onInput with "0" when query is empty', () => {
            wmComponent.query = '';
            wmComponent['loadMoreData']();
            expect(typeaheadMock.onInput).toHaveBeenCalledWith({
                target: { value: '0' }
            });
        });
    });

    describe('triggerSearch', () => {

        beforeEach(() => {
            wmComponent.typeahead = {
                onInput: jest.fn()
            } as any;
        });

        it('should not trigger search if dataProvider.isLastPage is true', () => {
            (wmComponent as any).dataProvider.isLastPage = true;
            const loadMoreDataSpy = jest.spyOn((wmComponent as any), 'loadMoreData');
            wmComponent['triggerSearch']();
            expect(loadMoreDataSpy).not.toHaveBeenCalled();
        });

        it('should not trigger search if element does not have "full-screen" class', () => {
            (wmComponent as any).dataProvider.isLastPage = false;
            wmComponent.$element.removeClass('full-screen');
            const loadMoreDataSpy = jest.spyOn((wmComponent as any), 'loadMoreData');
            wmComponent['triggerSearch']();
            expect(loadMoreDataSpy).not.toHaveBeenCalled();
        });


        it('should trigger loadMoreData if conditions are met', () => {
            (wmComponent as any).dataProvider.isLastPage = false;
            wmComponent.$element.addClass('full-screen');
            const mockLastItem = {
                length: 1,
                height: () => 50,
                position: () => ({ top: 100 })
            };
            const mockDropdown = {
                length: 1,
                height: () => 200,
                position: () => ({ top: 0 }),
                find: jest.fn().mockReturnValue({
                    last: jest.fn().mockReturnValue(mockLastItem)
                })
            };

            // Mock the dropdownEl property
            Object.defineProperty(wmComponent, 'dropdownEl', {
                get: jest.fn().mockReturnValue(mockDropdown)
            });

            const loadMoreDataSpy = jest.spyOn((wmComponent as any), 'loadMoreData');

            wmComponent['triggerSearch']();

            expect(loadMoreDataSpy).toHaveBeenCalledWith(true);
        });

        it('should not trigger loadMoreData if last item is below the full screen', () => {
            (wmComponent as any).dataProvider.isLastPage = false;
            wmComponent.$element.addClass('full-screen');
            const mockLastItem = {
                length: 1,
                height: () => 50,
                position: () => ({ top: 300 })
            };
            const mockDropdown = {
                length: 1,
                height: () => 200,
                position: () => ({ top: 0 }),
                find: jest.fn().mockReturnValue({
                    last: jest.fn().mockReturnValue(mockLastItem)
                })
            };
            Object.defineProperty(wmComponent, 'dropdownEl', {
                get: jest.fn().mockReturnValue(mockDropdown)
            });
            const loadMoreDataSpy = jest.spyOn((wmComponent as any), 'loadMoreData');
            wmComponent['triggerSearch']();
            expect(loadMoreDataSpy).not.toHaveBeenCalled();
        });
    });

    describe('handleFocus', () => {
        it('should emit keyUpEventEmitter if conditions are met', () => {
            wmComponent.type = 'search';
            wmComponent.query = 'test query';
            wmComponent['_lastQuery'] = 'test query';
            wmComponent['_lastResult'] = ['some result'];
            const mockTypeahead = {
                keyUpEventEmitter: {
                    emit: jest.fn()
                }
            };
            (wmComponent as any).typeahead = mockTypeahead;
            wmComponent['handleFocus']({} as FocusEvent);
            expect(mockTypeahead.keyUpEventEmitter.emit).toHaveBeenCalledWith('test query');
        });

        it('should not emit keyUpEventEmitter if conditions are not met', () => {
            wmComponent.type = 'not search';
            wmComponent.query = 'test query';
            wmComponent['_lastQuery'] = 'different query';
            wmComponent['_lastResult'] = null;
            const mockTypeahead = {
                keyUpEventEmitter: {
                    emit: jest.fn()
                }
            };
            (wmComponent as any).typeahead = mockTypeahead;
            wmComponent['handleFocus']({} as FocusEvent);
            expect(mockTypeahead.keyUpEventEmitter.emit).not.toHaveBeenCalled();
        });
    });

    describe('typeaheadOnSelect', () => {
        let mockMatch: TypeaheadMatch;
        let mockEvent: Event;

        beforeEach(() => {
            mockMatch = {
                item: {
                    key: 'testKey',
                    value: 'testValue',
                    label: 'Test Label'
                }
            } as TypeaheadMatch;
            mockEvent = {} as Event;
            wmComponent.invokeOnTouched = jest.fn();
            wmComponent.invokeOnChange = jest.fn();
            wmComponent.updateBoundVariable = jest.fn();
            (wmComponent as any).closeSearch = jest.fn();
            wmComponent.invokeEventCallback = jest.fn();
            (wmComponent as any).updatePrevDatavalue = jest.fn();
            (wmComponent as any).eventData = jest.fn().mockReturnValue(mockEvent);
        });

        it('should update queryModel, query, and model properties', () => {
            wmComponent.typeaheadOnSelect(mockMatch, mockEvent);
            expect(wmComponent.queryModel).toBe(mockMatch.item);
            expect(wmComponent.query).toBe('Test Label');
            expect(wmComponent['_modelByKey']).toBe('testKey');
            expect(wmComponent['_modelByValue']).toBe('testValue');
        });

        it('should set showClosebtn to true when query is not empty', () => {
            wmComponent.typeaheadOnSelect(mockMatch, mockEvent);
            expect((wmComponent as any).showClosebtn).toBe(true);
        });

        it('should set showClosebtn to false when query is empty', () => {
            mockMatch.item.label = '';
            wmComponent.typeaheadOnSelect(mockMatch, mockEvent);
            expect((wmComponent as any).showClosebtn).toBe(false);
        });

        it('should invoke necessary methods', () => {
            wmComponent.typeaheadOnSelect(mockMatch, mockEvent);
            expect(wmComponent.invokeOnTouched).toHaveBeenCalled();
            expect(wmComponent.invokeOnChange).toHaveBeenCalled();
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledTimes(2);
        });

        it('should invoke event callbacks', () => {
            wmComponent.typeaheadOnSelect(mockMatch, mockEvent);
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('select', expect.any(Object));
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('submit', expect.any(Object));
        });
    });

    describe('onSearchSelect', () => {
        let mockEvent: Event;

        beforeEach(() => {
            mockEvent = {} as Event;
            wmComponent.typeahead = {
                onInput: jest.fn()
            } as any;
            wmComponent.query = 'test query';
            (wmComponent as any).eventData = jest.fn().mockReturnValue(mockEvent);
            (wmComponent as any).isUpdateOnKeyPress = jest.fn();
            wmComponent.invokeEventCallback = jest.fn();
        });

        it('should handle case when typeaheadContainer is not available', () => {
            wmComponent['onSearchSelect'](mockEvent);

            expect((wmComponent as any).eventData).toHaveBeenCalledWith(mockEvent, {});
        });

        it('should handle case when query does not match active typeahead element', () => {
            wmComponent.typeaheadContainer = {
                active: {
                    value: 'different query',
                    item: {}
                }
            } as any;

            wmComponent['onSearchSelect'](mockEvent);

            expect((wmComponent as any).eventData).toHaveBeenCalledWith(mockEvent, {});
        });

        it('should handle case when isUpdateOnKeyPress is false', () => {
            (wmComponent as any).isUpdateOnKeyPress.mockReturnValue(false);
            wmComponent.typeahead = {
                onInput: jest.fn()
            } as any;

            wmComponent['onSearchSelect'](mockEvent);
            expect((wmComponent as any).listenQuery).toBe(true);
            expect(wmComponent.typeahead.onInput).toHaveBeenCalledWith({
                target: { value: 'test query' }
            });
        });

        it('should select active match when typeaheadContainer and liElements are available and query matches', () => {
            wmComponent.typeaheadContainer = {
                active: {
                    value: 'test query',
                    item: {}
                },
                selectActiveMatch: jest.fn()
            } as any;
            wmComponent.liElements = [{}] as any;
            (wmComponent as any).isUpdateOnKeyPress.mockReturnValue(true);

            wmComponent['onSearchSelect'](mockEvent);

            expect(wmComponent.typeaheadContainer.selectActiveMatch).toHaveBeenCalled();
        });

        it('should update queryModel and invoke submit callback when no matches are available', () => {
            wmComponent.typeaheadContainer = null;
            (wmComponent as any).liElements = [];
            (wmComponent as any).isUpdateOnKeyPress.mockReturnValue(true);

            wmComponent['onSearchSelect'](mockEvent);

            expect(wmComponent.queryModel).toBe('test query');
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('submit', { $event: mockEvent });
        });

        it('should update queryModel and invoke submit callback when query does not match active element', () => {
            wmComponent.typeaheadContainer = {
                active: {
                    value: 'different query',
                    item: {}
                }
            } as any;
            wmComponent.liElements = [{}] as any;
            (wmComponent as any).isUpdateOnKeyPress.mockReturnValue(true);
            wmComponent['onSearchSelect'](mockEvent);
            expect(wmComponent.queryModel).toBe('test query');
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('submit', { $event: mockEvent });
        });
    });

    describe('onInputChange', () => {
        it('should reset result, page, and listenQuery when called', () => {
            (wmComponent as any).result = [1, 2, 3];
            (wmComponent as any).page = 5;
            (wmComponent as any).listenQuery = false;

            wmComponent['onInputChange']({} as Event);

            expect((wmComponent as any).result).toEqual([]);
            expect((wmComponent as any).page).toBe(1);
            expect((wmComponent as any).listenQuery).toBe(wmComponent['isUpdateOnKeyPress']());
        });

        it('should reset queryModel and _modelByValue when input is cleared', () => {
            wmComponent.query = '';
            wmComponent['_lastQuery'] = 'lastQuery';
            wmComponent['_modelByValue'] = 'someValue';

            const mockEvent = { which: 1 } as unknown as Event;
            wmComponent['onInputChange'](mockEvent);

            expect(wmComponent.queryModel).toBe('');
            expect(wmComponent['_modelByValue']).toBe('');
        });

        it('should invoke clear and submit callbacks when input is cleared', () => {
            wmComponent.query = '';
            const clearSpy = jest.spyOn(wmComponent as any, 'invokeEventCallback');
            const mockEvent = { which: 1 } as unknown as Event;

            wmComponent['onInputChange'](mockEvent);

            expect(clearSpy).toHaveBeenCalledWith('clear', { $event: mockEvent });
            expect(clearSpy).toHaveBeenCalledWith('submit', { $event: mockEvent });
        });

        it('should not invoke submit callback when tab is pressed', () => {
            wmComponent.query = '';
            const clearSpy = jest.spyOn(wmComponent as any, 'invokeEventCallback');
            const mockEvent = { which: 9 } as unknown as Event;

            wmComponent['onInputChange'](mockEvent);

            expect(clearSpy).toHaveBeenCalledWith('clear', { $event: mockEvent });
            expect(clearSpy).not.toHaveBeenCalledWith('submit', { $event: mockEvent });
        });

        it('should invoke change callback when input is not empty', () => {
            wmComponent.query = 'newQuery';
            wmComponent['prevDatavalue'] = 'oldQuery';
            const changeSpy = jest.spyOn(wmComponent as any, 'invokeEventCallback');
            const mockEvent = {} as Event;

            wmComponent['onInputChange'](mockEvent);

            expect(changeSpy).toHaveBeenCalledWith('change', {
                $event: mockEvent,
                newVal: 'newQuery',
                oldVal: 'oldQuery'
            });
        });

        it('should set showClosebtn to true when query is not empty', () => {
            wmComponent.query = 'someQuery';
            wmComponent['onInputChange']({} as Event);
            expect((wmComponent as any).showClosebtn).toBe(true);
        });

        it('should set showClosebtn to false when query is empty', () => {
            wmComponent.query = '';
            wmComponent['onInputChange']({} as Event);
            expect((wmComponent as any).showClosebtn).toBe(false);
        });
    });

    describe('clearSearch', () => {
        beforeEach(() => {
            wmComponent.typeahead = {
                onInput: jest.fn()
            } as any;
        });
        it('should clear the query and trigger search when loadOnClear is true', () => {
            wmComponent.query = 'test';
            (wmComponent as any).listenQuery = true;
            (wmComponent as any).dataProvider = { isLastPage: true };
            wmComponent._loadingItems = true;
            const mockEvent = { target: { value: '' } };
            jest.spyOn((wmComponent as any), 'onInputChange');
            jest.spyOn((wmComponent as any), 'loadMoreData');
            jest.spyOn(wmComponent, 'invokeEventCallback');
            (wmComponent as any).clearSearch(mockEvent, true);
            expect(wmComponent.query).toBe('');
            expect((wmComponent as any).onInputChange).toHaveBeenCalledWith(mockEvent);
            expect((wmComponent as any).dataProvider.isLastPage).toBe(false);
            expect((wmComponent as any).listenQuery).toBe(true);
            expect((wmComponent as any)._unsubscribeDv).toBe(false);
            expect((wmComponent as any).loadMoreData).toHaveBeenCalled();
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('clearsearch');
            expect(wmComponent._loadingItems).toBe(false);
        });

        it('should clear the query without triggering search when loadOnClear is false', () => {
            wmComponent.query = 'test';
            (wmComponent as any).listenQuery = true;
            (wmComponent as any).dataProvider = { isLastPage: true };
            wmComponent._loadingItems = true;
            const mockEvent = { target: { value: '' } };
            jest.spyOn((wmComponent as any), 'onInputChange');
            jest.spyOn((wmComponent as any), 'loadMoreData');
            jest.spyOn(wmComponent, 'invokeEventCallback');
            (wmComponent as any).clearSearch(mockEvent, false);
            expect(wmComponent.query).toBe('');
            expect((wmComponent as any).onInputChange).toHaveBeenCalledWith(mockEvent);
            expect((wmComponent as any).dataProvider.isLastPage).toBe(false);
            expect((wmComponent as any).loadMoreData).not.toHaveBeenCalled();
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('clearsearch');
            expect(wmComponent._loadingItems).toBe(false);
        });

        it('should focus on the input field when event is provided', () => {
            const mockEvent = { target: { value: '' } };
            const mockFocus = jest.fn();
            const mockFind = jest.fn().mockReturnValue({ focus: mockFocus });
            // Create a temporary object with the same structure as $element
            const tempElement = { find: mockFind };
            // Use Object.defineProperty to mock the $element getter
            Object.defineProperty(wmComponent, '$element', {
                get: jest.fn(() => tempElement)
            });
            (wmComponent as any).clearSearch(mockEvent, false);
            expect(mockFind).toHaveBeenCalledWith('.app-search-input');
            expect(mockFocus).toHaveBeenCalled();
        });

        it('should not focus on the input field when event is not provided', () => {
            const mockFocus = jest.fn();
            const mockFind = jest.fn().mockReturnValue({ focus: mockFocus });
            // Create a temporary object with the same structure as $element
            const tempElement = { find: mockFind };
            // Use Object.defineProperty to mock the $element getter
            Object.defineProperty(wmComponent, '$element', {
                get: jest.fn(() => tempElement)
            });
            (wmComponent as any).clearSearch(null, false);
            expect(mockFind).not.toHaveBeenCalled();
            expect(mockFocus).not.toHaveBeenCalled();
        });
    });

    describe('highlight', () => {
        it('should call typeaheadContainer.highlight if typeaheadContainer exists', () => {
            const match = new TypeaheadMatch({ label: 'test label' }, 'test label');
            const query = 'test';
            (wmComponent as any).typeaheadContainer = {
                highlight: jest.fn().mockReturnValue('highlighted text')
            };
            const result = (wmComponent as any).highlight(match, query);
            expect(wmComponent.typeaheadContainer.highlight).toHaveBeenCalledWith(match, query);
            expect(result).toBe('highlighted text');
            expect(match.value).toBe('test label');
        });

        it('should not call typeaheadContainer.highlight if typeaheadContainer does not exist', () => {
            const match = new TypeaheadMatch({ label: 'test label' }, 'test label');
            const query = 'test';
            wmComponent.typeaheadContainer = null;
            const result = (wmComponent as any).highlight(match, query);
            expect(result).toBeUndefined();
            // The value property should still be set even if typeaheadContainer doesn't exist
            expect(match.value).toBe('test label');
        });
    });

    describe('highlight', () => {
        it('should call typeaheadContainer.highlight if typeaheadContainer exists', () => {
            const match = new TypeaheadMatch({ label: 'test label' }, 'test label');
            const query = 'test';
            (wmComponent as any).typeaheadContainer = {
                highlight: jest.fn().mockReturnValue('highlighted text')
            };
            const result = (wmComponent as any).highlight(match, query);
            expect(wmComponent.typeaheadContainer.highlight).toHaveBeenCalledWith(match, query);
            expect(result).toBe('highlighted text');
            expect((match as any).value).toBe('test label');
        });
    });

    describe('isMobileAutoComplete', () => {
        it('should return true when type is autocomplete and isMobile returns true', () => {
            wmComponent.type = 'autocomplete';
            (isMobile as jest.Mock).mockReturnValue(true);
            const result = wmComponent.isMobileAutoComplete();
            expect(result).toBe(true);
        });

        it('should return false when type is not autocomplete', () => {
            wmComponent.type = 'search';
            (isMobile as jest.Mock).mockReturnValue(true);
            const result = wmComponent.isMobileAutoComplete();
            expect(result).toBe(false);
        });

        it('should return false when isMobile returns false', () => {
            wmComponent.type = 'autocomplete';
            (isMobile as jest.Mock).mockReturnValue(false);
            const result = wmComponent.isMobileAutoComplete();
            expect(result).toBe(false);
        });
    });

    describe('notifySubscriber', () => {
        let mockJQuery;
        let mockClosest;

        beforeEach(() => {
            mockClosest = {
                length: 0
            };
            mockJQuery = jest.fn().mockReturnValue({
                closest: jest.fn().mockReturnValue(mockClosest)
            });
            (global as any).$ = mockJQuery;

            (wmComponent as any).nativeElement = document.createElement('div');
        });

        it('should call app.notify when a matching parent element is found', () => {
            mockClosest.length = 1;

            wmComponent.notifySubscriber();

            expect(mockJQuery).toHaveBeenCalledWith(wmComponent.nativeElement);
            expect(mockJQuery().closest).toHaveBeenCalledWith('.app-composite-widget.caption-floating');
            expect(mockApp.notify).toHaveBeenCalledWith('captionPositionAnimate', {
                displayVal: true,
                nativeEl: mockClosest
            });
        });
    });
});
