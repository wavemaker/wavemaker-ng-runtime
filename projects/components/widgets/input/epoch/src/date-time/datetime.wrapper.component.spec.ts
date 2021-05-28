import { async, ComponentFixture } from '@angular/core/testing';
import {Component, LOCALE_ID, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import {
    UserDefinedExecutionContext,
    AppDefaults,
    AbstractI18nService,
    getNativeDateObject,
    getFormattedDate
} from '@wm/core';
import { WmComponentsModule } from '@wm/components/base';
import { SecurityService } from '@wm/security';
import {
    BsDatepickerModule,

    BsLocaleService
} from 'ngx-bootstrap/datepicker';
import {
    TimepickerModule
} from 'ngx-bootstrap/timepicker';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import { DatetimeComponent } from './date-time.component';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../../base/src/test/common-widget.specs';
import { ComponentsTestModule } from '../../../../../base/src/test/components.test.module';
import {
    compileTestComponent,
    getHtmlSelectorElement,
    checkElementClass,
    notHavingTheAttribute,
    hasAttributeCheck,
    onClickCheckTaglengthOnBody,
    onClickCheckClassEleLengthOnBody
} from '../../../../../base/src/test/util/component-test-util';
import { FormsModule } from '@angular/forms';
import { ToDatePipe } from '../../../../../base/src/pipes/custom-pipes';
import { DatePipe, registerLocaleData } from '@angular/common';
import {
    getTimeFieldValue,
    triggerTimerClickonArrowsByIndex,
    datepatternTest,
    outputpatternTest,
    disableMaxDatePanel,
    disableMindatePanel,
    excludedDaysDisable,
    expectCheckEleHasDisabled,
    localizedDatePickerTest, localizedTimePickerTest, localizedValueOnInputTest, MockAbstractI18nService, MockAbstractI18nServiceDe, MockAbstractI18nServiceRO
} from '../../../../../base/src/test/util/date-test-util';
import localeDE from '@angular/common/locales/de';
import localeRO from '@angular/common/locales/ro';

const getFormatedDate = (date?) => {
    if (!date) {
        return new Date().toISOString().split('.')[0];
    }
    return new Date(date).toISOString().split('.')[0];
}

const currentDate = getFormatedDate();

const markup = `<div wmDateTime  name="datetime1" tabindex="0" datavalue="${currentDate}" showdropdownon="button" hint="Birthtime"
shortcutkey="t" showweeks="true" class="input-group-lg" readonly="false" required="true" autofocus="true"
 outputformat="yyyy-MM-ddTHH:mm:ss" datepattern="yyyy-MM-ddTHH:mm:ss" mindate="2019-12-10" maxdate="2020-01-03"
  show="true" minutestep="30" hourstep="1" change.event="datetime1Change($event, widget, newVal, oldVal)"
  focus.event="datetime1Focus($event, widget)" blur.event="datetime1Blur($event, widget)" click.event="datetime1Click($event, widget)"
  mouseenter.event="datetime1Mouseenter($event, widget)" mouseleave.event="datetime1Mouseleave($event, widget)"
   tap.event="datetime1Tap($event, widget)"
   ngModel></div>`;
@Component({
    template: markup
})
class DatetimeWrapperComponent {

    @ViewChild(DatetimeComponent, /* TODO: add static flag */ {static: true})
    wmComponent: DatetimeComponent;



    datetime1Tap(evt, widget) {
        console.log("Date time control tap action triggered");
    }
    datetime1Click(evt, widget) {
        console.log("Date time control click action triggered");

    }

    datetime1Mouseenter(evt, widget) {
        console.log("Mouse enter event triggered");
    }
    datetime1Mouseleave(evt, wiget) {
        console.log("Mouse leave event triggered");
    }

    datetime1Focus(evt, widget) {
        console.log("Focus event triggered");
    }
    datetime1Blur(evt, widget) {
        console.log("Blur event triggered");
    }

    datetime1Change(evt, widget, newVal, oldVal) {
        console.log("Change event triggered!");
    }

}

const dateComponentModuleDef: ITestModuleDef = {
    declarations: [DatetimeWrapperComponent, DatetimeComponent],
    imports: [ComponentsTestModule, FormsModule, WmComponentsModule.forRoot(), BsDropdownModule.forRoot(), TimepickerModule.forRoot(), BsDatepickerModule.forRoot()],
    providers: [{ provide: Router, useValue: Router },
    { provide: SecurityService, useValue: SecurityService },
    { provide: UserDefinedExecutionContext, useValue: UserDefinedExecutionContext },
    { provide: AppDefaults, useValue: AppDefaults },
    { provide: ToDatePipe, useClass: ToDatePipe },
    { provide: DatePipe, useClass: DatePipe },
    { provide: AbstractI18nService, useClass: MockAbstractI18nService }
    ]
};

const dateComponentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-date-time',
    widgetSelector: '[wmDateTime]',
    inputElementSelector: 'input.app-textbox',

    testModuleDef: dateComponentModuleDef,
    testComponent: DatetimeWrapperComponent
};

