import { By } from '@angular/platform-browser';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserDefinedExecutionContext, AppDefaults } from '@wm/core';
import { SecurityService } from '@wm/security';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WmComponentsModule } from '@wm/components/base';

import { async, ComponentFixture } from '@angular/core/testing';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { DateComponent } from './date.component';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../../base/src/test/common-widget.specs";
import { ComponentsTestModule } from "../../../../../base/src/test/components.test.module";
import { compileTestComponent, getHtmlSelectorElement, checkElementClass, onClickCheckTaglengthOnBody, onClickCheckClassEleLengthOnBody, hasAttributeCheck } from "../../../../../base/src/test/util/component-test-util";
import { datepatternTest, outputpatternTest, disableMaxDatePanel, disableMindatePanel, excludedDaysDisable, expectCheckEleHasDisabled } from '../../../../../base/src/test/util/date-test-util';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { ToDatePipe } from 'projects/components/base/src/pipes/custom-pipes';
//import { ToDatePipe } from '../../../../../base/src/pipes/custom-pipes';

let mockApp = {
    subscribe: () => { }
};
const currentDate = new Date().toISOString().split('T')[0];

const markup = `<div wmDate  name="date1" mindate="2019-12-02"  excludedays="1,6"
 excludedates="2020-01-01" datavalue="${currentDate}" dataentrymode="default" placeholder="Select birth date"
   shortcutkey="d" class="input-group-sm" showdropdownon="button" showweeks="true"  hint="Test hint" datepattern="yyyy-MM-dd" 
   outputformat="yyyy-MM-dd" required="true" tabindex="1"  autofocus="true" class="input-group-sm" color="#b6a9a9"
    change.event="date1Change($event, widget, newVal, oldVal)" focus.event="date1Focus($event, widget)" 
    blur.event="date1Blur($event, widget)" click.event="date1Click($event, widget)" mouseenter.event="date1Mouseenter($event, widget)"
     mouseleave.event="date1Mouseleave($event, widget)" tap.event="date1Tap($event, widget)" margintop="30px" marginright="23px" ngModel></div>`;
@Component({
    template: markup
})
class DateWrapperComponent {
    @ViewChild(DateComponent)
    wmComponent: DateComponent;



    date1Tap(evt, widget) {
        console.log("Date control tap action triggered");
    }
    date1Click(evt, widget) {
        console.log("Date control click action triggered");

    }

    date1Mouseenter(evt, widget) {
        console.log("Mouse enter event triggered");
    }
    date1Mouseleave(evt, wiget) {
        console.log("Mouse leave event triggered");
    }

    date1Focus(evt, widget) {
        console.log("Focus event triggered");
    }
    date1Blur(evt, widget) {
        console.log("Blur event triggered");
    }

    date1Change(evt, widget, newVal, oldVal) {
        console.log("Change event triggered!");
    }

}

const dateComponentModuleDef: ITestModuleDef = {
    declarations: [DateWrapperComponent, DateComponent],
    imports: [ComponentsTestModule, FormsModule, WmComponentsModule.forRoot(), BsDatepickerModule.forRoot()],
    providers: [{ provide: Router, useValue: Router },
    { provide: SecurityService, useValue: SecurityService },
    { provide: UserDefinedExecutionContext, useValue: UserDefinedExecutionContext },
    { provide: AppDefaults, useValue: AppDefaults },
    { provide: ToDatePipe, useClass: ToDatePipe },
    { provide: DatePipe, useClass: DatePipe }

    ]
}

const dateComponentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-date',
    widgetSelector: '[wmDate]',
    inputElementSelector: 'input.app-dateinput',

    testModuleDef: dateComponentModuleDef,
    testComponent: DateWrapperComponent
}

const TestBase: ComponentTestBase = new ComponentTestBase(dateComponentDef);
TestBase.verifyPropsInitialization();
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


