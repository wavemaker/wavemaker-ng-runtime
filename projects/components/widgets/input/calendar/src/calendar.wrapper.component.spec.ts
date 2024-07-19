import { Component, ViewChild } from '@angular/core';
import { CalendarComponent } from './calendar.component';
import { waitForAsync, ComponentFixture } from '@angular/core/testing';
import { ITestModuleDef, ITestComponentDef, ComponentTestBase } from 'projects/components/base/src/test/common-widget.specs';
import { ComponentsTestModule } from 'projects/components/base/src/test/components.test.module';
import { FormsModule } from '@angular/forms';
import { compileTestComponent, mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ToDatePipe } from 'projects/components/base/src/pipes/custom-pipes';
import { DatePipe } from '@angular/common';
import { IMaskModule } from 'angular-imask';

import { AbstractI18nService, App } from '@wm/core';
import { MockAbstractI18nService } from 'projects/components/base/src/test/util/date-test-util';
import {
    StylableComponent, BaseComponent
} from '@wm/components/base';
import "fullcalendar/main.min.js";

declare global {
    interface Window {
        FullCalendar: any;
    }
}
const markup = `<div
                wmCalendar
                redrawable
                class="qwerty"
                name="calendar1"
                width="500px"
                height="500px"
                tabindex="0"
                color="#c84c4c"
                backgroundcolor="#e25858"
                view="month"
                selectionmode="single"
                margintop="4px"
                calendartype="agenda"
                 >
                </div>`;
@Component({
    template: markup
})
class CalendarWrapperComponent {
    @ViewChild(CalendarComponent, /* TODO: add static flag */ { static: true })
    wmComponent: CalendarComponent;

    public testData1 = [{ title: 'event', start: '02/02/2020' }];
    public testData2 = [{ title: 'new event', start: '02/03/2020' }];
}

const calendarComponentModuleDef: ITestModuleDef = {
    declarations: [CalendarWrapperComponent, CalendarComponent],
    imports: [ComponentsTestModule, FormsModule, BsDatepickerModule, IMaskModule],
    providers: [{ provide: ToDatePipe, useClass: ToDatePipe },
    { provide: App, useValue: mockApp },
    { provide: DatePipe, useClass: DatePipe },
    { provide: BaseComponent, useClass: BaseComponent },
    { provide: StylableComponent, useClass: StylableComponent },
    { provide: AbstractI18nService, useClass: MockAbstractI18nService }]
};

const calendarComponentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-calendar',
    widgetSelector: '[wmCalendar]',
    inputElementSelector: 'div',

    testModuleDef: calendarComponentModuleDef,
    testComponent: CalendarWrapperComponent
};

const TestBase: ComponentTestBase = new ComponentTestBase(calendarComponentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();


describe('CalendarComponent', () => {
    let calenderWrapperComponent: CalendarWrapperComponent;
    let wmComponent: CalendarComponent;
    let fixture: ComponentFixture<CalendarWrapperComponent>;
    window.FullCalendar = {
        Calendar: class {
            el: any;
            options: any;
            constructor(el: any, options: any) {
                this.el = el;
                this.options = options;
            }
            render() { }
            setOption(optionKey: string, optionValue: any) { }
            changeView(view: any) { }
        },
        __wm_locale_initialized: false,
        dayGridPlugin: {}
    };
    beforeEach((async () => {
        fixture = compileTestComponent(calendarComponentModuleDef, CalendarWrapperComponent);
        calenderWrapperComponent = fixture.componentInstance;
        wmComponent = calenderWrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create calendar component', () => {
        expect(CalendarWrapperComponent).toBeTruthy();
    })

    it('should apply the view to be month view', waitForAsync(() => {
        fixture.whenStable().then(() => {
            expect(document.getElementsByClassName('fc-month-view').length).toBe(1);
        })
    }))

    it('should apply as agenda week button', waitForAsync(() => {
        fixture.whenStable().then(() => {
            expect(document.getElementsByClassName('fc-agendaWeek-button').length).toBe(1);
        })
    }))

    it('should apply events data to the calendar', waitForAsync(() => {
        fixture.whenStable().then(() => {
            wmComponent.getWidget().dataset = calenderWrapperComponent.testData1;
            fixture.detectChanges();
            expect(document.getElementsByClassName('fc-title')[0].textContent).toBe('event');
            wmComponent.getWidget().dataset = calenderWrapperComponent.testData2;
            fixture.detectChanges();
            expect(document.getElementsByClassName('fc-title')[0].textContent).toBe('new event');
        })
    }))

});
