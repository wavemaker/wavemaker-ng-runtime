import { Component, ViewChild } from '@angular/core';
import { CalendarComponent } from './calendar.component';
import { waitForAsync, ComponentFixture } from '@angular/core/testing';
import { ITestModuleDef, ITestComponentDef, ComponentTestBase } from 'projects/components/base/src/test/common-widget.specs';
import { FormsModule } from '@angular/forms';
import { compileTestComponent, mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ToDatePipe } from 'projects/components/base/src/pipes/custom-pipes';
import { DatePipe } from '@angular/common';
import { IMaskModule } from 'angular-imask';
import { AbstractI18nService, App } from '@wm/core';
import { MockAbstractI18nService } from 'projects/components/base/src/test/util/date-test-util';
import { StylableComponent, BaseComponent } from '@wm/components/base';
import "@fullcalendar/core/index.global.min.js"
import moment from 'moment';

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
    declarations: [CalendarWrapperComponent],
    imports: [FormsModule, BsDatepickerModule, IMaskModule, CalendarComponent],
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
        (wmComponent as any).$fullCalendar = {
            setOption: jest.fn(),
            addEventSource: jest.fn(),
            changeView: jest.fn(),
            gotoDate: jest.fn(),
            nextYear: jest.fn(),
            prevYear: jest.fn(),
            getDate: jest.fn().mockReturnValue(new Date()),
            render: jest.fn(),
            select: jest.fn(),
            eventClick: jest.fn(),
        };
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

    describe('constructCalendarDataset', () => {
        it('should map properties correctly', () => {
            const eventSource = [
                {
                    title: 'Event 1',
                    start: '2023-01-01',
                    end: '2023-01-02',
                    allday: true,
                    className: 'custom-class'
                }
            ];
            wmComponent.eventtitle = 'title';
            wmComponent.eventstart = 'start';
            wmComponent.eventend = 'end';
            wmComponent.eventallday = 'allday';
            wmComponent.eventclass = 'className';
            const result = (wmComponent as any).constructCalendarDataset(eventSource);
            expect(result[0].title).toBe('Event 1');
            expect(result[0].start).toBe('2023-01-01');
            expect(result[0].end).toBe('2023-01-02');
            expect(result[0].allDay).toBe(true);
            expect(result[0].className).toBe('custom-class');
            expect(result[0]._eventMetadata).toBeDefined();
        });

        it('should handle missing properties', () => {
            const eventSource = [
                {
                    title: 'Event 2'
                }
            ];
            wmComponent.eventtitle = 'title';
            const result = (wmComponent as any).constructCalendarDataset(eventSource);
            expect(result[0].title).toBe('Event 2');
            expect(result[0].start).toBeUndefined();
            expect(result[0].end).toBeUndefined();
            expect(result[0].allDay).toBeUndefined();
            expect(result[0].className).toBeUndefined();
        });

        it('should remove empty url properties', () => {
            const eventSource = [
                {
                    title: 'Event 3',
                    url: ''
                }
            ];
            wmComponent.eventtitle = 'title';
            const result = (wmComponent as any).constructCalendarDataset(eventSource);
            expect(result[0].url).toBeUndefined();
            expect(result[0]._eventMetadata.url).toBeUndefined();
        });
    });

    describe('setSelectedData', () => {
        beforeEach(() => {
            wmComponent.dataset = {
                data: [
                    { start: '2024-08-15', end: '2024-08-17', title: 'Event 1' },
                    { start: '2024-08-18', end: '2024-08-20', title: 'Event 2' },
                    { start: '2024-08-22', title: 'Event 3' },
                    { start: '2024-08-25', end: '2024-08-27', title: 'Event 4' },
                ]
            };
        });

        it('should filter events within the given date range', () => {
            const start = '2024-08-16';
            const end = '2024-08-23';
            const result = wmComponent['setSelectedData'](start, end);
            expect(result.length).toBe(2);
            expect(result[0].title).toBe('Event 2');
            expect(result[1].title).toBe('Event 3');
        });

        it('should handle events without end date', () => {
            const start = '2024-08-22';
            const end = '2024-08-23';
            const result = wmComponent['setSelectedData'](start, end);
            expect(result.length).toBe(1);
            expect(result[0].title).toBe('Event 3');
        });

        it('should return empty array when no events are in range', () => {
            const start = '2024-08-28';
            const end = '2024-08-30';
            const result = wmComponent['setSelectedData'](start, end);
            expect(result.length).toBe(0);
        });

        it('should return undefined when dataset is not available', () => {
            wmComponent.dataset = null;
            const start = '2024-08-16';
            const end = '2024-08-23';
            const result = wmComponent['setSelectedData'](start, end);
            expect(result).toBeUndefined();
        });
    });

    describe('eventDrop', () => {
        it('should invoke eventCallback with correct parameters', () => {
            const mockEventDropInfo = {
                event: { title: 'New Event', start: new Date('2024-08-20') },
                oldEvent: { title: 'Old Event', start: new Date('2024-08-19') },
                jsEvent: {},
                delta: { days: 1 },
                revert: jest.fn(),
                view: {}
            };

            jest.spyOn(wmComponent as any, 'convertEventObjForOldAndNewData').mockImplementation((event: any) => ({ title: event.title }));
            jest.spyOn(wmComponent as any, 'invokeEventCallback');
            (wmComponent as any).eventDrop(mockEventDropInfo);
            expect(wmComponent['convertEventObjForOldAndNewData']).toHaveBeenCalledTimes(2);
            expect(wmComponent['invokeEventCallback']).toHaveBeenCalledWith(
                'eventdrop',
                expect.objectContaining({
                    $event: mockEventDropInfo.jsEvent,
                    $newData: { title: 'New Event' },
                    $oldData: { title: 'Old Event' },
                    $delta: mockEventDropInfo.delta,
                    $revertFunc: mockEventDropInfo.revert,
                    $view: mockEventDropInfo.view
                })
            );
        });
    });

    describe('unselect', () => {
        it('should call unselect on $fullCalendar', () => {
            wmComponent['$fullCalendar'] = { unselect: jest.fn() };
            wmComponent.unselect();
            expect(wmComponent['$fullCalendar'].unselect).toHaveBeenCalled();
        });
    });

    describe('convertEventObj', () => {
        it('should return _eventMetadata with the original object as prototype if extendedProps._eventMetadata is present', () => {
            const eventObj = {
                id: 1,
                title: 'Test Event',
                extendedProps: {
                    _eventMetadata: { metaKey: 'metaValue' }
                }
            };
            const result = wmComponent['convertEventObj'](eventObj);
            expect(result).toEqual(expect.objectContaining({ metaKey: 'metaValue' }));
            expect(Object.getPrototypeOf(result)).toBe(eventObj);
        });
    });

    describe('convertEventObjForOldAndNewData', () => {
        it('should merge extendedProps with the original object', () => {
            const eventObj = {
                id: 1,
                title: 'Test Event',
                extendedProps: {
                    customProp: 'customValue'
                }
            };
            const result = wmComponent['convertEventObjForOldAndNewData'](eventObj);
            expect(result).toEqual(expect.objectContaining({
                id: 1,
                title: 'Test Event',
                customProp: 'customValue'
            }));
        });
    });

    describe('eventResize', () => {
        it('should invoke eventresize callback with correct parameters', () => {
            const mockEventResizeInfo = {
                event: { id: 1, title: 'Resized Event', extendedProps: {} },
                oldEvent: { id: 1, title: 'Original Event', extendedProps: {} },
                jsEvent: {},
                delta: {},
                revert: jest.fn(),
                view: {}
            };
            const invokeEventCallbackSpy = jest.spyOn(wmComponent as any, 'invokeEventCallback');
            wmComponent['eventResize'](mockEventResizeInfo);
            expect(invokeEventCallbackSpy).toHaveBeenCalledWith('eventresize', expect.objectContaining({
                $event: mockEventResizeInfo.jsEvent,
                $newData: expect.any(Object),
                $oldData: expect.any(Object),
                $delta: mockEventResizeInfo.delta,
                $revertFunc: mockEventResizeInfo.revert,
                $view: mockEventResizeInfo.view
            }));
        });
    });

    describe('onEventChangeStart', () => {
        it('should store a clone of the event object', () => {
            const mockEvent = { id: 1, title: 'Test Event' };
            wmComponent['onEventChangeStart'](mockEvent);
            expect(wmComponent['oldData']).toEqual(mockEvent);
            expect(wmComponent['oldData']).not.toBe(mockEvent);
        });
    });

    describe('eventClick', () => {
        it('should invoke eventclick callback with correct parameters', () => {
            const mockEventClickInfo = {
                event: { id: 1, title: 'Clicked Event', extendedProps: {} },
                jsEvent: {},
                view: {}
            };
            const invokeEventCallbackSpy = jest.spyOn(wmComponent as any, 'invokeEventCallback');
            wmComponent['eventClick'](mockEventClickInfo);
            expect(invokeEventCallbackSpy).toHaveBeenCalledWith('eventclick', expect.objectContaining({
                $event: mockEventClickInfo.jsEvent,
                $data: expect.any(Object),
                $view: mockEventClickInfo.view
            }));
        });
    });

    describe('eventDidMount', () => {
        it('should invoke eventrender callback with correct parameters', () => {
            const mockEvent = {
                event: { id: 1, title: 'Mounted Event', extendedProps: {} },
                el: {},
                view: {}
            };
            const invokeEventCallbackSpy = jest.spyOn(wmComponent as any, 'invokeEventCallback');
            wmComponent['eventDidMount'](mockEvent);
            expect(invokeEventCallbackSpy).toHaveBeenCalledWith('eventrender', expect.objectContaining({
                $event: mockEvent.el,
                $data: expect.any(Object),
                $view: mockEvent.view
            }));
        });
    });

    describe('viewDidMount', () => {
        it('should invoke viewrender callback with correct parameters', () => {
            const mockView = {};
            const invokeEventCallbackSpy = jest.spyOn(wmComponent as any, 'invokeEventCallback');
            wmComponent['viewDidMount'](mockView);
            expect(invokeEventCallbackSpy).toHaveBeenCalledWith('viewrender', { $view: mockView });
        });
    });

    describe('datesSet', () => {
        it('should update currentview with formatted start and end dates', () => {
            const mockData = {
                start: new Date('2023-01-01'),
                end: new Date('2023-01-31')
            };
            wmComponent['datesSet'](mockData);
            expect(wmComponent['currentview']).toEqual({
                start: '2023-01-01',
                end: '2023-01-31'
            });
        });
    });

    describe('dateClick', () => {
        it('should invoke dateclick callback with correct parameters', () => {
            const mockInfo = {
                date: new Date('2023-01-15')
            };
            const invokeEventCallbackSpy = jest.spyOn(wmComponent as any, 'invokeEventCallback');
            wmComponent['dateClick'](mockInfo);
            expect(invokeEventCallbackSpy).toHaveBeenCalledWith('dateclick', expect.objectContaining({
                $dateInfo: expect.any(Number)
            }));
        });
    });

    describe('onPropertyChange', () => {
        const SELECTION_MODES = {
            NONE: 'none',
            SINGLE: 'single',
            MULTIPLE: 'multiple'
        };
        const VIEW_TYPES = {
            BASIC: 'basic',
            AGENDA: 'agenda',
            LIST: 'list'
        };
        it('should call super.onPropertyChange', () => {
            const superSpy = jest.spyOn(Object.getPrototypeOf(CalendarComponent.prototype), 'onPropertyChange');
            wmComponent.onPropertyChange('testKey', 'testValue');
            expect(superSpy).toHaveBeenCalledWith('testKey', 'testValue', undefined);
        });

        describe('selectionmode', () => {
            it('should set selectable to true and update constraints for SINGLE mode', () => {
                const newOptions = {
                    header: {
                        left: 'prev,next today myCustomButton',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                    },
                    navLinks: true,
                    businessHours: true,
                };

                wmComponent.overrideDefaults(newOptions);
                const updateSpy = jest.spyOn(wmComponent as any, 'updateCalendarOptions');
                wmComponent.onPropertyChange('selectionmode', SELECTION_MODES.SINGLE);
                expect((wmComponent as any).calendarOptions.calendar.selectable).toBe(true);
                expect(updateSpy).toHaveBeenCalledWith('option', 'selectable', true);
                expect(updateSpy).toHaveBeenCalledWith('option', 'selectConstraint', {
                    startTime: '00:00',
                    endTime: '24:00'
                });
            });

            it('should set selectable to true and update constraints for MULTIPLE mode', () => {
                const updateSpy = jest.spyOn(wmComponent as any, 'updateCalendarOptions');
                wmComponent.onPropertyChange('selectionmode', SELECTION_MODES.MULTIPLE);
                expect((wmComponent as any).calendarOptions.calendar.selectable).toBe(true);
                expect(updateSpy).toHaveBeenCalledWith('option', 'selectable', true);
                expect(updateSpy).toHaveBeenCalledWith('option', 'selectConstraint', {});
            });

            it('should set selectable to false for NONE mode', () => {
                const updateSpy = jest.spyOn(wmComponent as any, 'updateCalendarOptions');
                wmComponent.onPropertyChange('selectionmode', SELECTION_MODES.NONE);
                expect((wmComponent as any).calendarOptions.calendar.selectable).toBe(false);
                expect(updateSpy).toHaveBeenCalledWith('option', 'selectable', false);
            });
        });

        describe('view', () => {
            it('should set defaultView for non-month view', () => {
                const updateSpy = jest.spyOn(wmComponent as any, 'updateCalendarOptions');
                wmComponent.onPropertyChange('view', 'week');
                expect((wmComponent as any).calendarOptions.calendar.defaultView).toBe('agendaWeek');
                expect(updateSpy).toHaveBeenCalledWith('changeView', 'agendaWeek');
            });

            it('should set defaultView for month view', () => {
                const updateSpy = jest.spyOn(wmComponent as any, 'updateCalendarOptions');
                wmComponent.onPropertyChange('view', 'month');
                expect((wmComponent as any).calendarOptions.calendar.defaultView).toBe('month');
                expect(updateSpy).toHaveBeenCalledWith('changeView', 'month');
            });

            it('should set defaultView for list calendar type', () => {
                wmComponent.calendartype = VIEW_TYPES.LIST;
                const updateSpy = jest.spyOn(wmComponent as any, 'updateCalendarOptions');
                wmComponent.onPropertyChange('view', 'month');
                expect((wmComponent as any).calendarOptions.calendar.defaultView).toBe('listMonth');
                expect(updateSpy).toHaveBeenCalledWith('changeView', 'listMonth');
            });
        });

        describe('calendartype', () => {
            it('should set calendartype to provided value', () => {
                wmComponent.onPropertyChange('calendartype', 'timeGrid');
                expect(wmComponent.calendartype).toBe('timeGrid');
            });

            it('should set calendartype to default value if not provided', () => {
                wmComponent.onPropertyChange('calendartype', null);
                expect(wmComponent.calendartype).toBe('dayGrid');
            });
        });

        describe('controls', () => {
            it('should call updateCalendarHeaderOptions', () => {
                const updateSpy = jest.spyOn(wmComponent as any, 'updateCalendarHeaderOptions');
                wmComponent.onPropertyChange('controls', {});
                expect(updateSpy).toHaveBeenCalled();
            });
        });

        describe('show', () => {
            it('should change view when show property changes', () => {
                wmComponent.view = 'week';
                (wmComponent as any).$fullCalendar = { changeView: jest.fn() } as any;
                wmComponent.onPropertyChange('show', true);
                expect((wmComponent as any).$fullCalendar.changeView).toHaveBeenCalledWith('timeGridWeek');
            });
        });
    });

    describe('getViewType', () => {
        const VIEW_TYPES = {
            BASIC: 'basic',
            AGENDA: 'agenda',
            LIST: 'list'
        }
        it('should return the correct view type for month', () => {
            wmComponent.calendartype = VIEW_TYPES.BASIC;
            wmComponent.view = 'month';
            expect(wmComponent.getViewType('month')).toEqual('dayGridMonth');

            wmComponent.calendartype = VIEW_TYPES.LIST;
            expect(wmComponent.getViewType('month')).toEqual('listMonth');
        });

        it('should return the correct view type for week', () => {
            wmComponent.calendartype = VIEW_TYPES.BASIC;
            wmComponent.view = 'week';
            expect(wmComponent.getViewType('week')).toEqual('dayGridWeek');

            wmComponent.calendartype = VIEW_TYPES.AGENDA;
            expect(wmComponent.getViewType('week')).toEqual('timeGridWeek');

            wmComponent.calendartype = VIEW_TYPES.LIST;
            expect(wmComponent.getViewType('week')).toEqual('listWeek');
        });

        it('should return the correct view type for day', () => {
            wmComponent.calendartype = VIEW_TYPES.BASIC;
            wmComponent.view = 'day';
            expect(wmComponent.getViewType('day')).toEqual('dayGridDay');

            wmComponent.calendartype = VIEW_TYPES.LIST;
            expect(wmComponent.getViewType('day')).toEqual('listDay');

            wmComponent.calendartype = VIEW_TYPES.AGENDA;
            expect(wmComponent.getViewType('day')).toEqual('timeGridDay');
        });

        it('should return the correct view type for year', () => {
            wmComponent.calendartype = VIEW_TYPES.LIST;
            wmComponent.view = 'year';
            expect(wmComponent.getViewType('year')).toEqual('listYear');

            wmComponent.calendartype = VIEW_TYPES.BASIC;
            expect(wmComponent.getViewType('year')).toEqual('');
        });

        it('should return the original view key if no match is found', () => {
            wmComponent.view = 'custom-view';
            expect(wmComponent.getViewType('custom-view')).toEqual('custom-view');
        });

        it('should return the correct view type for day', () => {
            wmComponent.calendartype = VIEW_TYPES.BASIC;
            wmComponent.view = 'day';
            expect(wmComponent.getViewType('day')).toEqual('dayGridDay');

            wmComponent.calendartype = VIEW_TYPES.LIST;
            expect(wmComponent.getViewType('day')).toEqual('listDay');

            wmComponent.calendartype = VIEW_TYPES.AGENDA;
            expect(wmComponent.getViewType('day')).toEqual('timeGridDay');
        });

        it('should return the correct view type for year', () => {
            wmComponent.calendartype = VIEW_TYPES.LIST;
            wmComponent.view = 'year';
            expect(wmComponent.getViewType('year')).toEqual('listYear');

            wmComponent.calendartype = VIEW_TYPES.BASIC;
            expect(wmComponent.getViewType('year')).toEqual('');
        });

        it('should return the original view key if no match is found', () => {
            wmComponent.view = 'custom-view';
            expect(wmComponent.getViewType('custom-view')).toEqual('custom-view');
        });
    });

    describe('rerenderEvents', () => {
        it('should rerender the events', () => {
            const renderSpy = jest.spyOn((wmComponent as any).$fullCalendar, 'render');
            wmComponent.rerenderEvents();
            expect(renderSpy).toHaveBeenCalled();
        });
    });
});
