import {
    waitForAsync, ComponentFixture, ComponentFixtureAutoDetect,
    tick,
    fakeAsync
} from '@angular/core/testing';
import { AbstractI18nService, App } from '@wm/core';
import { Component, ViewChild } from '@angular/core';
import { SearchComponent } from './search.component';
import { FormsModule } from '@angular/forms';
import { TypeaheadMatch, TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { BaseComponent } from '@wm/components/base';
import { By } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { ScrollableDirective } from './scrollable.directive';
import { WmComponentsModule, ToDatePipe } from '@wm/components/base';
import { PartialRefProvider, AppDefaults } from '@wm/core';
import { BaseFormComponent } from 'projects/components/widgets/input/default/src/base-form.component';
import { ITestModuleDef, ITestComponentDef, ComponentTestBase } from 'projects/components/base/src/test/common-widget.specs';
import { compileTestComponent, setInputValue, getElementByTagOnDocQuery, hasAttributeCheck, mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { MockAbstractI18nService } from 'projects/components/base/src/test/util/date-test-util';
import { Observable } from 'rxjs';

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
        console.log('Searching...');
    }

    public search1Submit($event, widget) {
        console.log('Search on submit triggered!');
    }

    public search1Select($event, widget, selectedValue) {
        console.log('TYpehead select event!');
    }

    public search1Focus = function ($event, widget) {
        console.log('search on focus callback!');
    };

    public search1Blur = function ($event, widget) {
        console.log('search on blur callback!');
    };
}

