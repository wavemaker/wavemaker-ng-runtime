import { ComponentFixture, waitForAsync } from '@angular/core/testing';
import { Component, OnInit, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { DatePipe } from '@angular/common';
import { AbstractI18nService, App, AppDefaults, isAppleProduct } from '@wm/core';
import { ChipsComponent } from './chips.component';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import { compileTestComponent, mockApp, setInputValue } from '../../../../base/src/test/util/component-test-util';
import { WmComponentsModule, ToDatePipe, DataSetItem } from '@wm/components/base';
import { SearchComponent } from '@wm/components/basic/search';
import { PartialRefProvider } from '@wm/core';
import { MockAbstractI18nService } from '../../../../base/src/test/util/date-test-util';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    isAppleProduct: jest.fn()
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
        WmComponentsModule
    ],
    declarations: [ChipsWrapperComponent, ChipsComponent, SearchComponent],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AppDefaults, useClass: AppDefaults },
        { provide: PartialRefProvider, useClass: PartialRefProvider },
        { provide: AbstractI18nService, useClass: MockAbstractI18nService }
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


    it('should delete chip item', waitForAsync(() => {
        const testValue = 'Option 3';
        addItem(testValue, 'keyup').then(() => {
            expect(wmComponent.chipsList.length).toEqual(1);
            const chipItem = wmComponent.chipsList[0];
            chipItem.removeChipItem();
            expect(wmComponent.chipsList.length).toEqual(0);
        });
    }));

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
            const mockEvent = new Event('keydown');
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
    function applyMatchMode(matchMode, value1, value2) {
        wmComponent.setProperty('matchmode', matchMode);
        fixture.detectChanges();
        addItem(value1, 'keyup').then(async () => {
            await fixture.detectChanges();
            expect(wmComponent.chipsList.length).toEqual(1);
            addItem(value2, 'keydown').then(() => {
                expect(wmComponent.chipsList.length).toEqual(2);
            });
        });
    }

    function addItem(testValue, eventName) {
        return setInputValue(fixture, '.app-search-input', testValue).then(async () => {
            const input = fixture.debugElement.query(By.css('.app-search-input')).nativeElement;
            const options = { 'key': 'Enter', 'keyCode': 13, 'code': 'Enter' };
            input.dispatchEvent(new KeyboardEvent(eventName, options));
            fixture.detectChanges();
            return await fixture.whenStable();
        });
    }

});
