import { ComponentFixture, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { Component, ElementRef, Injector, LOCALE_ID, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    UserDefinedExecutionContext,
    AppDefaults,
    AbstractI18nService,
    getNativeDateObject,
    getFormattedDate, App,
    addEventListenerOnElement,
    EVENT_LIFE,
    getMomentLocaleObject,
} from '@wm/core';
import { WmComponentsModule } from '@wm/components/base';
import { SecurityService } from '@wm/security';
import { BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { DatetimeComponent } from './date-time.component';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../../base/src/test/common-widget.specs';
import {
    compileTestComponent,
    getHtmlSelectorElement,
    checkElementClass,
    notHavingTheAttribute,
    hasAttributeCheck,
    onClickCheckTaglengthOnBody,
    mockApp
} from '../../../../../base/src/test/util/component-test-util';
import { FormsModule } from '@angular/forms';
import { ToDatePipe } from '../../../../../base/src/pipes/custom-pipes';
import { DatePipe, registerLocaleData } from '@angular/common';
import {
    getTimeFieldValue,
    triggerTimerClickonArrowsByIndex,
    datepatternTest,
    outputpatternTest,
    localizedTimePickerTest, localizedValueOnInputTest, MockAbstractI18nService, MockAbstractI18nServiceDe, MockAbstractI18nServiceRO
} from '../../../../../base/src/test/util/date-test-util';
import localeDE from '@angular/common/locales/de';
import localeRO from '@angular/common/locales/ro';
import { By } from '@angular/platform-browser';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    getMomentLocaleObject: jest.fn(),
    addEventListenerOnElement: jest.fn(),
    getNativeDateObject: jest.fn(),
    getFormattedDate: jest.fn(),
}));

const getFormatedDate = (date?) => {
    if (!date) {
        return new Date().toISOString().split('.')[0];
    }
    return new Date(date).toISOString().split('.')[0];
}

const currentDate = getFormatedDate();