const TestBase: ComponentTestBase = new ComponentTestBase(dateComponentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyEvents([
    {
        clickableEle: '.btn-date',
        callbackMethod: 'datetime1Tap',
        eventName: 'tap'
    },
    {
        clickableEle: '.btn-date',
        callbackMethod: 'datetime1Click',
        eventName: 'click'
    }, {
        mouseSelectionEle: '.app-datetime',
        callbackMethod: 'datetime1Mouseleave',
        eventName: 'mouseleave'
    }, {
        mouseSelectionEle: '.app-datetime',
        callbackMethod: 'datetime1Mouseenter',
        eventName: 'mouseenter'
    }, {
        eventTrigger: '.app-textbox',
        callbackMethod: 'datetime1Focus',
        eventName: 'focus'
    },
    {
        eventTrigger: '.app-textbox',
        callbackMethod: 'datetime1Blur',
        eventName: 'blur'
    }
]);



describe("DatetimeComponent", () => {
    let dateWrapperComponent: DatetimeWrapperComponent;
    let wmComponent: DatetimeComponent;
    let fixture: ComponentFixture<DatetimeWrapperComponent>;

    beforeEach((async () => {
        fixture = compileTestComponent(dateComponentModuleDef, DatetimeWrapperComponent);
        dateWrapperComponent = fixture.componentInstance;
        wmComponent = dateWrapperComponent.wmComponent;
        fixture.detectChanges();
    }));


    /************************* Properties starts ****************************************** **/
    it('should not add the hidden property, element always visible', async(() => {
        notHavingTheAttribute(fixture, '.app-datetime', 'hidden');

    }));


    it('should autofocus the date control ', async(() => {
        let inputEle = getHtmlSelectorElement(fixture, '.app-textbox');
        fixture.whenStable().then(() => {
            expect(inputEle).toBe(document.activeElement);
        });

    }));


    it("should show the calendar panel on click the date button (date entry mode) ", async(() => {

        onClickCheckTaglengthOnBody(fixture, '.btn-date', 'bs-datepicker-container', 1);

    }));
    it("should not show the calendar panel on click the input control (show date picker on only button click) ", async(() => {
        fixture.whenStable().then(() => {
            onClickCheckTaglengthOnBody(fixture, '.app-textbox', 'bs-datepicker-container', 0);
        });

    }));

    it("should show the timer panel on click the time button ", (done) => {
        fixture.whenStable().then(() => {
            let elem = getHtmlSelectorElement(fixture, '.btn-time');
            elem.nativeElement.click();

            fixture.detectChanges();
            setTimeout(() => {
                let element = document.getElementsByTagName('timepicker');
                expect(element.length).toBe(1);
                done();
            });

        });
    });

    it("should set the hours step as 1hour on click on top arrow button", async(() => {
        let dateInputControl = getHtmlSelectorElement(fixture, '.btn-time');
        dateInputControl.nativeElement.click();
        fixture.whenStable().then(() => {
            triggerTimerClickonArrowsByIndex(0);
            let hoursValue = +getTimeFieldValue(0);
            expect(hoursValue).toBe(1);

        });
    }));


    it("should set the min step as 30min on click on the second top arrow button", async(() => {
        let dateInputControl = getHtmlSelectorElement(fixture, '.btn-time');
        dateInputControl.nativeElement.click();
        fixture.whenStable().then(() => {
            triggerTimerClickonArrowsByIndex(1);
            let minValue = +getTimeFieldValue(1);
            expect(minValue).toBe(30);

        });
    }));

    it("should not show the calendar panel on click the input control ", async(() => {

        onClickCheckTaglengthOnBody(fixture, '.app-textbox', 'bs-datepicker-container', 0);
    }));

    it("should show the week numbers on the calendar pan ", async(() => {

        onClickCheckClassEleLengthOnBody(fixture, '.btn-time', 'table.weeks', 1);
    }));

    it('should assign the shortkey to the input control as attribute accesskey ', async(() => {
        let dateInputControl = getHtmlSelectorElement(fixture, '.app-textbox');
        expect(dateInputControl.nativeElement.getAttribute('accesskey')).toEqual('t');
    }));


    it('should set the current date as default value ', async(() => {
        let dateInputControl = getHtmlSelectorElement(fixture, '.app-textbox');
        expect(dateInputControl.nativeElement.value).toEqual(currentDate);
    }));


    it('should show the date patten as yyyy-MM-ddTHH:mm:ss format ', async(() => {

        datepatternTest(fixture, '.app-datetime', '.app-textbox');

    }));

    it('should get the date outputformat as yyyy-MM-ddTHH:mm:ss ', async(() => {
        outputpatternTest(fixture, '.app-datetime', dateWrapperComponent.wmComponent.datavalue, false, true);

    }));

    it('should be disabled mode ', async(() => {
        wmComponent.getWidget().disabled = true;
        fixture.detectChanges();
        hasAttributeCheck(fixture, '.app-textbox', 'disabled');

    }));
    it('should be disabled mode (picker button)', async(() => {
        wmComponent.getWidget().disabled = true;
        fixture.detectChanges();
        hasAttributeCheck(fixture, '.btn-time', 'disabled');
        hasAttributeCheck(fixture, '.btn-date', 'disabled');

    }));



    // TODO
    // it('should focus the date control on click on shortcut key ', () => {
    //     fixture.whenStable().then(() => {
    //         spyOn(dateWrapperComponent, 'date1Focus').and.callThrough();
    //         let keyD = new KeyboardEvent('keydown', { key: 'keyD', altKey: true });
    //         document.dispatchEvent(keyD);
    //         fixture.detectChanges();
    //         fixture.whenStable().then(() => {
    //             expect(dateWrapperComponent.date1Focus).toHaveBeenCalledTimes(1);
    //         });
    //     });
    // });

    /************************* Properties ends ****************************************** **/




    /************************* Validation starts ****************************************** **/

    it('should be required validation ', async(() => {
        fixture.whenStable().then(() => {
            let dateInputControl = getHtmlSelectorElement(fixture, '.app-textbox');
            expect(dateInputControl.nativeElement.hasAttribute('required')).toBe(true);
        });
    }));

    it('should respect the mindate validation', async(() => {
        wmComponent.getWidget().datavalue = getFormatedDate('2019-11-01');

        checkElementClass(fixture, '.app-datetime', 'ng-invalid');

    }));

    it('should be able to set the mindate and disable the below mindate on calendar', async(() => {
        wmComponent.getWidget().mindate = '2019-11-02';
        wmComponent.getWidget().datavalue = '2019-11-02';
        checkElementClass(fixture, '.app-datetime', 'ng-valid');
        onClickCheckTaglengthOnBody(fixture, '.btn-date', 'bs-datepicker-container', 1, (ele) => {
            disableMindatePanel(ele);
        });
    }));

    it('should respect the maxdate validation', async(() => {
        wmComponent.getWidget().maxdate = '2020-01-03';
        wmComponent.getWidget().datavalue = '2020-01-04';
        checkElementClass(fixture, '.app-datetime', 'ng-invalid');
        onClickCheckTaglengthOnBody(fixture, '.btn-date', 'bs-datepicker-container', 1, (ele) => {
            disableMaxDatePanel(ele);
        });

    }));

    it('should ignore the  excluded days', async(() => {
        wmComponent.getWidget().excludedays = '1,6';
        wmComponent.getWidget().datavalue = getFormatedDate('2019-12-30');
        checkElementClass(fixture, '.app-datetime', 'ng-invalid');

    }));
    it('should disable the excluded days on the calendar panel', async(() => {
        wmComponent.getWidget().excludedays = '1,6';
        onClickCheckTaglengthOnBody(fixture, '.btn-date', 'bs-datepicker-container', 1, (ele) => {
            fixture.whenStable().then(() => {
                excludedDaysDisable(ele);
            });

        });

    }));

    it('should ignore the  excluded date', async(() => {
        dateWrapperComponent.wmComponent.getWidget().datavalue = getFormatedDate('2020-01-01');
        checkElementClass(fixture, '.app-datetime', 'ng-invalid');

    }));

    it('should disable the excluded date on the calendar panel', async(() => {
        wmComponent.getWidget().excludedates = '2020-01-01';
        onClickCheckTaglengthOnBody(fixture, '.btn-date', 'bs-datepicker-container', 1, (ele) => {
            let datePickerRows = ele[0].querySelectorAll('tbody tr');
            fixture.whenStable().then(() => {
                var eleRow = datePickerRows[0];
                expectCheckEleHasDisabled(eleRow, 4);
            });
        });

    }));

    /************************* Validation end ****************************************** **/





    /************************ Scenarios starts **************************************** */

    it("should close the caledar as soon as select the date and should select the date and opens the timepicker panel", async(() => {
        onClickCheckTaglengthOnBody(fixture, '.btn-date', 'bs-datepicker-container', 1, (el) => {
            let datePickerRows = el[0].querySelectorAll('tbody tr');
            var eleRow = datePickerRows[0];
            eleRow.children[6].querySelector('[bsdatepickerdaydecorator]').click();
            fixture.detectChanges();
            expect(new Date(wmComponent.datavalue).getDay()).toEqual(5);
            onClickCheckTaglengthOnBody(fixture, null, 'bs-datepicker-container', 0, () => {
                fixture.whenStable().then(() => {
                    onClickCheckTaglengthOnBody(fixture, null, 'timepicker', 1);
                });
            });


        });
    }));

    it('should show the calendar panel when we click on the input control ', async(() => {
        wmComponent.getWidget().showdropdownon = 'default';
        onClickCheckTaglengthOnBody(fixture, '.app-textbox', 'bs-datepicker-container', 1);
    }));

    it('should toggle the AM/PM', async(() => {
        wmComponent.getWidget().datepattern = 'MMM d, yyyy h:mm:ss a';
        fixture.whenStable().then(() => {
            onClickCheckTaglengthOnBody(fixture, '.btn-time', null, null);
            fixture.whenStable().then(() => {
                let ele = document.getElementsByTagName('timepicker');
                let tbodyRows = ele[0].querySelectorAll('tbody tr');
                fixture.detectChanges();
                let tdElement = tbodyRows[1].querySelectorAll('td')[6].querySelector('button');
                let textContent = tdElement.textContent;
                tdElement.click();
                fixture.detectChanges();
                if (textContent.trim() == 'AM') {
                    expect(tdElement.textContent.trim()).toEqual("PM");
                } else {
                    expect(tdElement.textContent.trim()).toEqual("AM");
                }
            });
        });

    }));


    /************************ Scenarios ends **************************************** */

    /************************* Events starts ****************************************** **/

    it('Should trigger the date control change event', async(() => {
        let dateInputControl = getHtmlSelectorElement(fixture, '.btn-time');
        dateInputControl.nativeElement.click();
        spyOn(dateWrapperComponent, 'datetime1Change').and.callThrough();
        fixture.whenStable().then(() => {
            triggerTimerClickonArrowsByIndex(0);

            expect(dateWrapperComponent.datetime1Change).toHaveBeenCalledTimes(1);
        });
    }));


    /************************* Events end ****************************************** **/


});

const dateComponentLocaleModuleDef: ITestModuleDef = {
    declarations: [DatetimeWrapperComponent, DatetimeComponent],
    imports: [ComponentsTestModule, FormsModule, WmComponentsModule.forRoot(), BsDropdownModule.forRoot(), TimepickerModule.forRoot(), BsDatepickerModule.forRoot()],
    providers: [
        { provide: LOCALE_ID, useValue: 'de' },
        { provide: Router, useValue: Router },
        { provide: SecurityService, useValue: SecurityService },
        { provide: UserDefinedExecutionContext, useValue: UserDefinedExecutionContext },
        { provide: AppDefaults, useValue: AppDefaults },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AbstractI18nService,  deps: [BsLocaleService], useClass: MockAbstractI18nServiceDe }

    ]
};