describe("DateComponent", () => {
    let dateWrapperComponent: DateWrapperComponent;
    let wmComponent: DateComponent;
    let fixture: ComponentFixture<DateWrapperComponent>;

    beforeEach((async () => {
        fixture = compileTestComponent(dateComponentModuleDef, DateWrapperComponent);
        dateWrapperComponent = fixture.componentInstance;
        wmComponent = dateWrapperComponent.wmComponent;
        fixture.detectChanges();
    }));


    /************************* Properties starts ****************************************** **/

    it("should show the calendar panel on click the date button (show date picker on button click)", async(() => {
        onClickCheckTaglengthOnBody(fixture, '.btn-time', 'bs-datepicker-container', 1);
    }));

    it("should not show the calendar panel on click the input control (show date picker on only button click) ", async(() => {
        onClickCheckTaglengthOnBody(fixture, '.app-dateinput', 'bs-datepicker-container', 0);

    }));

    //TODO: Need to check
    // it("should allow user to select the date from picker only(Date entry mode picker)", () => {
    //     wmComponent.getWidget().dataentrymode = "picker";
    //     fixture.detectChanges();
    //     hasAttributeCheck(fixture, '.app-dateinput', 'readonly');
    // });

    it("should show the week numbers on the calendar pan ", async(() => {
        onClickCheckClassEleLengthOnBody(fixture, '.btn-time', 'table.weeks', 1);

    }));

    it("should not show the week numbers on the calendar pan ", async(() => {
        wmComponent.getWidget().showweeks = false;
        onClickCheckClassEleLengthOnBody(fixture, '.btn-time', 'table.weeks', 0);

    }));

    it('should assign the shortkey to the input control as attribute accesskey ', async(() => {
        let dateInputControl = getHtmlSelectorElement(fixture, '.app-dateinput');
        expect(dateInputControl.nativeElement.getAttribute('accesskey')).toEqual('d');
    }))


    it('should set the current date as default value ', async(() => {
        let dateInputControl = getHtmlSelectorElement(fixture, '.app-dateinput');
        expect(dateInputControl.nativeElement.value).toEqual(currentDate);
    }));


    it('should show the date patten as yyyy-mm-dd format ', async(() => {
        datepatternTest(fixture, '.app-date', '.app-dateinput');

    }))

    it('should get the date outputformat as yyyy-mm-dd ', async(() => {
        outputpatternTest(fixture, '.app-date', dateWrapperComponent.wmComponent.datavalue);

    }));

    it('should be autofocus the element ', async(() => {
        hasAttributeCheck(fixture, '.app-dateinput', 'autofocus');

    }));
    //TODO
    // it('should autofocus the date control ', () => {
    //     let inputEle = getHtmlSelectorElement(fixture, '.app-dateinput');
    //     fixture.whenStable().then(() => {
    //         expect(inputEle).toBe(document.activeElement);
    //     });

    // });

    it('should be disabled mode ', async(() => {
        wmComponent.getWidget().disabled = true;
        fixture.detectChanges();
        hasAttributeCheck(fixture, '.app-dateinput', 'disabled');

    }));
    it('should be disabled mode (picker button)', async(() => {
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

    it('should be apply required validation ', async(() => {
        hasAttributeCheck(fixture, '.app-dateinput', 'required');

    }));

    it('should respect the mindate validation', async(() => {
        wmComponent.getWidget().datavalue = '2019-11-01';
        checkElementClass(fixture, '.app-date', 'ng-invalid');

    }));



    it('should be able to set the mindate and disable the below mindate on calendar', async(() => {
        wmComponent.getWidget().mindate = '2019-11-02';
        wmComponent.getWidget().datavalue = '2019-11-02';
        checkElementClass(fixture, '.app-date', 'ng-valid');
        onClickCheckTaglengthOnBody(fixture, '.btn-time', 'bs-datepicker-container', 1, (ele) => {
            disableMindatePanel(ele);
        });
    }));

    it('should respect the maxdate validation', async(() => {
        wmComponent.getWidget().maxdate = '2020-01-03';
        wmComponent.getWidget().datavalue = '2020-01-04';
        checkElementClass(fixture, '.app-date', 'ng-invalid');
        onClickCheckTaglengthOnBody(fixture, '.btn-time', 'bs-datepicker-container', 1, (ele) => {
            disableMaxDatePanel(ele);
        });
    }));

    it('should ignore the  excluded days', async(() => {
        dateWrapperComponent.wmComponent.getWidget().datavalue = '2019-12-30';
        checkElementClass(fixture, '.app-date', 'ng-invalid');
    }));

    it('should disbale the excluded days on the calendar panel', async(() => {

        onClickCheckTaglengthOnBody(fixture, '.btn-time', 'bs-datepicker-container', 1, (ele) => {
            excludedDaysDisable(ele);

        });

    }));

    it('should ignore the  excluded date', async(() => {
        dateWrapperComponent.wmComponent.getWidget().datavalue = '2020-01-01';
        checkElementClass(fixture, '.app-date', 'ng-invalid');
    }));


    it('should disbale the excluded date on the calendar panel', async(() => {
        dateWrapperComponent.wmComponent.getWidget().excludedates = '2020-01-02';

        onClickCheckTaglengthOnBody(fixture, '.btn-time', 'bs-datepicker-container', 1, (ele) => {
            let datePickerRows = ele[0].querySelectorAll('tbody tr');
            var eleRow = datePickerRows[0];
            expectCheckEleHasDisabled(eleRow, 5);
        });

    }));

    /************************* Validations ends****************************************** **/



    /************************ Scenarios starts **************************************** */

    it("should close the caledar as soon as select the date and should select the date", async(() => {
        onClickCheckTaglengthOnBody(fixture, '.btn-time', 'bs-datepicker-container', 1, (el) => {
            let datePickerRows = el[0].querySelectorAll('tbody tr');
            var eleRow = datePickerRows[0];
            eleRow.children[6].querySelector('[bsdatepickerdaydecorator]').click();
            fixture.detectChanges();
            expect(new Date(wmComponent.datavalue).getDay()).toEqual(5);
            onClickCheckTaglengthOnBody(fixture, null, 'bs-datepicker-container', 0);
        });
    }));

    it('should show the calendar panel when we click on the input control ', async(() => {
        wmComponent.getWidget().showdropdownon = 'default';
        onClickCheckTaglengthOnBody(fixture, '.app-dateinput', 'bs-datepicker-container', 1);
    }));


    /************************ Scenarios ends **************************************** */


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
