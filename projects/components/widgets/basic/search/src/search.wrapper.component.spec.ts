import {
    waitForAsync, ComponentFixture, ComponentFixtureAutoDetect
} from '@angular/core/testing';
import {AbstractI18nService, App} from '@wm/core';
import { Component, ViewChild } from '@angular/core';
import { SearchComponent } from './search.component';
import { FormsModule } from '@angular/forms';

import { TypeaheadMatch, TypeaheadModule } from 'ngx-bootstrap/typeahead';

import { By } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { ScrollableDirective } from './scrollable.directive';
import { WmComponentsModule, ToDatePipe, StylableComponent, BaseComponent} from '@wm/components/base';
import { PartialRefProvider, AppDefaults } from '@wm/core';
import { BaseFormComponent } from 'projects/components/widgets/input/default/src/base-form.component';
import { ITestModuleDef, ITestComponentDef, ComponentTestBase } from 'projects/components/base/src/test/common-widget.specs';
import { compileTestComponent, setInputValue, getElementByTagOnDocQuery, hasAttributeCheck } from 'projects/components/base/src/test/util/component-test-util';
import {MockAbstractI18nService} from '../../../../base/src/test/util/date-test-util';
import {BaseFormCustomComponent} from 'projects/components/widgets/input/default/src/base-form-custom.component';
import {DatasetAwareFormComponent} from '@wm/components/input';

const mockApp = {};

const markup = `
        <div wmSearch name="testsearch"
            searchon="typing"
             hint="Help text for test search"
             placeholder="Type here to search.."
             type="button"
             tabindex="1"

             disabled="false"
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
    @ViewChild(SearchComponent, /* TODO: add static flag */ {static: true})
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
        { provide: AbstractI18nService, useClass: MockAbstractI18nService},
        { provide: BaseComponent, useClass: BaseComponent},
        { provide: StylableComponent, useClass: StylableComponent},
        { provide: BaseFormComponent, useClass: BaseFormComponent},
        { provide: BaseFormCustomComponent, useClass: BaseFormCustomComponent},
        { provide: DatasetAwareFormComponent, useClass: DatasetAwareFormComponent}
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
TestBase.verifyPropsInitialization();
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

    it('should trigger the onSubmit callback', waitForAsync(() => {
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


    it('should trigger the onselect callback', waitForAsync(async () => {
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4';
        const testValue = 'te';
        jest.spyOn(wrapperComponent, 'search1Select');
        await setInputValue(fixture, '.app-search-input', testValue);
        let liElement = getLIElement();
        liElement[0].click();
        await fixture.whenStable();
        expect(wrapperComponent.search1Select).toHaveBeenCalledTimes(1);
    }));

    it('should show clear icon and on click should call clearsearch function when search type is autocomplete', waitForAsync(async () => {
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


    it('should be able to search on given key, show the label', waitForAsync(() => {
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


    xit('should be able show the typehead values in descending order', waitForAsync(() => {
        wmComponent.getWidget().dataset = [{ name: 'Aman', age: 21 }, { name: 'Tony', age: 42 }, { name: 'John', age: 25 }, { name: 'Berf', age: 28 }];
        wmComponent.getWidget().searchkey = 'name';
        wmComponent.getWidget().displaylabel = 'name';
        wmComponent.getWidget().orderby = 'name:desc';
        setInputValue(fixture, '.app-search-input', 'A').then(() => {

            console.log(wmComponent.typeaheadContainer.matches);
        });

    }));

    it('should set the limit for typehead list', waitForAsync(async () => {
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4';
        wmComponent.getWidget().limit = 2;
        const testValue = 'test';
        await setInputValue(fixture, '.app-search-input', testValue);
        let liElement = getLIElement();
        expect(liElement.length).toBe(2);
    }));
    /******************************** Dataset end ***************************************** */






    /******************************** Properties starts ********************************** */


    it('should open the typehead list and close when list item selects', waitForAsync(() => {
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



    it('should set the minchar for typehead list', waitForAsync(async () => {
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

    it('should set the datacomplete message for typehead list', waitForAsync(() => {
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

    it('should search when user click on the search icon', waitForAsync(async () => {
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

    it('should be disabled mode ', waitForAsync(() => {
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

    it('should set the search value on click on the typehead value', waitForAsync(() => {
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4';
        const testValue = 'te';
        setInputValue(fixture, '.app-search-input', testValue).then(() => {
            let liElement = getLIElement();
            liElement[0].click();
            expect(wmComponent.query).toEqual('test1');

        });
    }));

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

    it('should invoke onscroll method ', waitForAsync(() => {
        const testValue = 'te';
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4, test5. test6, test7, test8';
        jest.spyOn(wmComponent, 'onScroll');
        setInputValue(fixture, '.app-search-input', testValue).then(() => {
            let ulElement = getUlElement();
            ulElement[0].dispatchEvent(new CustomEvent('scroll'));
            expect(wmComponent.onScroll).toHaveBeenCalled();

        });
    }));

    it('should invoke typeaheadOnSelect method on select of the typehead option', (waitForAsync((done) => {
        const testValue = 'te';
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4, test5. test6, test7, test8';
        jest.spyOn(wmComponent, 'typeaheadOnSelect');
        setInputValue(fixture, '.app-search-input', testValue).then(() => {
            let liElement = getLIElement();
            liElement[2].click();
            setTimeout(() => {

                expect(wmComponent.typeaheadOnSelect).toHaveBeenCalled();
                done();
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

    xit('should invoke getTransformedData method ', waitForAsync(() => {
        const testValue = 'te';
        wmComponent.getWidget().dataset = 'test1, test2, test3, test4, test5. test6, test7, test8';
        jest.spyOn(wmComponent, 'getTransformedData');
        // setInputValue(fixture, '.app-search-input', testValue).then(() => {
        // let ulElement = getUlElement();
        // ulElement[0].dispatchEvent(new CustomEvent('scroll'));
        fixture.whenStable().then(() => {
            expect(wmComponent.getTransformedData).toHaveBeenCalled();
        });

        // });
    }));

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





});