describe(('Datetime Component with Localization'), () => {
    let dateWrapperComponent: DatetimeWrapperComponent;
    let wmComponent: DatetimeComponent;
    let fixture: ComponentFixture<DatetimeWrapperComponent>;

    beforeEach((async () => {
        // register the selected locale language
        registerLocaleData(localeDE);
        fixture = compileTestComponent(dateComponentLocaleModuleDef, DatetimeWrapperComponent);
        dateWrapperComponent = fixture.componentInstance;
        wmComponent = dateWrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create the datetime Component with de locale', async (() => {
        expect(dateWrapperComponent).toBeTruthy();
    }));

    it ('should display localized dates in date picker', async(() => {
        localizedDatePickerTest(fixture, '.btn-date');

    }));

    it ('should display localized meriains in time picker', async(() => {
        localizedTimePickerTest(fixture,  (wmComponent as any).meridians, '.btn-time');
    }));

    it ('should display the defult value in de format',  async(() => {
        const datetime = '2020-02-20 02:00 PM', datepattern = 'yyyy-MM-dd hh:mm a';
        wmComponent.getWidget().datepattern = datepattern;
        wmComponent.datavalue = datetime;
        fixture.detectChanges();
        const dateObj = getNativeDateObject(datetime);
        expect(getFormattedDate((wmComponent as any).datePipe, dateObj, datepattern)).toEqual(getHtmlSelectorElement(fixture, '.app-textbox').nativeElement.value);
    }));

    it('should update the datavalue without error when we type "de" format datetime in inputbox with "12H" format ',  async(() => {
        const datepattern = 'yyyy, dd MMMM hh:mm:ss a';
        wmComponent.getWidget().datepattern = datepattern;
        localizedValueOnInputTest(fixture, '2020, 21 Februar 03:15:00 AM', wmComponent, datepattern);
    }));

    it('should update the datavalue without error when we type "de" format datetime in inputbox with "24H" format',  async(() => {
        const datetime = '2020, 21 Februar 15:15:00', datepattern = 'yyyy, dd MMMM HH:mm:ss';
        wmComponent.getWidget().datepattern = datepattern;
        localizedValueOnInputTest(fixture, '2020, 21 Februar 15:15:00', wmComponent, datepattern);
    }));

});


