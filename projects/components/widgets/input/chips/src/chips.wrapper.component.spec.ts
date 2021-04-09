import { ComponentFixture } from '@angular/core/testing';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

import { App } from '@wm/core';
import { ChipsComponent } from './chips.component';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import { compileTestComponent, setInputValue } from '../../../../base/src/test/util/component-test-util';
import { WmComponentsModule, ToDatePipe } from '@wm/components/base';
import { SearchComponent } from '@wm/components/basic/search';
import { PartialRefProvider } from '@wm/core';

let mockApp = {};

const markup = `<ul wmChips name="chips1" readonly="false" class= "text-success" show="true" width="800" height="200" backgroundcolor="#00ff29"
                    placeholder="" tabindex="0" overflow="auto"></ul>`; // placeholder and tabindex are not working because .bind is not working
@Component({
    template: markup
})
class ChipsWrapperComponent implements OnInit {
    @ViewChild(ChipsComponent, /* TODO: add static flag */ {static: true}) wmComponent: ChipsComponent;
    public testdata: any = [{name: 'Peter', age: 21}, {name: 'Tony', age: 42}, {name: 'John', age: 25}, {name: 'Peter Son', age: 28}];
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
        WmComponentsModule
    ],
    declarations: [ChipsWrapperComponent, ChipsComponent, SearchComponent],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: PartialRefProvider, useClass: PartialRefProvider }
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
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();

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
    it('should add chipitems with "CONTAINS" matchmode',  (done) => {
        applyMatchMode('anywhere', 'Option 2', 'option 2', done);
    });
    it ('should add chipitems with "CONTAINS" matchmode with search key', (done) => {
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.getWidget().displayfield = 'name';
        // Setting searchkey property manually on search because .bind is not working
        getwmSearchEle().componentInstance.getWidget().searchkey = 'name';
        fixture.detectChanges();
        applyMatchMode('anywhere', 'Tony', 'tony', done);
    });

    /* ****************************************** TestCase for "CONTAINS_IGNORE_CASE" match mode *********************************** */
    it('should add chipitems with "CONTAINS_IGNORE_CASE" matchmode',  (done) => {
        applyIgnoreCaseMatchMode('anywhereignorecase', 'Option 2', 'option 2', done);
    });
    it ('should add chipitems with "CONTAINS_IGNORE_CASE" matchmode with search key', (done) => {
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.getWidget().displayfield = 'name';
        // Setting searchkey property manually on search because .bind is not working
        getwmSearchEle().componentInstance.getWidget().searchkey = 'name';
        fixture.detectChanges();
        applyIgnoreCaseMatchMode('anywhereignorecase', 'Tony', 'tony', done);
    });

    /* ****************************************** TestCase for "STARTS_WITH" match mode ******************************************** */
    it('should add chipitems with "STARTS_WITH" matchmode',  (done) => {
        applyMatchMode('start', 'Option 2', 'option 2', done);
    });
    it ('should add chipitems with "STARTS_WITH" matchmode with search key', (done) => {
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.getWidget().displayfield = 'name';
        // Setting searchkey property manually on search because .bind is not working
        getwmSearchEle().componentInstance.getWidget().searchkey = 'name';
        fixture.detectChanges();
        applyMatchMode('start', 'Tony', 'tony', done);
    });

    /* ****************************************** TestCase for "STARTS_WITH_IGNORE_CASE" match mode ********************************** */
    it('should add chipitems with "STARTS_WITH_IGNORE_CASE" matchmode',  (done) => {
        applyIgnoreCaseMatchMode('startignorecase', 'Option 2', 'option 2', done);
    });
    it ('should add chipitems with "STARTS_WITH_IGNORE_CASE" matchmode with search key', (done) => {
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.getWidget().displayfield = 'name';
        // Setting searchkey property manually on search because .bind is not working
        getwmSearchEle().componentInstance.getWidget().searchkey = 'name';
        fixture.detectChanges();
        applyIgnoreCaseMatchMode('startignorecase', 'Tony', 'tony', done);
    });

    /* ****************************************** TestCase for "ENDS_WITH" match mode ************************************************ */
    it('should add chipitems with "ENDS_WITH" matchmode',  (done) => {
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        fixture.detectChanges();
        applyMatchMode('end', 'script', 'Script', done);
    });
    it ('should add chipitems with "ENDS_WITH" matchmode with search key', (done) => {
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.getWidget().displayfield = 'name';
        // Setting searchkey property manually on search because .bind is not working
        getwmSearchEle().componentInstance.getWidget().searchkey = 'name';
        fixture.detectChanges();
        applyMatchMode('end', 'Son', 'son', done);
    });

    /* ****************************************** TestCase for "ENDS_WITH_IGNORE_CASE" match mode ************************************* */
    it('should add chipitems with "ENDS_WITH_IGNORE_CASE" matchmode',  (done) => {
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        fixture.detectChanges();
        applyIgnoreCaseMatchMode('endignorecase', 'script', 'Script', done);
    });
    it ('should add chipitems with "ENDS_WITH_IGNORE_CASE" matchmode with search key', (done) => {
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.getWidget().displayfield = 'name';
        // Setting searchkey property manually on search because .bind is not working
        getwmSearchEle().componentInstance.getWidget().searchkey = 'name';
        fixture.detectChanges();
        applyIgnoreCaseMatchMode('endignorecase', 'Son', 'son', done);
    });

    /* ****************************************** TestCase for "IS_EQUAL" match mode ************************************************** */
    it('should add chipitems with "IS_EQUAL" matchmode',  (done) => {
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        fixture.detectChanges();
        applyMatchMode('exact', 'java', 'Java', done);
    });
    it ('should add chipitems with "IS_EQUAL" matchmode with search key', (done) => {
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.getWidget().displayfield = 'name';
        // Setting searchkey property manually on search because .bind is not working
        getwmSearchEle().componentInstance.getWidget().searchkey = 'name';
        fixture.detectChanges();
        applyMatchMode('exact', 'Peter', 'peter', done);
    });

    /* ****************************************** TestCase for "IS_EQUAL_WITH_IGNORE_CASE" match mode ********************************** */
    it('should add chipitems with "IS_EQUAL_WITH_IGNORE_CASE" matchmode',  (done) => {
        wmComponent.getWidget().dataset = 'java, javascript, mongoDB';
        fixture.detectChanges();
        applyIgnoreCaseMatchMode('exactignorecase', 'java', 'Java', done);
    });
    it ('should add chipitems with "IS_EQUAL_WITH_IGNORE_CASE" matchmode with search key', (done) => {
        wmComponent.getWidget().dataset = wrapperComponent.testdata;
        wmComponent.getWidget().displayfield = 'name';
        // Setting searchkey property manually on search because .bind is not working
        getwmSearchEle().componentInstance.getWidget().searchkey = 'name';
        fixture.detectChanges();
        applyIgnoreCaseMatchMode('exactignorecase', 'Peter', 'peter', done);
    });

    function applyIgnoreCaseMatchMode(matchMode, value1, value2, done) {
        wmComponent.setProperty('matchmode', matchMode);
        fixture.detectChanges();
        addItem(value1, 'keyup').then(async () => {
            await fixture.detectChanges();
            expect(wmComponent.chipsList.length).toEqual(1);
            addItem(value2, 'keyup').then(() => {
                expect(wmComponent.chipsList.length).toEqual(1);
                done();
            });
        });
    }
    function applyMatchMode(matchMode, value1, value2, done) {
        wmComponent.setProperty('matchmode', matchMode);
        fixture.detectChanges();
        addItem(value1, 'keyup').then(async () => {
            await fixture.detectChanges();
            expect(wmComponent.chipsList.length).toEqual(1);
            addItem(value2, 'keydown').then(() => {
                expect(wmComponent.chipsList.length).toEqual(2);
                done();
            });
        });
    }

     function addItem(testValue, eventName) {
        return setInputValue(fixture, '.app-search-input', testValue).then(async () => {
            const input = fixture.debugElement.query(By.css('.app-search-input')).nativeElement;
            const options = {'key': 'Enter', 'keyCode': 13, 'code': 'Enter'};
            input.dispatchEvent(new KeyboardEvent(eventName, options));
            fixture.detectChanges();
            return await fixture.whenStable();
        });
    }

});