const testModuleDef: ITestModuleDef = {
    imports: [
        FormsModule,
        TypeaheadModule.forRoot(),
        WmComponentsModule
    ],
    declarations: [SearchWrapperComponent, SearchComponent, ScrollableDirective],
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
    }));

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

    // TypeError: Cannot read properties of undefined (reading 'querySelectorAll')

    xit('should trigger the onSubmit callback', waitForAsync(() => {
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4';
        const testValue = 'te';
        jest.spyOn(wrapperComponent, 'search1Submit');
        setInputValue(fixture, '.app-search-input', testValue).then(() => {
            let liElement = getLIElement();
            liElement[0].click();
            fixture.whenStable().then(() => {
                expect(wrapperComponent.search1Submit).toHaveBeenCalledTimes(1);
                expect(wmComponent.query).toEqual('test1');
            });

        });
    }));

    // TypeError: The provided value is not of type 'Element'.
    xit('should trigger the onselect callback', waitForAsync(async () => {
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4';
        const testValue = 'te';
        jest.spyOn(wrapperComponent, 'search1Select');
        await setInputValue(fixture, '.app-search-input', testValue);
        let liElement = getLIElement();
        liElement[0].click();
        await fixture.whenStable();
        expect(wrapperComponent.search1Select).toHaveBeenCalledTimes(1);
    }));

    // TypeError: The provided value is not of type 'Element'.

    xit('should show clear icon and on click should call clearsearch function when search type is autocomplete', waitForAsync(async () => {
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4';
        wmComponent.getWidget().type = 'autocomplete';
        wmComponent.getWidget().showclear = true;
        const testValue = 'te';
        jest.spyOn(wmComponent as any, 'clearSearch' as any);
        await setInputValue(fixture, '.app-search-input', testValue);
        let searchBtnEle = fixture.debugElement.query(By.css('.clear-btn'));
        searchBtnEle.nativeElement.click();
        await fixture.whenStable();
        expect((wmComponent as any).clearSearch).toHaveBeenCalled();
    }));

    /******************************** EVents end ***************************************** */



    /******************************** Dataset starts ********************************** */

    //TypeError: Cannot read properties of undefined (reading 'querySelectorAll')

    xit('should be able to search on given key, show the label', waitForAsync(() => {
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.getWidget().searchkey = 'age';
        wmComponent.getWidget().displaylabel = 'age';

        const testValue = '25';

        setInputValue(fixture, '.app-search-input', testValue).then(() => {

            let liElement = getLIElement();
            expect(liElement.length).toBe(1);
            expect(liElement[0].querySelectorAll('span')[0].textContent).toEqual('25');

        });
    }));

    //TypeError: The provided value is not of type 'Element'.

    xit('should be able show the typehead values in descending order', waitForAsync(() => {
        wmComponent.getWidget().dataset = [{ name: 'Aman', age: 21 }, { name: 'Tony', age: 42 }, { name: 'John', age: 25 }, { name: 'Berf', age: 28 }];
        wmComponent.getWidget().searchkey = 'name';
        wmComponent.getWidget().displaylabel = 'name';
        wmComponent.getWidget().orderby = 'name:desc';
        setInputValue(fixture, '.app-search-input', 'A').then(() => {

            console.log(wmComponent.typeaheadContainer.matches);
        });

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

    // TypeError: Cannot read properties of undefined (reading 'querySelectorAll')

    xit('should open the typehead list and close when list item selects', waitForAsync(() => {
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4';
        const testValue = 'test';

        setInputValue(fixture, '.app-search-input', testValue).then(() => {
            let ulElement = getUlElement();
            expect(ulElement.length).toBe(1);
            let liElement = getLIElement();
            expect(liElement.length).toBe(4);
            liElement[0].click();
            expect(typeHeadElement().length).toBe(0);

        });
    }));

    //TypeError: The provided value is not of type 'Element'.

    xit('should set the minchar for typehead list', waitForAsync(async () => {
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4';
        wmComponent.getWidget().minchars = 3;
        const testValue = 'te';
        fixture.detectChanges();
        await setInputValue(fixture, '.app-search-input', testValue);
        let typeHead = document.getElementsByTagName('typeahead-container');
        expect(typeHead.length).toBe(0);
        await setInputValue(fixture, '.app-search-input', 'tes');
        let liElement = getLIElement();
        expect(liElement.length).toBe(4);
    }));

    // expect(received).toBe(expected) // Object.is equality

    xit('should set the datacomplete message for typehead list', waitForAsync(() => {
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4';
        wmComponent.getWidget().datacompletemsg = 'No more data!';
        const testValue = 'tes';

        setInputValue(fixture, '.app-search-input', testValue).then(() => {
            let typeHead = typeHeadElement();
            expect(typeHead.length).toBe(1);
            let ulElement = typeHead[0].querySelectorAll('ul');
            let liElement = ulElement[0].querySelectorAll('li');
            expect(liElement.length).toBe(4);
            let dataCompleteEle = typeHead[0].querySelectorAll('.status')[0];
            expect(dataCompleteEle.querySelectorAll('span')[0].textContent).toBe('No more data!');
        });
    }));

    //TypeError: Cannot read properties of undefined (reading 'querySelectorAll')

    xit('should search when user click on the search icon', waitForAsync(async () => {
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4';
        wmComponent.getWidget().showsearchicon = true;
        wmComponent.getWidget().searchon = 'onsearchiconclick';
        const testValue = 'tes';

        await setInputValue(fixture, '.app-search-input', testValue);
        let typeHead = typeHeadElement();
        expect(typeHead.length).toBe(0);
        let searchBtnEle = fixture.debugElement.query(By.css('.app-search-button'));
        searchBtnEle.nativeElement.click();
        await fixture.whenStable();
        let liElement = getLIElement();
        expect(liElement.length).toBe(4);
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

    // TypeError: Cannot read properties of undefined (reading 'querySelectorAll')

    xit('should set the search value on click on the typehead value', waitForAsync(() => {
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4';
        const testValue = 'te';
        setInputValue(fixture, '.app-search-input', testValue).then(() => {
            let liElement = getLIElement();
            liElement[0].click();
            expect(wmComponent.query).toEqual('test1');

        });
    }));

    //TypeError: The provided value is not of type 'Element'.

    xit('last result has to be reset to undefined on changing the dataset', ((done) => {
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

    // TypeError: Cannot read properties of undefined (reading 'querySelectorAll')

    xit('should invoke onscroll method ', waitForAsync(() => {
        const testValue = 'te';
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4, test5. test6, test7, test8';
        jest.spyOn(wmComponent, 'onScroll');
        setInputValue(fixture, '.app-search-input', testValue).then(() => {
            let ulElement = getUlElement();
            ulElement[0].dispatchEvent(new CustomEvent('scroll'));
            expect(wmComponent.onScroll).toHaveBeenCalled();

        });
    }));

    // TypeError: The provided value is not of type 'Element'.

    xit('should invoke typeaheadOnSelect method on select of the typehead option', (waitForAsync((done) => {
        const testValue = 'te';
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4, test5. test6, test7, test8';
        jest.spyOn(wmComponent, 'typeaheadOnSelect');
        setInputValue(fixture, '.app-search-input', testValue).then(() => {
            let liElement = getLIElement();
            liElement[2].click();
            setTimeout(() => {

                expect(wmComponent.typeaheadOnSelect).toHaveBeenCalled();
            }, 50);

        });
    })));

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

    xit('should invoke getTransformedData method ', waitForAsync(() => {
        const testValue = 'te';
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4, test5. test6, test7, test8';
        jest.spyOn(wmComponent, 'getTransformedData');
        setInputValue(fixture, '.app-search-input', testValue).then(() => {
            let ulElement = getUlElement();
            ulElement[0].dispatchEvent(new CustomEvent('scroll'));
            fixture.whenStable().then(() => {
                expect(wmComponent.getTransformedData).toHaveBeenCalled();
            });
        });

        // });
    }));

    // TypeError: The provided value is not of type 'Element'.

    xit('datavalue change should update the static variable bound to the dataset', ((done) => {
        const WIDGET_CONFIG = { widgetType: 'wm-search', hostClass: 'input-group' };
        const baseformComponent = new (BaseFormComponent as any)((wmComponent as any).inj, WIDGET_CONFIG);
        jest.spyOn(baseformComponent.__proto__, 'updateBoundVariable');
        const sampleData = ['java', 'oracle', 'angular'];
        wmComponent.dataset = sampleData;
        wmComponent.onPropertyChange('dataset', sampleData, []);
        fixture.detectChanges();
        const testValue = 'ora';
        fixture.detectChanges();
        setInputValue(fixture, '.app-search-input', testValue).then(() => {
            const input = fixture.debugElement.query(By.css('.app-search-input')).nativeElement;
            const options = { 'key': 'Enter', 'keyCode': 13, 'code': 'Enter' };
            input.dispatchEvent(new KeyboardEvent('keyup', options));
            fixture.detectChanges();
            return fixture.whenStable();
        }).then(() => {
            expect(baseformComponent.__proto__.updateBoundVariable).toHaveBeenCalled();
            done();
        });
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
                expect(wmComponent['_lastQuery']).toBe('newQuery');
            });
        });
    });
});