import { Component, ViewChild } from '@angular/core';
import { CalendarComponent } from './calendar.component';
import { ComponentFixture } from '@angular/core/testing';
import { ITestModuleDef, ITestComponentDef, ComponentTestBase } from 'projects/components/base/src/test/common-widget.specs';
import { ComponentsTestModule } from 'projects/components/base/src/test/components.test.module';
import { FormsModule } from '@angular/forms';
import { compileTestComponent } from 'projects/components/base/src/test/util/component-test-util';
import { DatepickerModule } from 'ngx-bootstrap';
import { ToDatePipe } from 'projects/components/base/src/pipes/custom-pipes';
import { DatePipe } from '@angular/common';
import { AbstractI18nService } from '@wm/core';

const mockI18 = {
    initCalendarLocale() {

    }
}

const markup = `<div 
                wmCalendar 
                redrawable 
                class="qwerty"
                name="calendar1" 
                width="500px" 
                height="500px"
                tabindex="2"
                color="#c84c4c" 
                backgroundcolor="#e25858"
                 >
                </div>`;
@Component({
    template: markup
})
class CalendarWrapperComponent {
    @ViewChild(CalendarComponent)
    wmComponent: CalendarComponent;
}

const calendarComponentModuleDef: ITestModuleDef = {
    declarations: [CalendarWrapperComponent, CalendarComponent],
    imports: [ComponentsTestModule, FormsModule, DatepickerModule],
    providers: [{ provide: ToDatePipe, useClass: ToDatePipe },
                { provide: DatePipe, useClass: DatePipe },
                { provide: AbstractI18nService, useValue: mockI18}]
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

    beforeEach((async () => {
        fixture = compileTestComponent(calendarComponentModuleDef, CalendarWrapperComponent);
        calenderWrapperComponent = fixture.componentInstance;
        wmComponent = calenderWrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create calendar component', () => {
        expect(CalendarWrapperComponent).toBeTruthy();
    })

});
