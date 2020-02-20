import {Component, LOCALE_ID, ViewChild} from '@angular/core';
import { TimeComponent } from './time.component';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../../base/src/test/common-widget.specs';
import { ComponentsTestModule } from '../../../../../base/src/test/components.test.module';
import {
    compileTestComponent,
    getHtmlSelectorElement,
    notHavingTheAttribute,
    hasAttributeCheck,
    checkCustomElementClass,
    onClickCheckTaglengthOnBody
} from '../../../../../base/src/test/util/component-test-util';
import {
    getTimeFieldValue,
    triggerTimerClickonArrowsByIndex,
    datepatternTest,
    outputpatternTest,
    getTimePickerElement,
    localizedTimePickerTest, localizedValueOnInputTest, MockAbstractI18nService
} from '../../../../../base/src/test/util/date-test-util';
import { TimepickerModule, BsDropdownModule, deLocale } from 'ngx-bootstrap';
import { By } from '@angular/platform-browser';
import { async, ComponentFixture } from '@angular/core/testing';
import {
    UserDefinedExecutionContext,
    AppDefaults,
    AbstractI18nService,
    getNativeDateObject,
    getFormattedDate
} from '@wm/core';
import { FormsModule } from '@angular/forms';
import { ToDatePipe } from '../../../../../base/src/pipes/custom-pipes';
import { DatePipe, registerLocaleData } from '@angular/common';
import { WmComponentsModule } from '@wm/components/base';
import localeDE from '@angular/common/locales/de';

declare const moment;

const currentTime = moment(new Date()).format('hh:mm:ss');

class MockAbstractI18nServiceDe {
    constructor() {
        moment.defineLocale('de', deLocale);
    }
    public getSelectedLocale() {
        return 'de';
    }
}

const markup = `<div wmTime  name="time1" hint="my time" datavalue="${currentTime}" maxtime="${currentTime}" mintime="${currentTime}"
shortcutkey="g" tabindex="0" outputformat="hh:mm:ss"  timepattern="hh:mm:ss" hourstep="1" minutestep="20" required="true" showdropdownon="button"
 change.event="time1Change($event, widget, newVal, oldVal)" focus.event="time1Focus($event, widget)" blur.event="time1Blur($event, widget)"
  click.event="time1Click($event, widget)" mouseenter.event="time1Mouseenter($event, widget)" mouseleave.event="time1Mouseleave($event, widget)"
   tap.event="time1Tap($event, widget)"  class="input-group-lg" color="#9f4343" margin="5px"  autofocus="true" ngModel></div>`;

@Component({
    template: markup
})
class TimeWrapperComponent {
    @ViewChild(TimeComponent)
    wmComponent: TimeComponent;

    time1Change($event, widget, newVal, oldVal) {
        console.log('Time Change event triggered!');
    }

    time1Focus($event, widget) {
        console.log('Time Focus event triggered!');
    }

    time1Blur($event, widget) {
        console.log('Time Blur event triggered!');
    }

    time1Click($event, widget) {
        console.log('Time Click event triggered!');
    }

    time1Mouseenter($event, widget) {
        console.log('mouseenter event triggered!');
    }

    time1Mouseleave($event, widget) {
        console.log('Time mouseleave event triggered!');
    }

    time1Tap($event, widget) {
        console.log('Time tap event triggered!');
    }


}

const dateComponentModuleDef: ITestModuleDef = {
    declarations: [TimeWrapperComponent, TimeComponent],
    imports: [ComponentsTestModule, FormsModule, WmComponentsModule.forRoot(), TimepickerModule.forRoot(), BsDropdownModule.forRoot()],
    providers: [
        { provide: UserDefinedExecutionContext, useValue: UserDefinedExecutionContext },
        { provide: AppDefaults, useValue: AppDefaults },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AbstractI18nService, useClass: MockAbstractI18nService }
    ]
};

const dateComponentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-time',
    widgetSelector: '[wmTime]',
    inputElementSelector: 'input.app-textbox',

    testModuleDef: dateComponentModuleDef,
    testComponent: TimeWrapperComponent
};

