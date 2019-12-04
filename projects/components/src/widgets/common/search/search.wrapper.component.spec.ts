import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {App} from '@wm/core';
import { Component, ViewChild } from '@angular/core';
import { SearchComponent } from './search.component';
import { FormsModule } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap';
import { By } from '@angular/platform-browser';
import { compileTestComponent } from '../../../test/util/component-test-util';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../test/common-widget.specs';

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
        ></div>
    `;

@Component({
    template: markup
})
class SearchWrapperComponent {
    @ViewChild(SearchComponent)
    wmComponent: SearchComponent;
    public testdata: any = [{name: 'Peter', age: 21}, {name: 'Tony', age: 42}, {name: 'John', age: 25}, {name: 'Peter Son', age: 28}];

    public onChange($event, widget, newVal, oldVal) {
        console.log('Searching...');
    }
}

const testModuleDef: ITestModuleDef = {
    imports: [
        FormsModule,
        TypeaheadModule.forRoot()
    ],
    declarations: [SearchWrapperComponent, SearchComponent],
    providers: [
        {provide: App, useValue: mockApp}
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

describe('SearchComponent', () => {
   let wrapperComponent: SearchWrapperComponent;
   let wmComponent: SearchComponent;
   let fixture: ComponentFixture<SearchWrapperComponent>;

   beforeEach(async(() => {
       fixture = compileTestComponent(testModuleDef, SearchWrapperComponent);
       wrapperComponent = fixture.componentInstance;
       wmComponent = wrapperComponent.wmComponent;
       fixture.detectChanges();
   }));

   it('should create the Search Component', async() => {
       await fixture.whenStable();
       expect(wrapperComponent).toBeTruthy() ;
   });

    it('should change the input and call the onChange event', async() => {
        const testValue = 'abc';
        spyOn(wrapperComponent, 'onChange');
        await fixture.whenStable();
        setInputValue('.app-search-input', testValue).then(() => {
            expect(wmComponent.query).toEqual(testValue);
            expect(wrapperComponent.onChange).toHaveBeenCalledTimes(1);
        });
    });

    function setInputValue(selector: string, value: string) {
        const input = fixture.debugElement.query(By.css(selector)).nativeElement;
        input.value = value;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        return fixture.whenStable();
    }

    it('should invoke getDatasource method on entering the query', async(() => {
        const testValue = 'abc';
        spyOn(wmComponent, 'getDataSource').and.returnValue(Promise.resolve([]));
        setInputValue('.app-search-input', testValue).then(() => {
            expect(wmComponent.getDataSource).toHaveBeenCalled();
        });
    }));

    it('last result has to be reset to undefined on changing the dataset', ((done) => {
        wmComponent.dataset = wrapperComponent.testdata;
        wmComponent.onPropertyChange('dataset', wrapperComponent.testdata, []);
        fixture.detectChanges();
        (wmComponent as any)._lastResult = [{name: 'Tony', age: 42}];
        expect((wmComponent as any)._lastResult).toBeDefined();
        (wmComponent as any).dataset$.subscribe((result) => {
            done();
            expect((wmComponent as any)._lastResult).toBeUndefined();
        });
        wmComponent.dataset = [];
        wmComponent.onPropertyChange('dataset', wmComponent.dataset, wrapperComponent.testdata);

        fixture.detectChanges();
    }));
});
