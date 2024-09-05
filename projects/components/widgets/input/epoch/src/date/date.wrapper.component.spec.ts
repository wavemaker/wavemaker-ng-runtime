import { Component, LOCALE_ID, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    UserDefinedExecutionContext,
    AppDefaults,
    AbstractI18nService,
    getDateObj,
    getFormattedDate, App
} from '@wm/core';
import { SecurityService } from '@wm/security';
import { DatePipe, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WmComponentsModule } from '@wm/components/base';

import { waitForAsync, ComponentFixture } from '@angular/core/testing';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DateComponent } from './date.component';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../../base/src/test/common-widget.specs';
import { compileTestComponent, getHtmlSelectorElement, checkElementClass, onClickCheckTaglengthOnBody, onClickCheckClassEleLengthOnBody, hasAttributeCheck, mockApp } from '../../../../../base/src/test/util/component-test-util';
import {
    datepatternTest,
    outputpatternTest,
    disableMaxDatePanel,
    disableMindatePanel,
    excludedDaysDisable,
    expectCheckEleHasDisabled,
    localizedDatePickerTest,
    MockAbstractI18nService,
    MockAbstractI18nServiceDe
} from '../../../../../base/src/test/util/date-test-util';
import { ToDatePipe } from 'projects/components/base/src/pipes/custom-pipes';
import localeDE from '@angular/common/locales/de';
import { IMaskDirective, IMaskModule } from 'angular-imask';
import { BsDatepickerDirective } from 'ngx-bootstrap/datepicker';

const currentDate = new Date().toISOString().split('T')[0];
class MockIMaskDirective {
    destroyMask() {
        console.log("Destroy mask called")
    }
}
const markup = `<div wmDate  name="date1" mindate="2019-12-02"  datavalue="${currentDate}" dataentrymode="default" placeholder="Select birth date"
   shortcutkey="d" class="input-group-sm" showdropdownon="button" showweeks="true"  hint="Test hint" datepattern="yyyy-MM-dd"
   outputformat="yyyy-MM-dd" required="true" tabindex="1"  autofocus="true" class="input-group-sm" color="#b6a9a9"
    change.event="date1Change($event, widget, newVal, oldVal)" focus.event="date1Focus($event, widget)"
    blur.event="date1Blur($event, widget)" click.event="date1Click($event, widget)" mouseenter.event="date1Mouseenter($event, widget)"
     mouseleave.event="date1Mouseleave($event, widget)" tap.event="date1Tap($event, widget)" margintop="30px" marginright="23px" ngModel></div>`;
@Component({
    template: markup
})

class DateWrapperComponent {
    @ViewChild(DateComponent, /* TODO: add static flag */ { static: true })
    wmComponent: DateComponent;



    date1Tap(evt, widget) {
        // console.log('Date control tap action triggered');
    }
    date1Click(evt, widget) {
        // console.log('Date control click action triggered');

    }

    date1Mouseenter(evt, widget) {
        // console.log('Mouse enter event triggered');
    }
    date1Mouseleave(evt, wiget) {
        // console.log('Mouse leave event triggered');
    }

    date1Focus(evt, widget) {
        // console.log('Focus event triggered');
    }
    date1Blur(evt, widget) {
        // console.log('Blur event triggered');
    }

    date1Change(evt, widget, newVal, oldVal) {
        // console.log('Change event triggered!');
    }

}

const dateComponentModuleDef: ITestModuleDef = {
    declarations: [DateWrapperComponent, DateComponent],
    imports: [BrowserAnimationsModule, FormsModule, WmComponentsModule.forRoot(), BsDatepickerModule.forRoot(), IMaskModule],
    providers: [
        { provide: Router, useValue: Router },
        { provide: App, useValue: mockApp },
        { provide: SecurityService, useValue: SecurityService },
        { provide: UserDefinedExecutionContext, useValue: UserDefinedExecutionContext },
        { provide: AppDefaults, useValue: AppDefaults },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AbstractI18nService, useClass: MockAbstractI18nService },
        { provide: IMaskDirective, useClass: MockIMaskDirective },
        { provide: BsDatepickerDirective, useClass: BsDatepickerDirective }
    ],
    teardown: { destroyAfterEach: false }
};

const dateComponentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-date',
    widgetSelector: '[wmDate]',
    inputElementSelector: 'input.app-dateinput',

    testModuleDef: dateComponentModuleDef,
    testComponent: DateWrapperComponent
};