const markup = `<div wmDateTime  name="datetime1" tabindex="0" datavalue="${currentDate}" showdropdownon="button" hint="Birthtime"
shortcutkey="t" showweeks="true" class="input-group-lg" readonly="true" required="true" autofocus="true"
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

    @ViewChild(DatetimeComponent, /* TODO: add static flag */ { static: true })
    wmComponent: DatetimeComponent;

    datetime1Tap(evt, widget) {
        // console.log("Date time control tap action triggered");
    }
    datetime1Click(evt, widget) {
        // console.log("Date time control click action triggered");

    }

    datetime1Mouseenter(evt, widget) {
        // console.log("Mouse enter event triggered");
    }
    datetime1Mouseleave(evt, wiget) {
        // console.log("Mouse leave event triggered");
    }

    datetime1Focus(evt, widget) {
        // console.log("Focus event triggered");
    }
    datetime1Blur(evt, widget) {
        // console.log("Blur event triggered");
    }

    datetime1Change(evt, widget, newVal, oldVal) {
        // console.log("Change event triggered!");
    }

}

const dateComponentModuleDef: ITestModuleDef = {
    declarations: [DatetimeWrapperComponent, DatetimeComponent],
    imports: [BrowserAnimationsModule, FormsModule, WmComponentsModule.forRoot(), BsDropdownModule.forRoot(), TimepickerModule.forRoot(), BsDatepickerModule.forRoot()],
    providers: [
        { provide: Router, useValue: Router },
        { provide: App, useValue: mockApp },
        { provide: SecurityService, useValue: SecurityService },
        { provide: UserDefinedExecutionContext, useValue: UserDefinedExecutionContext },
        { provide: AppDefaults, useValue: AppDefaults },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AbstractI18nService, useClass: MockAbstractI18nService }
    ],
    teardown: { destroyAfterEach: false }
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
// TestBase.verifyPropsInitialization();  /* to be fixed for readonly property issue */
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();
TestBase.verifyEvents([
    // {
    //     clickableEle: '.btn-date',                /*  expect(jest.fn()).toHaveBeenCalledTimes(expected) */
    //     callbackMethod: 'datetime1Tap',
    //     eventName: 'tap'
    // },
    // {
    //     clickableEle: '.btn-date',              /*  expect(jest.fn()).toHaveBeenCalledTimes(expected) */
    //     callbackMethod: 'datetime1Click',
    //     eventName: 'click'
    // },
    {
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

    afterEach(() => {
        if (fixture) {
            fixture.destroy();
        }
    });



    /************************* Properties starts ****************************************** **/
    it('should not add the hidden property, element always visible', fakeAsync(async () => {
        await notHavingTheAttribute(fixture, '.app-datetime', 'hidden');
    }));

    it("should not show the calendar panel on click the input control (show date picker on only button click) ", waitForAsync(() => {
        fixture.whenStable().then(() => {
            onClickCheckTaglengthOnBody(fixture, '.app-textbox', 'bs-datepicker-container', 0);
        });

    }));

    // TypeError: Cannot read properties of undefined (reading 'getElementsByClassName')
    it("should set the hours step as 1hour on click on top arrow button", waitForAsync(() => {
        let dateInputControl = getHtmlSelectorElement(fixture, '.btn-time');
        dateInputControl.nativeElement.click();
        fixture.whenStable().then(() => {
            triggerTimerClickonArrowsByIndex(0);
            let hoursValue = +getTimeFieldValue(0);
            expect(hoursValue).toBe(1);

        });
    }));

    it("should not show the calendar panel on click the input control ", waitForAsync(() => {

        onClickCheckTaglengthOnBody(fixture, '.app-textbox', 'bs-datepicker-container', 0);
    }));

    it('should assign the shortkey to the input control as attribute accesskey ', waitForAsync(() => {
        let dateInputControl = getHtmlSelectorElement(fixture, '.app-textbox');
        expect(dateInputControl.nativeElement.getAttribute('accesskey')).toEqual('t');
    }));

    it('should show the date pattern as yyyy-MM-ddTHH:mm:ss format', fakeAsync(() => {
        wmComponent.datepattern = 'yyyy-MM-ddTHH:mm:ss';
        fixture.detectChanges();
        tick();  // Allow time for changes to be applied
        datepatternTest(fixture, '.app-datetime', '.app-textbox');
        tick();  // Allow time for the whenStable promise to resolve
    }));

    it('should be disabled mode ', waitForAsync(() => {
        wmComponent.getWidget().disabled = true;
        fixture.detectChanges();
        hasAttributeCheck(fixture, '.app-textbox', 'disabled');
    }));

    it('should be disabled mode (picker button)', waitForAsync(() => {
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

    it('should be required validation ', waitForAsync(() => {
        fixture.whenStable().then(() => {
            let dateInputControl = getHtmlSelectorElement(fixture, '.app-textbox');
            expect(dateInputControl.nativeElement.hasAttribute('required')).toBe(true);
        });
    }));

    it('should respect the mindate validation', waitForAsync(() => {
        wmComponent.getWidget().datavalue = getFormatedDate('2019-11-01');

        checkElementClass(fixture, '.app-datetime', 'ng-invalid');

    }));


    it('should ignore the  excluded days', waitForAsync(() => {
        wmComponent.getWidget().excludedays = '1,6';
        wmComponent.getWidget().datavalue = getFormatedDate('2019-12-30');
        checkElementClass(fixture, '.app-datetime', 'ng-invalid');

    }));


    /************************* Validation end ****************************************** **/





    /************************ Scenarios starts **************************************** */


    // TypeError: Cannot read properties of undefined (reading 'querySelectorAll')
    it('should toggle the AM/PM', waitForAsync(() => {
        wmComponent.getWidget().datepattern = 'MMM d, yyyy h:mm:ss a';

        fixture.whenStable().then(() => {
            onClickCheckTaglengthOnBody(fixture, '.btn-time', null, null);
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                const timepicker = fixture.debugElement.query(By.css('timepicker'));
                const tbodyRows = timepicker.queryAll(By.css('tbody tr'));
                const tdElement = tbodyRows[1].queryAll(By.css('td'))[6]
                    .query(By.css('button')).nativeElement;

                const initialText = tdElement.textContent.trim();
                tdElement.click();
                fixture.detectChanges();

                expect(tdElement.textContent.trim()).toEqual(
                    initialText === 'AM' ? 'PM' : 'AM'
                );
            });
        });
    }));

    it('should autofocus the date control', fakeAsync(() => {
        fixture.detectChanges();
        tick();
        const inputEle = getHtmlSelectorElement(fixture, '.app-textbox').nativeElement;
        expect(inputEle.hasAttribute('autofocus')).toBeTruthy();
    }));

    it('should be able to set the mindate and disable the below mindate on calendar', fakeAsync(() => {
        wmComponent.mindate = '2019-11-02';
        wmComponent.datavalue = '2019-11-02';
        fixture.detectChanges();
        tick();
        const dateButton = getHtmlSelectorElement(fixture, '.btn-date').nativeElement;
        dateButton.click();
        tick(350);
        fixture.detectChanges();
        // Check if the mindate is set correctly
        expect(wmComponent.mindate).toBe('2019-11-02');
    }));

    it('should respect the maxdate validation', fakeAsync(() => {
        wmComponent.maxdate = '2020-01-03';
        wmComponent.datavalue = '2020-01-04';
        fixture.detectChanges();
        tick();
        const isValidSpy = jest.spyOn((wmComponent as any), 'isValid');
        (wmComponent as any).isValid(null);
        expect(isValidSpy).toHaveBeenCalled();
        // Assuming isValid returns undefined for invalid dates
        expect(isValidSpy).toHaveReturnedWith(undefined);
    }));

    it('should disable the excluded days on the calendar panel', fakeAsync(() => {
        wmComponent.excludedays = '1,6';
        fixture.detectChanges();
        tick();
        // Check if the excludedays property is set correctly
        expect(wmComponent.excludedays).toBe('1,6');
    }));

    // it('should disable the excluded date on the calendar panel', fakeAsync(() => {
    //     wmComponent.excludedates = '2020-01-01';
    //     fixture.detectChanges();
    //     tick();
    //     // Check if the excludedates property is set correctly
    //     expect(wmComponent.excludedates).toBe('2020-01-01');
    // }));


});

const dateComponentLocaleModuleDef: ITestModuleDef = {
    declarations: [DatetimeWrapperComponent, DatetimeComponent],
    imports: [BrowserAnimationsModule, FormsModule, WmComponentsModule.forRoot(), BsDropdownModule.forRoot(), TimepickerModule.forRoot(), BsDatepickerModule.forRoot()],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: LOCALE_ID, useValue: 'de' },
        { provide: Router, useValue: Router },
        { provide: SecurityService, useValue: SecurityService },
        { provide: UserDefinedExecutionContext, useValue: UserDefinedExecutionContext },
        { provide: AppDefaults, useValue: AppDefaults },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AbstractI18nService, deps: [BsLocaleService], useClass: MockAbstractI18nServiceDe },
        { provide: Injector, useValue: Injector },
        { provide: ElementRef, useValue: { nativeElement: document.createElement('div') } }
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
    afterEach(() => {
        if (fixture) {
            fixture.destroy();
        }
    });

    it('should create the datetime Component with de locale', fakeAsync(() => {
        expect(dateWrapperComponent).toBeTruthy();
    }));

    it('should display localized meriains in time picker', (() => {
        localizedTimePickerTest(fixture, (wmComponent as any).meridians, '.btn-time');
    }));

    it('should update the datavalue without error when we type "de" format datetime in inputbox with "12H" format ', fakeAsync(() => {
        const datepattern = 'yyyy, dd MMMM hh:mm:ss a';
        wmComponent.getWidget().datepattern = datepattern;
        localizedValueOnInputTest(fixture, '2020, 21 Februar 03:15:00 AM', wmComponent, datepattern);
    }));

    it('should update the datavalue without error when we type "de" format datetime in inputbox with "24H" format', fakeAsync(() => {
        const datetime = '2020, 21 Februar 15:15:00', datepattern = 'yyyy, dd MMMM HH:mm:ss';
        wmComponent.getWidget().datepattern = datepattern;
        localizedValueOnInputTest(fixture, '2020, 21 Februar 15:15:00', wmComponent, datepattern);
    }));

    describe('setIsTimeOpen', () => {
        it('should set isTimeOpen to true', () => {
            (wmComponent as any).setIsTimeOpen(true);
            expect(wmComponent.isTimeOpen).toBe(true);
        });

        it('should set isTimeOpen to false', () => {
            (wmComponent as any).setIsTimeOpen(false);
            expect(wmComponent.isTimeOpen).toBe(false);
        });
    });

    describe('hideTimepickerDropdown', () => {
        let originalJQuery;

        beforeEach(() => {
            wmComponent.invokeOnTouched = jest.fn();
            wmComponent.toggleTimePicker = jest.fn();
            (wmComponent as any).deregisterTimepickeEventListener = jest.fn();

            // Store the original jQuery and replace it with a mock only for this describe block
            originalJQuery = (global as any).$;
            (global as any).$ = jest.fn().mockReturnValue({
                closest: jest.fn().mockReturnValue({ length: 1 })
            });
        });

        afterEach(() => {
            // Restore the original jQuery after each test in this block
            (global as any).$ = originalJQuery;
        });

        it('should call invokeOnTouched', () => {
            (wmComponent as any).hideTimepickerDropdown();
            expect(wmComponent.invokeOnTouched).toHaveBeenCalled();
        });
        it('should call app.notify if parentEl exists', () => {
            (wmComponent as any).hideTimepickerDropdown();
            expect((wmComponent as any).app.notify).toHaveBeenCalledWith(
                'captionPositionAnimate',
                expect.objectContaining({
                    displayVal: wmComponent.displayValue,
                    nativeEl: expect.anything()
                })
            );
        });
    });

    describe('setTimeInterval', () => {
        let originalSetInterval;
        let mockSetInterval;

        beforeEach(() => {
            originalSetInterval = global.setInterval;
            mockSetInterval = jest.fn();
            global.setInterval = mockSetInterval;
            (wmComponent as any).onModelUpdate = jest.fn();
        });

        afterEach(() => {
            global.setInterval = originalSetInterval;
        });

        it('should not set interval if timeinterval already exists', () => {
            (wmComponent as any).timeinterval = 123;
            (wmComponent as any).setTimeInterval();
            expect(mockSetInterval).not.toHaveBeenCalled();
        });

        it('should set interval if timeinterval does not exist', () => {
            (wmComponent as any).setTimeInterval();
            expect(mockSetInterval).toHaveBeenCalledTimes(1);
            expect(mockSetInterval).toHaveBeenLastCalledWith(expect.any(Function), 1000);
        });

        it('should call onModelUpdate with current time every second', () => {
            (wmComponent as any).setTimeInterval();
            const intervalCallback = mockSetInterval.mock.calls[0][0];
            intervalCallback(); // Simulate interval tick
            expect((wmComponent as any).onModelUpdate).toHaveBeenCalledTimes(1);
        });

        it('should use getMomentLocaleObject if timeZone is set', () => {
            Object.defineProperty(wmComponent, 'timeZone', { value: 'America/New_York' });
            const mockDate = new Date('2023-01-01T12:00:00');
            (getMomentLocaleObject as jest.Mock).mockReturnValue(mockDate);

            (wmComponent as any).setTimeInterval();
            const intervalCallback = mockSetInterval.mock.calls[0][0];
            intervalCallback(); // Simulate interval tick

            expect(getMomentLocaleObject).toHaveBeenCalledWith('America/New_York');
            expect((wmComponent as any).onModelUpdate).toHaveBeenCalledWith(mockDate);
        });
    });

    describe('clearTimeInterval', () => {
        let originalClearInterval;
        let mockClearInterval;

        beforeEach(() => {
            originalClearInterval = global.clearInterval;
            mockClearInterval = jest.fn();
            global.clearInterval = mockClearInterval;
        });

        afterEach(() => {
            global.clearInterval = originalClearInterval;
        });

        it('should clear interval if timeinterval exists', () => {
            (wmComponent as any).timeinterval = 123;
            (wmComponent as any).clearTimeInterval();
            expect(mockClearInterval).toHaveBeenCalledWith(123);
            expect((wmComponent as any).timeinterval).toBeNull();
        });

        it('should not clear interval if timeinterval does not exist', () => {
            (wmComponent as any).timeinterval = null;
            (wmComponent as any).clearTimeInterval();
            expect(mockClearInterval).not.toHaveBeenCalled();
        });
    });

    describe('toggleTimePicker', () => {
        beforeEach(() => {
            wmComponent.loadNativeDateInput = false;
            wmComponent.onDateTimeInputFocus = jest.fn();
            wmComponent.invokeEventCallback = jest.fn();
            (wmComponent as any).addTimepickerClickListener = jest.fn();
        });

        it('should call onDateTimeInputFocus if loadNativeDateInput is true', () => {
            wmComponent.loadNativeDateInput = true;
            wmComponent.toggleTimePicker(true);
            expect(wmComponent.onDateTimeInputFocus).toHaveBeenCalled();
            expect(wmComponent.isTimeOpen).not.toBe(true);
        });

        it('should set isTimeOpen to the new value', () => {
            wmComponent.toggleTimePicker(true);
            expect(wmComponent.isTimeOpen).toBe(true);
        });

        it('should invoke click event callback if event type is click', () => {
            const mockEvent = { type: 'click' };
            wmComponent.toggleTimePicker(true, mockEvent);
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('click', { $event: mockEvent });
        });

        it('should call addTimepickerClickListener', () => {
            wmComponent.toggleTimePicker(true);
            expect((wmComponent as any).addTimepickerClickListener).toHaveBeenCalledWith(true);
        });
    });

    describe('addTimepickerClickListener', () => {
        let originalSetTimeout;
        let mockBodyElement;
        let mockDropdownElement;
        let originalJQuery;

        beforeEach(() => {
            originalSetTimeout = global.setTimeout;
            global.setTimeout = jest.fn().mockImplementation(cb => cb());

            mockBodyElement = document.createElement('body');
            mockDropdownElement = document.createElement('div');
            document.querySelector = jest.fn().mockReturnValue(mockBodyElement);

            // Store the original jQuery
            originalJQuery = (global as any).$;

            // Mock jQuery only for this describe block
            (global as any).$ = jest.fn().mockReturnValue({
                find: jest.fn().mockReturnValue({
                    get: jest.fn().mockReturnValue(mockDropdownElement)
                })
            });

            wmComponent.showdropdownon = 'default';
            (wmComponent as any).isDropDownDisplayEnabledOnInput = jest.fn().mockReturnValue(true);
        });

        afterEach(() => {
            global.setTimeout = originalSetTimeout;
            // Restore the original jQuery
            (global as any).$ = originalJQuery;
        });

        it('should not add listener if skipListener is false', () => {
            (wmComponent as any).addTimepickerClickListener(false);
            expect(addEventListenerOnElement).not.toHaveBeenCalled();
        });

        it('should add listener if skipListener is true', () => {
            (wmComponent as any).addTimepickerClickListener(true);
            expect(addEventListenerOnElement).toHaveBeenCalledWith(
                mockBodyElement,
                mockDropdownElement,
                wmComponent.nativeElement,
                'click',
                true,
                expect.any(Function),
                EVENT_LIFE.ONCE,
                true
            );
        });

        it('should set deregisterTimepickeEventListener', () => {
            const mockDeregister = jest.fn();
            (addEventListenerOnElement as jest.Mock).mockReturnValue(mockDeregister);

            (wmComponent as any).addTimepickerClickListener(true);
            expect((wmComponent as any).deregisterTimepickeEventListener).toBe(mockDeregister);
        });
    });

    describe('hideDatepickerDropdown', () => {
        let originalJQuery;

        beforeEach(() => {
            (wmComponent as any).focusTrap = { deactivate: jest.fn() };
            wmComponent.invokeOnTouched = jest.fn();
            wmComponent.bsDatePickerDirective = { hide: jest.fn() };
            wmComponent.toggleTimePicker = jest.fn();
            wmComponent.blurDateInput = jest.fn();
            (wmComponent as any).deregisterDatepickerEventListener = jest.fn();

            originalJQuery = (global as any).$;
            (global as any).$ = jest.fn().mockReturnValue({
                closest: jest.fn().mockReturnValue({ length: 1 })
            });
        });

        afterEach(() => {
            (global as any).$ = originalJQuery;
        });

        it('should set isDateOpen to false', () => {
            wmComponent.hideDatepickerDropdown();
            expect(wmComponent.isDateOpen).toBeFalsy();
        });

        it('should deactivate focusTrap if it exists', () => {
            wmComponent.hideDatepickerDropdown();
            expect((wmComponent as any).focusTrap.deactivate).toHaveBeenCalled();
        });

        it('should call invokeOnTouched', () => {
            wmComponent.hideDatepickerDropdown();
            expect(wmComponent.invokeOnTouched).toHaveBeenCalled();
        });

        it('should hide bsDatePickerDirective', () => {
            wmComponent.hideDatepickerDropdown();
            expect(wmComponent.bsDatePickerDirective.hide).toHaveBeenCalled();
        });

        it('should toggle time picker if bsDateValue exists', () => {
            wmComponent.bsDateValue = new Date();
            wmComponent.hideDatepickerDropdown();
            expect(wmComponent.toggleTimePicker).toHaveBeenCalledWith(true);
        });

        it('should set isEnterPressedOnDateInput to false', () => {
            (wmComponent as any).isEnterPressedOnDateInput = true;
            wmComponent.hideDatepickerDropdown();
            expect((wmComponent as any).isEnterPressedOnDateInput).toBeFalsy();
        });

        it('should call deregisterDatepickerEventListener if it exists', () => {
            wmComponent.hideDatepickerDropdown();
            expect((wmComponent as any).deregisterDatepickerEventListener).toHaveBeenCalled();
        });

        it('should call app.notify if parentEl exists', () => {
            wmComponent.hideDatepickerDropdown();
            expect((wmComponent as any).app.notify).toHaveBeenCalledWith(
                'captionPositionAnimate',
                expect.objectContaining({
                    displayVal: wmComponent.displayValue,
                    nativeEl: expect.anything()
                })
            );
        });

        it('should call blurDateInput', () => {
            wmComponent.hideDatepickerDropdown();
            expect(wmComponent.blurDateInput).toHaveBeenCalledWith(false);
        });
    });

    describe('onDateChange', () => {
        beforeEach(() => {
            (wmComponent as any).formatValidation = jest.fn().mockReturnValue(true);
            (wmComponent as any).minDateMaxDateValidationOnInput = jest.fn().mockReturnValue(false);
            wmComponent.onModelUpdate = jest.fn();
            (getNativeDateObject as jest.Mock).mockReturnValue(new Date());
        });

        it('should return early if isEnterPressedOnDateInput is true', () => {
            (wmComponent as any).isEnterPressedOnDateInput = true;
            wmComponent.onDateChange({ target: { value: '2023-01-01' } });
            expect((wmComponent as any).isEnterPressedOnDateInput).toBeFalsy();
        });

        it('should call getNativeDateObject with correct parameters', () => {
            wmComponent.loadNativeDateInput = true;
            wmComponent.outputformat = 'yyyy-MM-dd';
            wmComponent.onDateChange({ target: { value: '2023-01-01' } });
            expect(getNativeDateObject).toHaveBeenCalledWith('2023-01-01', expect.objectContaining({
                pattern: 'yyyy-MM-dd',
                isNativePicker: true
            }));
        });

        it('should return early if formatValidation fails', () => {
            (wmComponent as any).formatValidation = jest.fn().mockReturnValue(false);
            wmComponent.onDateChange({ target: { value: '2023-01-01' } });
            expect(wmComponent.onModelUpdate).not.toHaveBeenCalled();
        });

        it('should return early if minDateMaxDateValidationOnInput fails for native picker', () => {
            (wmComponent as any).minDateMaxDateValidationOnInput = jest.fn().mockReturnValue(true);
            wmComponent.onDateChange({ target: { value: '2023-01-01' } }, true);
            expect(wmComponent.onModelUpdate).not.toHaveBeenCalled();
        });

        it('should set invalidDateTimeFormat to false and call onModelUpdate', () => {
            wmComponent.onDateChange({ target: { value: '2023-01-01' } });
            expect((wmComponent as any).invalidDateTimeFormat).toBeFalsy();
            expect(wmComponent.onModelUpdate).toHaveBeenCalled();
        });
    });

    describe('onDisplayKeydown', () => {
        beforeEach(() => {
            (wmComponent as any).isDropDownDisplayEnabledOnInput = jest.fn().mockReturnValue(true);
            wmComponent.invokeOnChange = jest.fn();
            wmComponent.toggleDpDropdown = jest.fn();
            wmComponent.hideDatepickerDropdown = jest.fn();
            (wmComponent as any).hideTimepickerDropdown = jest.fn();
            (getNativeDateObject as jest.Mock).mockReturnValue(new Date());
            (getFormattedDate as jest.Mock).mockReturnValue('2023-01-01');
        });

        it('should stop propagation if dropdown is enabled on input', () => {
            const event = { stopPropagation: jest.fn(), target: { value: '2023-01-01' }, key: 'a' };
            wmComponent.onDisplayKeydown(event);
            expect(event.stopPropagation).toHaveBeenCalled();
        });

        it('should handle Enter key press', () => {
            const event = { preventDefault: jest.fn(), stopPropagation: jest.fn(), target: { value: '2023-01-01' }, key: 'Enter' };
            wmComponent.onDisplayKeydown(event);
            expect(event.preventDefault).toHaveBeenCalled();
            expect(wmComponent.toggleDpDropdown).toHaveBeenCalled();
        });

        it('should set invalidDateTimeFormat to true if input doesnt Math formatted Date', () => {
            const event = { preventDefault: jest.fn(), stopPropagation: jest.fn(), target: { value: '2023-01-02' }, key: 'Enter' };
            wmComponent.onDisplayKeydown(event);
            expect((wmComponent as any).invalidDateTimeFormat).toBeTruthy();
            expect(wmComponent.invokeOnChange).toHaveBeenCalled();
        });

        it('should set bsDatePickerDirective.bsValue if input matches formatted date', () => {
            const event = { preventDefault: jest.fn(), stopPropagation: jest.fn(), target: { value: '2023-01-01' }, key: 'Enter' };
            wmComponent.bsDatePickerDirective = { bsValue: null };
            wmComponent.onDisplayKeydown(event);
            expect((wmComponent as any).invalidDateTimeFormat).toBeFalsy();
            expect((wmComponent as any).isEnterPressedOnDateInput).toBeTruthy();
            expect(wmComponent.bsDatePickerDirective.bsValue).toEqual(expect.any(Date));
        });

        it('should hide datepicker and timepicker dropdowns for other keys', () => {
            const event = { stopPropagation: jest.fn(), target: { value: '2023-01-01' }, key: 'a' };
            wmComponent.onDisplayKeydown(event);
            expect(wmComponent.hideDatepickerDropdown).toHaveBeenCalled();
            expect((wmComponent as any).hideTimepickerDropdown).toHaveBeenCalled();
        });
    });

    describe('onInputBlur', () => {
        let originalJQuery;

        beforeEach(() => {
            wmComponent.invokeOnTouched = jest.fn();
            wmComponent.invokeEventCallback = jest.fn();

            originalJQuery = (global as any).$;
            (global as any).$ = jest.fn().mockReturnValue({
                hasClass: jest.fn().mockReturnValue(false)
            });
        });

        afterEach(() => {
            (global as any).$ = originalJQuery;
        });

        it('should call invokeOnTouched and invokeEventCallback if relatedTarget does not have current-date class', () => {
            const event = { relatedTarget: {} };
            wmComponent.onInputBlur(event);
            expect(wmComponent.invokeOnTouched).toHaveBeenCalled();
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('blur', { $event: event });
        });

        it('should not call invokeOnTouched and invokeEventCallback if relatedTarget has current-date class', () => {
            (global as any).$ = jest.fn().mockReturnValue({
                hasClass: jest.fn().mockReturnValue(true)
            });
            const event = { relatedTarget: {} };
            wmComponent.onInputBlur(event);
            expect(wmComponent.invokeOnTouched).not.toHaveBeenCalled();
            expect(wmComponent.invokeEventCallback).not.toHaveBeenCalled();
        });
    });

    describe('onModelUpdate', () => {
        let originalJQuery;

        beforeEach(() => {
            (wmComponent as any).invalidDateTimeFormat = true;
            Object.defineProperty(wmComponent, 'displayValue', { value: '2023-01-01', writable: true });
            (wmComponent as any).minDateMaxDateValidationOnInput = jest.fn();
            (wmComponent as any)._debouncedOnChange = jest.fn();
            (wmComponent as any).cdRef = { detectChanges: jest.fn() };
            wmComponent.toggleTimePicker = jest.fn();
            (wmComponent as any).updateTimepickerFields = jest.fn();

            originalJQuery = (global as any).$;
            (global as any).$ = jest.fn().mockReturnValue({
                find: jest.fn().mockReturnValue({ val: jest.fn() }),
                length: 1
            });

            (getFormattedDate as jest.Mock).mockReturnValue('2023-01-01');
            (getMomentLocaleObject as jest.Mock).mockReturnValue(new Date('2023-01-01'));
        });

        afterEach(() => {
            (global as any).$ = originalJQuery;
        });

        it('should update display value when type is date', () => {
            wmComponent.onModelUpdate(new Date('2023-01-01'), 'date');
            expect((wmComponent as any).invalidDateTimeFormat).toBeFalsy();
            expect((global as any).$().find().val).toHaveBeenCalledWith('2023-01-01');
        });

        it('should call minDateMaxDateValidationOnInput', () => {
            wmComponent.onModelUpdate(new Date('2023-01-01'));
            expect((wmComponent as any).minDateMaxDateValidationOnInput).toHaveBeenCalled();
        });

        it('should handle null newVal', () => {
            wmComponent.onModelUpdate(null);
            expect(wmComponent.bsDateValue).toBeUndefined();
            expect((wmComponent as any)._debouncedOnChange).toHaveBeenCalled();
        });

        it('should toggle time picker if type is date and isDateOpen is true', () => {
            wmComponent.isDateOpen = true;
            wmComponent.onModelUpdate(new Date('2023-01-01'), 'date');
            expect(wmComponent.toggleTimePicker).toHaveBeenCalledWith(true);
        });

        it('should update proxyModel and trigger change', () => {
            wmComponent.onModelUpdate(new Date('2023-01-01'));
            expect((wmComponent as any).proxyModel).toEqual(expect.any(Date));
            expect((wmComponent as any)._debouncedOnChange).toHaveBeenCalled();
            expect((wmComponent as any).cdRef.detectChanges).toHaveBeenCalled();
        });

        it('should update timepicker fields when timezone is provided', () => {
            Object.defineProperty(wmComponent, 'timeZone', { value: 'America/New_York' });
            (wmComponent as any).key = 'datetimestamp';
            wmComponent.onModelUpdate(new Date('2023-01-01'));
            expect((wmComponent as any).updateTimepickerFields).toHaveBeenCalled();
        });
    });

    describe('getTimePattern', () => {
        it('should return correct time pattern with seconds', () => {
            wmComponent.datepattern = 'yyyy-MM-dd HH:mm:ss';
            expect((wmComponent as any).getTimePattern()).toBe('HH:mm:ss');
        });

        it('should return correct time pattern without seconds', () => {
            wmComponent.datepattern = 'yyyy-MM-dd HH:mm';
            expect((wmComponent as any).getTimePattern()).toBe('HH:mm');
        });

        it('should include meridian if present', () => {
            wmComponent.datepattern = 'yyyy-MM-dd hh:mm:ss a';
            const result = (wmComponent as any).getTimePattern();
            expect(result).toMatch(/hh:mm:ss/);
            expect(result).toContain('a');
        });
    });

    describe('updateTimepickerFields', () => {
        let originalJQuery;

        beforeEach(() => {
            originalJQuery = (global as any).$;
            (global as any).$ = jest.fn().mockReturnValue({
                html: jest.fn().mockReturnValue('AM'),
                text: jest.fn()
            });
        });

        afterEach(() => {
            (global as any).$ = originalJQuery;
        });

        it('should update timepicker fields correctly', () => {
            const mockFields = [{ value: '' }, { value: '' }, { value: '' }];
            (wmComponent as any).updateTimepickerFields('10:30:00 AM', mockFields);
            expect(mockFields[0].value).toBe('10');
            expect(mockFields[1].value).toBe('30');
            expect(mockFields[2].value).toBe('00');
        });

        it('should update meridian field if different', () => {
            (wmComponent as any).updateTimepickerFields('10:30:00 PM', []);
            expect((global as any).$().text).toHaveBeenCalledWith('PM');
        });
    });

    describe('preventTpClose', () => {
        it('should stop event propagation', () => {
            const mockEvent = { stopImmediatePropagation: jest.fn() };
            (wmComponent as any).preventTpClose(mockEvent);
            expect(mockEvent.stopImmediatePropagation).toHaveBeenCalled();
        });
    });

    describe('toggleDpDropdown', () => {
        let originalJQuery;

        beforeEach(() => {
            wmComponent.loadNativeDateInput = false;
            wmComponent.onDateTimeInputFocus = jest.fn();
            wmComponent.invokeEventCallback = jest.fn();
            (wmComponent as any).isDropDownDisplayEnabledOnInput = jest.fn().mockReturnValue(true);
            wmComponent.bsDatePickerDirective = { toggle: jest.fn(), isOpen: true };
            (wmComponent as any).addBodyClickListener = jest.fn();

            originalJQuery = (global as any).$;
            (global as any).$ = jest.fn().mockReturnValue({
                is: jest.fn().mockReturnValue(false)
            });
        });

        afterEach(() => {
            (global as any).$ = originalJQuery;
        });

        it('should call onDateTimeInputFocus for native input', () => {
            wmComponent.loadNativeDateInput = true;
            wmComponent.toggleDpDropdown({ type: 'click' });
            expect(wmComponent.onDateTimeInputFocus).toHaveBeenCalled();
        });

        it('should invoke click event callback', () => {
            wmComponent.toggleDpDropdown({ type: 'click' });
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('click', expect.any(Object));
        });

        it('should stop propagation for input click when dropdown is not enabled', () => {
            (wmComponent as any).isDropDownDisplayEnabledOnInput.mockReturnValue(false);
            const mockEvent = { type: 'click', target: {}, stopPropagation: jest.fn() };
            (global as any).$.mockReturnValue({ is: jest.fn().mockReturnValue(true) });
            wmComponent.toggleDpDropdown(mockEvent);
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });

        it('should toggle datepicker and add body click listener', () => {
            wmComponent.toggleDpDropdown({ type: 'click' });
            expect(wmComponent.bsDatePickerDirective.toggle).toHaveBeenCalled();
            expect((wmComponent as any).addBodyClickListener).toHaveBeenCalledWith(true);
        });
    });

});


const dateComponentROLocaleModuleDef: ITestModuleDef = {
    declarations: [DatetimeWrapperComponent, DatetimeComponent],
    imports: [BrowserAnimationsModule, FormsModule, WmComponentsModule.forRoot(), BsDropdownModule.forRoot(), TimepickerModule.forRoot(), BsDatepickerModule.forRoot()],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: LOCALE_ID, useValue: 'ro' },
        { provide: Router, useValue: Router },
        { provide: SecurityService, useValue: SecurityService },
        { provide: UserDefinedExecutionContext, useValue: UserDefinedExecutionContext },
        { provide: AppDefaults, useValue: AppDefaults },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AbstractI18nService, deps: [BsLocaleService], useClass: MockAbstractI18nServiceRO }

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

    afterEach(() => {
        if (fixture) {
            fixture.destroy();
        }
    });


    it('should update the datavalue without error when we type "ro" format datetime in inputbox with "12H" format ', fakeAsync(() => {
        const datepattern = 'yyyy, dd MMMM hh:mm:ss a';
        wmComponent.getWidget().datepattern = datepattern;
        localizedValueOnInputTest(fixture, '2020, 21 februarie 03:15:00 a.m.', wmComponent, datepattern);
    }));

});