const TestBase: ComponentTestBase = new ComponentTestBase(dateComponentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyEvents([
    {
        clickableEle: '.btn-date',
        callbackMethod: 'time1Tap',
        eventName: 'tap'
    },
    {
        clickableEle: '.btn-date',
        callbackMethod: 'time1Click',
        eventName: 'click'
    }, {
        mouseSelectionEle: '.app-timeinput',
        callbackMethod: 'time1Mouseleave',
        eventName: 'mouseleave'
    }, {
        mouseSelectionEle: '.app-timeinput',
        callbackMethod: 'time1Mouseenter',
        eventName: 'mouseenter'
    }, {
        eventTrigger: '.app-textbox',
        callbackMethod: 'time1Focus',
        eventName: 'focus'
    },
    {
        eventTrigger: '.app-textbox',
        callbackMethod: 'time1Blur',
        eventName: 'blur'
    }
]);



describe("TimeComponent", () => {
    let timeWrapperComponent: TimeWrapperComponent;
    let wmComponent: TimeComponent;
    let fixture: ComponentFixture<TimeWrapperComponent>;

    beforeEach((async () => {
        fixture = compileTestComponent(dateComponentModuleDef, TimeWrapperComponent);
        timeWrapperComponent = fixture.componentInstance;
        wmComponent = timeWrapperComponent.wmComponent;
        fixture.detectChanges();
    }));


    /************************* Properties starts ****************************************** **/
    it('should not add the hidden property, element always visible', async(() => {
        notHavingTheAttribute(fixture, '.app-timeinput', 'hidden');

    }));

    it('should autofocus the date control ', async(() => {
        let inputEle = getHtmlSelectorElement(fixture, '.app-textbox');
        fixture.whenStable().then(() => {
            expect(inputEle.nativeElement.hasAttribute('autofocus')).toBeTruthy();
        });

    }));

    //TODO
    // it('should autofocus the date control ', () => {
    //     wmComponent.getWidget().autofocus = true;
    //     let inputEle = getHtmlSelectorElement(fixture, '.app-textbox');
    //     fixture.whenStable().then(() => {
    //         console.log(inputEle, '----------')
    //         expect(inputEle).toBe(document.activeElement);
    //         console.log(document.activeElement, '----***------')
    //     });

    // });

    it('should assign the shortkey to the input control as attribute accesskey ', async(() => {
        let dateInputControl = getHtmlSelectorElement(fixture, '.app-textbox');
        expect(dateInputControl.nativeElement.getAttribute('accesskey')).toEqual('g');
    }));

    it("should set the hours step as 1hour on click on top arrow button", async(() => {
        wmComponent.getWidget().hourstep = 2;
        let dateInputControl = getHtmlSelectorElement(fixture, '.btn-date');
        dateInputControl.nativeElement.click();
        fixture.whenStable().then(() => {
            triggerTimerClickonArrowsByIndex(0);
            let hoursValue = +getTimeFieldValue(0);
            expect(hoursValue).toBe(2);

        });
    }));


    it("should set the min step as 30min on click on the second top arrow button", async(() => {
        wmComponent.getWidget().minutestep = 25;

        let dateInputControl = getHtmlSelectorElement(fixture, '.btn-date');
        dateInputControl.nativeElement.click();
        fixture.whenStable().then(() => {
            triggerTimerClickonArrowsByIndex(1);
            let minValue = +getTimeFieldValue(1);
            expect(minValue).toBe(25);

        });
    }));

    it('should set the current date as default value ', async(() => {
        let dateInputControl = getHtmlSelectorElement(fixture, '.app-textbox');
        expect(dateInputControl.nativeElement.value).toEqual(currentTime);
    }));

    it('should set the given date as default value and timepattern check ', async(() => {
        wmComponent.getWidget().timepattern = 'hh:mm a';
        wmComponent.getWidget().datavalue = '12:10';
        fixture.detectChanges();
        let dateInputControl = getHtmlSelectorElement(fixture, '.app-textbox');
        expect(dateInputControl.nativeElement.value).toEqual('12:10 PM');
    }));

    // it('should be readonly mode ', () => {
    //     wmComponent.getWidget().readonly = true;
    //     fixture.detectChanges();
    //     hasAttributeCheck(fixture, '.app-textbox', 'readonly');
    // });
    it('should be disabled mode ', async(() => {
        wmComponent.getWidget().disabled = true;
        fixture.detectChanges();
        hasAttributeCheck(fixture, '.app-textbox', 'disabled');

    }));
    it('should be disabled mode (picker button)', async(() => {
        wmComponent.getWidget().disabled = true;
        fixture.detectChanges();
        hasAttributeCheck(fixture, '.btn-date', 'disabled');

    }));

    it("should show the timer panel on click the time button ", async(() => {
        onClickCheckTaglengthOnBody(fixture, '.btn-date', null, null);
        fixture.whenStable().then(() => {
            expect(document.getElementsByTagName('timepicker').length).toBe(1);
        });
    }));

    it("should not show the timer panel on click the input control ", async(() => {
        onClickCheckTaglengthOnBody(fixture, '.app-textbox', 'timepicker', 0);
    }));


    it('should show the time patten as hh:mm:ss format ', async(() => {
        datepatternTest(fixture, '.app-timeinput', '.app-textbox', 'timepattern', true);
    }));

    it('should get the time outputformat as hh:mm:ss ', async(() => {
        outputpatternTest(fixture, '.app-timeinput', wmComponent.datavalue, true);
    }));

    /************************* Properties ends ****************************************** **/




    /************************* Validations starts ****************************************** **/

    it('should be apply required validation ', async(() => {
        fixture.whenStable().then(() => {
            hasAttributeCheck(fixture, '.app-textbox', 'required')
        });
    }));

    it("should not allow to set the above max time", async(() => {

        onClickCheckTaglengthOnBody(fixture, '.btn-date', null, null);

        fixture.whenStable().then(() => {
            triggerTimerClickonArrowsByIndex(0);
            checkCustomElementClass(getTimePickerElement()[0], 'disabled');
        });
    }));

    it("should not allow to set the above given max time", async(() => {
        wmComponent.getWidget().timepattern = 'HH:mm:ss';
        wmComponent.getWidget().mintime = '01:00:00';
        wmComponent.getWidget().maxtime = "03:00:00";
        wmComponent.getWidget().datavalue = "03:00:00";

        onClickCheckTaglengthOnBody(fixture, '.btn-date', null, null);

        fixture.whenStable().then(() => {
            triggerTimerClickonArrowsByIndex(0);
            checkCustomElementClass(getTimePickerElement()[0], 'disabled');
            checkCustomElementClass(getTimePickerElement()[1], 'disabled');
            checkCustomElementClass(getTimePickerElement()[2], 'disabled');

        });
    }));


    it("should not allow to set the below min time", async(() => {
        let dateInputControl = getHtmlSelectorElement(fixture, '.btn-date');
        dateInputControl.nativeElement.click();
        fixture.whenStable().then(() => {
            triggerTimerClickonArrowsByIndex(3);
            checkCustomElementClass(getTimePickerElement()[3], 'disabled');
        });
    }));

    it("should not allow to set the above given min time", async(() => {
        wmComponent.getWidget().timepattern = 'HH:mm:ss';
        wmComponent.getWidget().mintime = '01:00:00';
        wmComponent.getWidget().maxtime = "03:00:00";
        wmComponent.getWidget().datavalue = "01:00:00";
        onClickCheckTaglengthOnBody(fixture, '.btn-date', null, null);

        fixture.whenStable().then(() => {
            triggerTimerClickonArrowsByIndex(3);
            checkCustomElementClass(getTimePickerElement()[3], 'disabled');
            checkCustomElementClass(getTimePickerElement()[4], 'disabled');
            checkCustomElementClass(getTimePickerElement()[5], 'disabled');

        });
    }));
    /************************* Validations End ****************************************** **/



    /************************* Scenarios starts ***************************************** */

    it('should show the timepicker panel when we click on the input control and onclick outside it should close ', async(() => {
        wmComponent.getWidget().showdropdownon = 'default';
        onClickCheckTaglengthOnBody(fixture, '.app-textbox', null, null);
        fixture.whenStable().then(() => {
            expect(document.getElementsByTagName('timepicker').length).toBe(1);
            document.body.click();
            fixture.whenStable().then(() => {
                expect(document.getElementsByTagName('timepicker').length).toBe(0);
            });

        });
    }));

    it("should be able to select the time between the min and max time", async(() => {
        wmComponent.getWidget().timepattern = 'HH:mm:ss';
        wmComponent.getWidget().mintime = '01:00:00';
        wmComponent.getWidget().maxtime = "03:00:00";
        wmComponent.getWidget().datavalue = "01:00:00";

        onClickCheckTaglengthOnBody(fixture, '.btn-date', null, null);

        fixture.whenStable().then(() => {
            triggerTimerClickonArrowsByIndex(0);
            let hoursValue = +getTimeFieldValue(0);
            expect(hoursValue).toBe(2);
        });
    }));
    /************************* Scenarios End ***************************************** */



    /************************* Events starts ****************************************** **/

    it('Should trigger the date control change event', async(() => {
        wmComponent.getWidget().timepattern = 'HH:mm:ss';
        wmComponent.getWidget().mintime = '01:00:00';
        wmComponent.getWidget().maxtime = "03:00:00";
        wmComponent.getWidget().datavalue = "01:00:00";

        onClickCheckTaglengthOnBody(fixture, '.btn-date', null, null);
        fixture.whenStable().then(() => {
            spyOn(timeWrapperComponent, 'time1Change').and.callThrough();
            triggerTimerClickonArrowsByIndex(1);
            fixture.detectChanges();
            expect(timeWrapperComponent.time1Change).toHaveBeenCalledTimes(1);
        });
    }));

    /************************* Events end ****************************************** **/
});


const dateComponentLocaleModuleDef: ITestModuleDef = {
    declarations: [TimeWrapperComponent, TimeComponent],
    imports: [ComponentsTestModule, FormsModule, WmComponentsModule.forRoot(), TimepickerModule.forRoot(), BsDropdownModule.forRoot()],
    providers: [
        { provide: LOCALE_ID, useValue: 'de' },
        { provide: UserDefinedExecutionContext, useValue: UserDefinedExecutionContext },
        { provide: AppDefaults, useValue: AppDefaults },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AbstractI18nService, useClass: MockAbstractI18nServiceDe }
    ]
};