const TestBase: ComponentTestBase = new ComponentTestBase(dateComponentDef);
// TestBase.verifyPropsInitialization();  /* to be fixed for mindate issue */
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyEvents([
    {
        clickableEle: '.btn-time',
        callbackMethod: 'date1Tap',
        eventName: 'tap'
    },
    {
        clickableEle: '.btn-time',
        callbackMethod: 'date1Click',
        eventName: 'click'
    }, {
        mouseSelectionEle: '.app-date',
        callbackMethod: 'date1Mouseleave',
        eventName: 'mouseleave'
    }, {
        mouseSelectionEle: '.app-date',
        callbackMethod: 'date1Mouseenter',
        eventName: 'mouseenter'
    }, {
        eventTrigger: '.app-dateinput',
        callbackMethod: 'date1Focus',
        eventName: 'focus'
    },
    {
        eventTrigger: '.app-dateinput',
        callbackMethod: 'date1Blur',
        eventName: 'blur'
    }
]);
TestBase.verifyAccessibility();


describe('DateComponent', () => {
    let dateWrapperComponent: DateWrapperComponent;
    let wmComponent: DateComponent;
    let fixture: ComponentFixture<DateWrapperComponent>;
    beforeEach((async () => {
        fixture = compileTestComponent(dateComponentModuleDef, DateWrapperComponent);
        dateWrapperComponent = fixture.componentInstance;
        wmComponent = dateWrapperComponent.wmComponent;
        // wmComponent.imask = TestBed.inject(IMaskDirective);
        fixture.detectChanges();
    }));
    afterEach(() => {
        if (fixture) {
            fixture.destroy();
        }
    });



    /************************* Properties starts ****************************************** **/

    it('should show the calendar panel on click the date button (show date picker on button click)', waitForAsync(() => {
        onClickCheckTaglengthOnBody(fixture, '.btn-time', 'bs-datepicker-container', 1);
    }));

    it('should not show the calendar panel on click the input control (show date picker on only button click) ', waitForAsync(() => {
        onClickCheckTaglengthOnBody(fixture, '.app-dateinput', 'bs-datepicker-container', 0);

    }));

    // TODO: Need to check
    // it("should allow user to select the date from picker only(Date entry mode picker)", () => {
    //     wmComponent.getWidget().dataentrymode = "picker";
    //     fixture.detectChanges();
    //     hasAttributeCheck(fixture, '.app-dateinput', 'readonly');
    // });

    it('should show the week numbers on the calendar pan ', waitForAsync(() => {
        onClickCheckClassEleLengthOnBody(fixture, '.btn-time', 'table.weeks', 1);

    }));

    it('should not show the week numbers on the calendar pan ', waitForAsync(() => {
        wmComponent.getWidget().showweeks = false;
        onClickCheckClassEleLengthOnBody(fixture, '.btn-time', 'table.weeks', 0);

    }));

    it('should assign the shortkey to the input control as attribute accesskey ', waitForAsync(() => {
        const dateInputControl = getHtmlSelectorElement(fixture, '.app-dateinput');
        expect(dateInputControl.nativeElement.getAttribute('accesskey')).toEqual('d');
    }));


    it('should set the current date as default value ', waitForAsync(() => {
        const dateInputControl = getHtmlSelectorElement(fixture, '.app-dateinput');
        expect(dateInputControl.nativeElement.value).toEqual(currentDate);
    }));

    it('should update the datevalue as currentdate', async () => {
        wmComponent.setProperty('datavalue', 'CURRENT_DATE');
        fixture.detectChanges();
        const dateInputControl = getHtmlSelectorElement(fixture, '.app-dateinput');
        expect(dateInputControl.nativeElement.value).toBe(wmComponent.datavalue);
        const newDateValue = '2020-01-24';
        wmComponent.setProperty('datavalue', newDateValue);
        setTimeout(() => {
            expect(dateInputControl.nativeElement.value).toBe(newDateValue);
        }, 1000);

    });

    it('should show the date patten as yyyy-mm-dd format ', (() => {
        datepatternTest(fixture, '.app-date', '.app-dateinput');

    }));

    it('should get the date outputformat as yyyy-mm-dd ', (() => {
        wmComponent.outputformat = 'yyyy-MM-dd';
        outputpatternTest(fixture, '.app-date', dateWrapperComponent.wmComponent.datavalue);

    }));

    it('should be autofocus the element ', waitForAsync(() => {
        hasAttributeCheck(fixture, '.app-dateinput', 'autofocus');

    }));
    // TODO
    // it('should autofocus the date control ', () => {
    //     let inputEle = getHtmlSelectorElement(fixture, '.app-dateinput');
    //     fixture.whenStable().then(() => {
    //         expect(inputEle).toBe(document.activeElement);
    //     });

    // });

    it('should be disabled mode ', waitForAsync(() => {
        wmComponent.getWidget().disabled = true;
        fixture.detectChanges();
        hasAttributeCheck(fixture, '.app-dateinput', 'disabled');

    }));
    it('should be disabled mode (picker button)', waitForAsync(() => {
        wmComponent.getWidget().disabled = true;
        fixture.detectChanges();
        hasAttributeCheck(fixture, '.btn-time', 'disabled');

    }));


    // it('should be readonly mode ', () => {
    //     wmComponent.getWidget().readonly = true;
    //     fixture.detectChanges();
    //     hasAttributeCheck(fixture, '.app-dateinput', 'readonly');

    // });

    /************************* Properties ends ****************************************** **/



    /************************* Validations starts****************************************** **/

    it('should be apply required validation ', waitForAsync(() => {
        hasAttributeCheck(fixture, '.app-dateinput', 'required');

    }));

    // TypeError: Cannot read properties of null (reading 'nativeElement')
    xit('should respect the mindate validation', waitForAsync(() => {
        wmComponent.getWidget().datavalue = '2019-11-01';
        checkElementClass(fixture, '.app-date', 'ng-invalid');

    }));



    it('should be able to set the mindate and disable the below mindate on calendar', (() => {
        wmComponent.getWidget().mindate = '2019-11-02';
        wmComponent.getWidget().datavalue = '2019-11-02';
        checkElementClass(fixture, '.app-date', 'ng-valid');
        onClickCheckTaglengthOnBody(fixture, '.btn-time', 'bs-datepicker-container', 1, (ele) => {
            disableMindatePanel(ele);
        });
    }));

    it('should respect the maxdate validation', (() => {
        wmComponent.getWidget().maxdate = '2020-01-03';
        wmComponent.getWidget().datavalue = '2020-01-04';
        checkElementClass(fixture, '.app-date', 'ng-invalid');
        onClickCheckTaglengthOnBody(fixture, '.btn-time', 'bs-datepicker-container', 1, (ele) => {
            disableMaxDatePanel(ele);
        });
    }));

    it('should ignore the  excluded days', (() => {
        dateWrapperComponent.wmComponent.getWidget().excludedays = '1,6';
        dateWrapperComponent.wmComponent.getWidget().datavalue = '2019-12-30';
        checkElementClass(fixture, '.app-date', 'ng-invalid');
    }));

    xit('should disable the excluded days on the calendar panel', waitForAsync(() => {
        dateWrapperComponent.wmComponent.getWidget().excludedays = '1,6';
        onClickCheckTaglengthOnBody(fixture, '.btn-time', 'bs-datepicker-container', 1, (ele) => {
            fixture.whenStable().then(() => {
                excludedDaysDisable(ele);
            });

        });

    }));

    xit('should ignore the  excluded date', waitForAsync(() => {
        dateWrapperComponent.wmComponent.getWidget().excludedates = '2020-01-01';
        dateWrapperComponent.wmComponent.getWidget().datavalue = '2020-01-01';
        checkElementClass(fixture, '.app-date', 'ng-invalid');
    }));


    it('should disable the excluded date on the calendar panel', waitForAsync(() => {
        dateWrapperComponent.wmComponent.getWidget().datavalue = '2020-01-01';
        dateWrapperComponent.wmComponent.getWidget().excludedates = '2020-01-02';

        onClickCheckTaglengthOnBody(fixture, '.btn-time', 'bs-datepicker-container', 1, (ele) => {
            const datePickerRows = ele[0].querySelectorAll('tbody tr');
            fixture.whenStable().then(() => {
                const eleRow = datePickerRows[0];
                expectCheckEleHasDisabled(eleRow, 5);

            });
        });

    }));

    /************************* Validations ends****************************************** **/



    /************************ Scenarios starts **************************************** */

    it('should close the caledar as soon as select the date and should select the date', waitForAsync(() => {
        onClickCheckTaglengthOnBody(fixture, '.btn-time', 'bs-datepicker-container', 1, (el) => {
            const datePickerRows = el[0].querySelectorAll('tbody tr');
            const eleRow = datePickerRows[1];
            eleRow.children[6].querySelector('[bsdatepickerdaydecorator]').click();
            fixture.detectChanges();
            expect(new Date(wmComponent.datavalue).getDay()).toEqual(5);
            onClickCheckTaglengthOnBody(fixture, null, 'bs-datepicker-container', 0);
        });
    }));

    it('should show the calendar panel when we click on the input control ', waitForAsync(() => {
        wmComponent.getWidget().showdropdownon = 'default';
        onClickCheckTaglengthOnBody(fixture, '.app-dateinput', 'bs-datepicker-container', 1);
    }));


    /************************ Scenarios ends **************************************** */

    describe('onDisplayDateChange', () => {
        it('should update IMask when called', () => {
            const updateIMaskSpy = jest.spyOn(wmComponent, 'updateIMask');
            const event = { target: { value: '2023-01-01' } };
            wmComponent.onDisplayDateChange(event);
            expect(updateIMaskSpy).toHaveBeenCalled();
        });

        it('should not proceed if isEnterPressedOnDateInput is true', () => {
            const setDataValueSpy = jest.spyOn((wmComponent as any), 'setDataValue');
            const event = { target: { value: '2023-01-01' } };
            (wmComponent as any).isEnterPressedOnDateInput = true;
            wmComponent.onDisplayDateChange(event);
            expect(setDataValueSpy).not.toHaveBeenCalled();
            expect((wmComponent as any).isEnterPressedOnDateInput).toBeFalsy();
        });

        it('should call formatValidation and return if it fails', () => {
            const formatValidationSpy = jest.spyOn((wmComponent as any), 'formatValidation').mockReturnValue(false);
            const setDataValueSpy = jest.spyOn((wmComponent as any), 'setDataValue');
            const event = { target: { value: 'invalid-date' } };
            wmComponent.onDisplayDateChange(event);
            expect(formatValidationSpy).toHaveBeenCalled();
            expect(setDataValueSpy).not.toHaveBeenCalled();
        });

        it('should call minDateMaxDateValidationOnInput for native picker and return if it fails', () => {
            const minMaxValidationSpy = jest.spyOn((wmComponent as any), 'minDateMaxDateValidationOnInput').mockReturnValue(true);
            const setDataValueSpy = jest.spyOn((wmComponent as any), 'setDataValue');
            const event = { target: { value: '2023-01-01' } };
            wmComponent.onDisplayDateChange(event, true);
            expect(minMaxValidationSpy).toHaveBeenCalled();
            expect(setDataValueSpy).not.toHaveBeenCalled();
        });

        it('should call setDataValue with the new date value if all validations pass', () => {
            const setDataValueSpy = jest.spyOn((wmComponent as any), 'setDataValue');
            const event = { target: { value: '2023-01-01' } };
            jest.spyOn((wmComponent as any), 'formatValidation').mockReturnValue(true);
            jest.spyOn((wmComponent as any), 'minDateMaxDateValidationOnInput').mockReturnValue(false);
            wmComponent.onDisplayDateChange(event);
            expect(setDataValueSpy).toHaveBeenCalled();
        });
    });

    describe('onDisplayKeydown', () => {
        let mockEvent;
        beforeEach(() => {
            mockEvent = {
                key: 'Enter',
                target: { value: '2023-01-01' },
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            jest.spyOn((wmComponent as any), 'isDropDownDisplayEnabledOnInput').mockReturnValue(true);
        });
        it('should stop propagation if dropdown display is enabled', () => {
            wmComponent.onDisplayKeydown(mockEvent);
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });

        it('should handle Enter key press correctly', () => {
            jest.spyOn(wmComponent, 'toggleDpDropdown');
            wmComponent.onDisplayKeydown(mockEvent);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(wmComponent.toggleDpDropdown).toHaveBeenCalled();
        });

        it('should hide datepicker dropdown for non-Enter key press', () => {
            mockEvent.key = 'ArrowDown';
            jest.spyOn(wmComponent, 'hideDatepickerDropdown');
            wmComponent.onDisplayKeydown(mockEvent);
            expect(wmComponent.hideDatepickerDropdown).toHaveBeenCalled();
        });
    });

    describe('onPropertyChange', () => {
        it('should update showdateformatasplaceholder when key is showdateformatasplaceholder', () => {
            wmComponent.onPropertyChange('showdateformatasplaceholder', true);
            expect((wmComponent as any).showdateformatasplaceholder).toBe(true);
        });

        it('should update mask when showdateformatasplaceholder is true and datepattern is not timestamp', () => {
            wmComponent.datepattern = 'yyyy-MM-dd';
            wmComponent.onPropertyChange('showdateformatasplaceholder', true);
            expect(wmComponent.mask).toBeDefined();
        });

        it('should call updateIMask when showdateformatasplaceholder is true', () => {
            const updateIMaskSpy = jest.spyOn(wmComponent, 'updateIMask');
            wmComponent.datepattern = 'yyyy-MM-dd';
            wmComponent.onPropertyChange('showdateformatasplaceholder', true);
            expect(updateIMaskSpy).toHaveBeenCalled();
        });

        it('should call super.onPropertyChange for other keys', () => {
            const superOnPropertyChangeSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(wmComponent)), 'onPropertyChange');
            wmComponent.onPropertyChange('someOtherKey', 'someValue');
            expect(superOnPropertyChangeSpy).toHaveBeenCalledWith('someOtherKey', 'someValue', undefined);
        });
    });

    // it('should be able to select the date from the date picker ', () => {
    //     // let dateControl = getDateElement();
    //     let inputEle = getDateInputElement();
    //     fixture.whenStable().then(() => {
    //         expect(inputEle.nativeElement.hasAttribute('readonly')).toBeTruthy();
    //     });

    // });



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

    // it('Should trigger the date control change event', () => {
    //     fixture.whenStable().then(() => {
    //         spyOn(fixture.componentInstance, 'date1Change').and.callThrough();
    //         wmComponent.getWidget().datavalue = '2019-12-05';
    //         fixture.detectChanges();
    //         expect(dateWrapperComponent.date1Change).toHaveBeenCalledTimes(1);
    //     })

    // });

});