const dateComponentROLocaleModuleDef: ITestModuleDef = {
    declarations: [DatetimeWrapperComponent, DatetimeComponent],
    imports: [ComponentsTestModule, FormsModule, WmComponentsModule.forRoot(), BsDropdownModule.forRoot(), TimepickerModule.forRoot(), BsDatepickerModule.forRoot()],
    providers: [
        { provide: LOCALE_ID, useValue: 'ro' },
        { provide: Router, useValue: Router },
        { provide: SecurityService, useValue: SecurityService },
        { provide: UserDefinedExecutionContext, useValue: UserDefinedExecutionContext },
        { provide: AppDefaults, useValue: AppDefaults },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AbstractI18nService,  deps: [BsLocaleService], useClass: MockAbstractI18nServiceRO }

    ]
};

describe(('Datetime Component with ro(Romania) Localization'), () => {
    let dateWrapperComponent: DatetimeWrapperComponent;
    let wmComponent: DatetimeComponent;
    let fixture: ComponentFixture<DatetimeWrapperComponent>;

    beforeEach((async () => {
        // register the selected locale language
        registerLocaleData(localeRO);
        fixture = compileTestComponent(dateComponentROLocaleModuleDef, DatetimeWrapperComponent);
        dateWrapperComponent = fixture.componentInstance;
        wmComponent = dateWrapperComponent.wmComponent;
        fixture.detectChanges();
    }));


    it('should update the datavalue without error when we type "ro" format datetime in inputbox with "12H" format ',  async(() => {
        const  datepattern = 'yyyy, dd MMMM hh:mm:ss a';
        wmComponent.getWidget().datepattern = datepattern;
        localizedValueOnInputTest(fixture, '2020, 21 februarie 03:15:00 a.m.', wmComponent, datepattern);
    }));

});