describe('TimeComponent with localization', () => {
    let timeWrapperComponent: TimeWrapperComponent;
    let wmComponent: TimeComponent;
    let fixture: ComponentFixture<TimeWrapperComponent>;

    beforeEach((async () => {
        // register the selected locale language
        registerLocaleData(localeDE);
        fixture = compileTestComponent(dateComponentLocaleModuleDef, TimeWrapperComponent);
        timeWrapperComponent = fixture.componentInstance;
        wmComponent = timeWrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create the time Component with de locale', () => {
        expect(timeWrapperComponent).toBeTruthy() ;
    });

    it ('should display localized meriains in time picker', async(() => {
         localizedTimePickerTest(fixture,  (wmComponent as any).meridians, '.btn-date');
    }));

    it ('should display the defult value in de format', async(() => {
        const time = '02:00 PM', timepattern = 'hh:mm a';
        wmComponent.getWidget().timepattern = timepattern;
        wmComponent.datavalue = time;
        fixture.detectChanges();
        const dateObj = getNativeDateObject(time);
        expect(getFormattedDate((wmComponent as any).datePipe, dateObj, timepattern)).toEqual(getHtmlSelectorElement(fixture, '.app-textbox').nativeElement.value);
    }));

    it('should update the datavalue without error when we type "de" format time in inputbox with "12H" format', async(() => {
        const time = '03:15:00 nachm.', timepattern = 'hh:mm:ss a', input =  getHtmlSelectorElement(fixture, '.app-textbox');
        wmComponent.getWidget().timepattern = timepattern;
        localizedValueOnInputTest(fixture, '03:15:00 nachm.', wmComponent);
    }));

    it('should update the datavalue without error when we type "de" format time in inputbox with "24H" format', async(() => {
        const time = '15:15:00', timepattern = 'HH:mm:ss';
        wmComponent.getWidget().timepattern = timepattern;
        localizedValueOnInputTest(fixture, '15:15:00', wmComponent);
    }));
});