const dateComponentLocaleModuleDef: ITestModuleDef = {
    declarations: [DateWrapperComponent, DateComponent],
    imports: [FormsModule, WmComponentsModule.forRoot(), BsDatepickerModule.forRoot(), IMaskModule],
    providers: [
        { provide: LOCALE_ID, useValue: 'de' },
        { provide: Router, useValue: Router },
        { provide: App, useValue: mockApp },
        { provide: SecurityService, useValue: SecurityService },
        { provide: UserDefinedExecutionContext, useValue: UserDefinedExecutionContext },
        { provide: AppDefaults, useValue: AppDefaults },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AbstractI18nService, deps: [BsLocaleService], useClass: MockAbstractI18nServiceDe },
        { provide: IMaskDirective, useClass: MockIMaskDirective }
    ],
    teardown: { destroyAfterEach: false }
};

describe(('Date Component with Localization'), () => {
    let dateWrapperComponent: DateWrapperComponent;
    let wmComponent: DateComponent;
    let fixture: ComponentFixture<DateWrapperComponent>;

    beforeEach((async () => {
        // register the selected locale language
        registerLocaleData(localeDE);
        fixture = compileTestComponent(dateComponentLocaleModuleDef, DateWrapperComponent);
        dateWrapperComponent = fixture.componentInstance;
        wmComponent = dateWrapperComponent.wmComponent;
        fixture.detectChanges();
    }));
    afterEach(() => {
        if (fixture) {
            fixture.destroy();
        }
    });

    it('should create the date Component with de locale', () => {
        expect(dateWrapperComponent).toBeTruthy();
    });

    //ERROR RuntimeError: NG05105: Unexpected synthetic listener @datepickerAnimation.done found. 
    xit('should display localized dates in date picker', (() => {
        localizedDatePickerTest(fixture, '.btn-time');
    }));

    // TypeError: Cannot read properties of undefined (reading 'innerText')
    xit('should display the defult value in de format', waitForAsync(() => {
        const date = '2020-02-20', datepattern = 'yyyy-MM-dd';
        wmComponent.getWidget().datepattern = datepattern;
        wmComponent.datavalue = date;
        fixture.detectChanges();
        const dateObj = getDateObj(date);
        expect(getFormattedDate((wmComponent as any).datePipe, dateObj, datepattern)).toEqual(getHtmlSelectorElement(fixture, '.app-textbox').nativeElement.value);
    }));

    // TypeError: Cannot read properties of undefined (reading 'innerText')
    xit('should update the datavalue without error when we type "de" format date in inputbox', waitForAsync(() => {
        const date = '2020, 21 Februar', datepattern = 'yyyy, dd MMMM', input = getHtmlSelectorElement(fixture, '.app-textbox');
        wmComponent.getWidget().datepattern = datepattern;
        input.nativeElement.value = date;
        input.triggerEventHandler('change', { target: input.nativeElement });
        fixture.detectChanges();
        const dateObj = getDateObj(date, { pattern: datepattern });
        expect(getFormattedDate((wmComponent as any).datePipe, dateObj, (wmComponent as any).outputformat)).toEqual(wmComponent.datavalue);
    }));

});
