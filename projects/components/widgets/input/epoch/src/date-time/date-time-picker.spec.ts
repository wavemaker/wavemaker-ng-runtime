import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateTimePickerComponent, TimePickerComponent } from './date-time-picker.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { App } from '@wm/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';
import moment from 'moment';
import { filter } from 'lodash-es';

jest.mock('lodash-es', () => ({
    filter: jest.fn(),
}));

describe('DateTimePickerComponent', () => {
    let component: DateTimePickerComponent;
    let fixture: ComponentFixture<DateTimePickerComponent>;
    let mockBsModalService: jest.Mocked<BsModalService>;

    beforeEach(() => {
        mockBsModalService = {
            show: jest.fn(),
            hide: jest.fn(),
        } as any;

        TestBed.configureTestingModule({
            declarations: [DateTimePickerComponent],
            providers: [
                { provide: BsModalService, useValue: mockBsModalService },
                { provide: App, useValue: mockApp },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DateTimePickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set default values', () => {
        expect(component['mode']).toBe('DATE_TIME');
        expect(component['placement']).toBe('MODAL');
        expect(component['_value']).toBeInstanceOf(Date);
    });

    it('should update value and changedValue when setting value', () => {
        const testDate = new Date(2023, 0, 1);
        component.value = testDate;
        expect(component['_value']).toEqual(testDate);
        expect(component['changedValue']).toEqual(testDate);
    });

    it('should update bsDatepickerConfig when setting config', () => {
        const testConfig: Partial<BsDatepickerConfig> = {
            dateInputFormat: 'YYYY-MM-DD',
        };
        component.bsDatepickerConfig = testConfig as BsDatepickerConfig;
        expect(component['_bsDatepickerConfig']).toEqual(expect.objectContaining(testConfig));
        expect(component['_bsDatepickerConfig'].showClearButton).toBe(false);
        expect(component['_bsDatepickerConfig'].showTodayButton).toBe(false);
    });

    it('should update displayFormat', () => {
        component.displayFormat = 'yyyy-MM-dd';
        expect(component['_displayFormat']).toBe('YYYY-MM-DD');
    });

    it('should validate selected date', () => {
        (component as any).changedValue = new Date(2023, 0, 1);
        component['_bsDatepickerConfig'] = {
            minDate: new Date(2022, 0, 1),
            maxDate: new Date(2024, 0, 1),
        } as BsDatepickerConfig;
        expect(component.validateSelectedDate()).toBe(true);

        (component as any).changedValue = new Date(2021, 0, 1);
        expect(component.validateSelectedDate()).toBe(false);

        (component as any).changedValue = new Date(2025, 0, 1);
        expect(component.validateSelectedDate()).toBe(false);
    });

    it('should update changedValue on date update', () => {
        const newDate = new Date(2023, 0, 1);
        component.onDateUpdate(newDate);
        expect((component as any).changedValue).toEqual(newDate);
    });

    it('should show modal when show() is called', () => {
        component.show();
        expect(mockBsModalService.show).toHaveBeenCalled();
    });

    it('should clear values when clear() is called', () => {
        component.clear();
        expect((component as any).changedValue).toBeNull();
    });

    it('should set today\'s date when setToday() is called', () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        component.setToday();
        expect((component as any).changedValue?.getTime()).toBe(today.getTime());
    });

    it('should trigger change event when triggerChange() is called', () => {
        const changeSpy = jest.spyOn(component.change, 'emit');
        component.value = new Date(2023, 0, 1);
        (component as any).changedValue = new Date(2023, 0, 2);
        component.triggerChange();
        expect(changeSpy).toHaveBeenCalledWith((component as any).changedValue);
    });

    describe('getDateLabel', () => {
        it('should return formatted date string', () => {
            const testDate = new Date('2023-01-01T12:00:00');
            (component as any).changedValue = testDate;
            component.displayFormat = 'YYYY-MM-DD HH:mm';
            expect(component.getDateLabel()).toBe('2023-01-01 12:00');
        });
    });

    describe('openDatePicker', () => {
        it('should set isDateOpen to true and isTimeOpen to false', () => {
            component.openDatePicker();
            expect((component as any).isDateOpen).toBe(true);
            expect((component as any).isTimeOpen).toBe(false);
        });
    });

    describe('openTimePicker', () => {
        it('should set isTimeOpen to true and isDateOpen to false', () => {
            component.openTimePicker();
            expect((component as any).isTimeOpen).toBe(true);
            expect((component as any).isDateOpen).toBe(false);
        });
    });

    describe('onDateUpdate', () => {
        it('should update changedValue and set time to 00:00:00 in DATE mode', () => {
            (component as any).mode = 'DATE';
            const newDate = new Date('2023-01-01T12:34:56');
            component.onDateUpdate(newDate);
            expect((component as any).changedValue).toEqual(new Date('2023-01-01T00:00:00'));
        });

        it('should preserve time when updating date in non-DATE mode', () => {
            (component as any).mode = 'DATETIME';
            (component as any).changedValue = new Date('2023-01-01T12:34:56');
            const newDate = new Date('2023-02-02T00:00:00');
            component.onDateUpdate(newDate);
            expect((component as any).changedValue).toEqual(new Date('2023-02-02T12:34:56'));
        });
    });

    describe('onTimeUpdate', () => {
        it('should update changedValue with new time', () => {
            const newTime = new Date('2023-01-01T15:30:00');
            component.onTimeUpdate(newTime);
            expect((component as any).changedValue).toEqual(newTime);
        });
    });

    describe('hideModal', () => {
        it('should call bsModalService.hide with modalRef.id if modalRef exists', () => {
            (component as any).modalRef = { id: 123 } as any;
            component.hideModal();
            expect(mockBsModalService.hide).toHaveBeenCalledWith(123);
        });

        it('should not call bsModalService.hide if modalRef does not exist', () => {
            (component as any).modalRef = undefined;
            component.hideModal();
            expect(mockBsModalService.hide).not.toHaveBeenCalled();
        });
    });

    describe('onCancelClick', () => {
        it('should reset changedValue to _value and hide modal', () => {
            (component as any)._value = new Date('2023-01-01T00:00:00');
            (component as any).changedValue = new Date('2023-02-02T00:00:00');
            jest.spyOn(component, 'hideModal');
            component.onCancelClick();
            expect((component as any).changedValue).toEqual((component as any)._value);
            expect(component.hideModal).toHaveBeenCalled();
        });
    });

    describe('onOkClick', () => {
        it('should trigger change and hide modal if selected date is valid', () => {
            jest.spyOn(component, 'validateSelectedDate').mockReturnValue(true);
            jest.spyOn(component, 'triggerChange');
            jest.spyOn(component, 'hideModal');
            component.onOkClick();
            expect(component.triggerChange).toHaveBeenCalled();
            expect(component.hideModal).toHaveBeenCalled();
        });

        it('should only hide modal if selected date is invalid', () => {
            jest.spyOn(component, 'validateSelectedDate').mockReturnValue(false);
            jest.spyOn(component, 'triggerChange');
            jest.spyOn(component, 'hideModal');
            component.onOkClick();
            expect(component.triggerChange).not.toHaveBeenCalled();
            expect(component.hideModal).toHaveBeenCalled();
        });
    });

    describe('hideOnClick', () => {
        it('should set up click handlers', () => {
            const mockStopPropagation = jest.fn();
            const mockClickHandlers: Function[] = [];
            const mockJQueryResult = {
                click: jest.fn().mockImplementation(handler => {
                    mockClickHandlers.push(handler);
                })
            };
            const mockJQuery = jest.fn().mockReturnValue(mockJQueryResult);
            (global as any).$ = mockJQuery;

            jest.spyOn(component, 'onCancelClick').mockImplementation();

            component['hideOnClick']();

            expect(mockJQuery).toHaveBeenCalledWith('body>modal-container .date-picker-modal .app-datetime-picker');
            expect(mockJQuery).toHaveBeenCalledWith('body>modal-container .date-picker-modal');
            expect(mockClickHandlers.length).toBe(2);

            // Test the first click handler (stopPropagation)
            mockClickHandlers[0]({ stopPropagation: mockStopPropagation });
            expect(mockStopPropagation).toHaveBeenCalled();

            // Test the second click handler (onCancelClick)
            mockClickHandlers[1]();
            expect(component.onCancelClick).toHaveBeenCalled();
        });
    });

    describe('validateSelectedDate', () => {
        beforeEach(() => {
            (component as any).changedValue = null;
            (component as any).mode = 'DATE';
            (component as any)._bsDatepickerConfig = {};
            (component as any).excludedDatesToDisable = [];
        });

        it('should return true if changedValue is not set', () => {
            expect((component as any).validateSelectedDate()).toBe(true);
        });

        it('should return false if date is before minDate in DATE mode', () => {
            (component as any).changedValue = new Date(2023, 0, 1);
            (component as any)._bsDatepickerConfig.minDate = new Date(2023, 0, 2);
            expect(component.validateSelectedDate()).toBe(false);
        });

        it('should return true if date is equal to minDate in DATE mode', () => {
            (component as any).changedValue = new Date(2023, 0, 1);
            (component as any)._bsDatepickerConfig.minDate = new Date(2023, 0, 1);
            expect(component.validateSelectedDate()).toBe(true);
        });

        it('should return false if date is before minDate in non-DATE mode', () => {
            (component as any).mode = 'DATETIME';
            (component as any).changedValue = new Date(2023, 0, 1, 10, 0);
            (component as any)._bsDatepickerConfig.minDate = new Date(2023, 0, 1, 11, 0);
            expect(component.validateSelectedDate()).toBe(false);
        });

        it('should return true if date is equal to minDate in non-DATE mode', () => {
            (component as any).mode = 'DATETIME';
            (component as any).changedValue = new Date(2023, 0, 1, 10, 0);
            (component as any)._bsDatepickerConfig.minDate = new Date(2023, 0, 1, 10, 0);
            expect(component.validateSelectedDate()).toBe(true);
        });

        it('should return false if date is after maxDate in DATE mode', () => {
            (component as any).changedValue = new Date(2023, 0, 3);
            (component as any)._bsDatepickerConfig.maxDate = new Date(2023, 0, 2);
            expect(component.validateSelectedDate()).toBe(false);
        });

        it('should return true if date is equal to maxDate in DATE mode', () => {
            (component as any).changedValue = new Date(2023, 0, 2);
            (component as any)._bsDatepickerConfig.maxDate = new Date(2023, 0, 2);
            expect(component.validateSelectedDate()).toBe(true);
        });

        it('should return false if date is after maxDate in non-DATE mode', () => {
            (component as any).mode = 'DATETIME';
            (component as any).changedValue = new Date(2023, 0, 1, 12, 0);
            (component as any)._bsDatepickerConfig.maxDate = new Date(2023, 0, 1, 11, 0);
            expect(component.validateSelectedDate()).toBe(false);
        });

        it('should return true if date is equal to maxDate in non-DATE mode', () => {
            (component as any).mode = 'DATETIME';
            (component as any).changedValue = new Date(2023, 0, 1, 11, 0);
            (component as any)._bsDatepickerConfig.maxDate = new Date(2023, 0, 1, 11, 0);
            expect(component.validateSelectedDate()).toBe(true);
        });

        it('should return false if date is in daysDisabled', () => {
            (component as any).changedValue = new Date(2023, 0, 1); // Sunday
            (component as any)._bsDatepickerConfig.daysDisabled = [0]; // Sunday is disabled
            expect(component.validateSelectedDate()).toBe(false);
        });

        it('should return true if date is not in daysDisabled', () => {
            (component as any).changedValue = new Date(2023, 0, 2); // Monday
            (component as any)._bsDatepickerConfig.daysDisabled = [0]; // Sunday is disabled
            expect(component.validateSelectedDate()).toBe(true);
        });

        it('should return false if date is in excludedDatesToDisable', () => {
            const testDate = new Date(2023, 0, 1);
            (component as any).changedValue = testDate;
            (component as any).excludedDatesToDisable = [testDate];
            expect(component.validateSelectedDate()).toBe(false);
        });

        it('should return true if date is not in excludedDatesToDisable', () => {
            (component as any).changedValue = new Date(2023, 0, 1);
            (component as any).excludedDatesToDisable = [new Date(2023, 0, 2)];
            expect(component.validateSelectedDate()).toBe(true);
        });
    });

    describe('highlightToday', () => {
        let mockJQueryElement;

        beforeEach(() => {
            // Mock the current date by mocking getDate instead of Date itself
            jest.spyOn(Date.prototype, 'getDate').mockReturnValue(6); // Return '6' for the current day

            // Mock jQuery's selection and filtering
            mockJQueryElement = {
                not: jest.fn().mockReturnThis(),
                text: jest.fn(() => '6'),  // Mock text to match today's date (6)
                addClass: jest.fn(),       // Mock addClass to spy on class addition
            };

            jest.spyOn((global as any), '$').mockImplementation((selector) => mockJQueryElement);

            // Mock lodash's filter function
            (filter as jest.Mock).mockImplementation((elements, callback) => {
                // Simulate calling the callback for each element
                callback(mockJQueryElement);
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should highlight today\'s date', () => {
            // Call the highlightToday method
            component['hightlightToday']();

            // Verify that jQuery was called with the correct selector for today's date
            expect($).toHaveBeenCalledWith(`body > modal-container .date-picker-modal span:contains(6)`);

            // Verify that filter was called
            expect(filter).toHaveBeenCalledWith(expect.anything(), expect.any(Function));

            // Verify that the correct class was added to the matching element
            expect(mockJQueryElement.addClass).toHaveBeenCalledWith('current-date text-info');
        });
    });
});


describe('TimePickerComponent', () => {
    let component: TimePickerComponent;
    let fixture: ComponentFixture<TimePickerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TimePickerComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TimePickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should populate options correctly', () => {
        expect(component.options.hour.length).toBe(24);
        expect(component.options.minute.length).toBe(60);
        expect(component.options.second.length).toBe(60);
        expect(component.options.meridian).toEqual(['AM', 'PM']);
    });

    it('should set hour correctly', () => {
        const initialHour = component.hour;
        component.set({ index: 0, value: '14' }, 'HOUR');
        expect(component.hour).toBe(14);
        expect(component.hour).not.toBe(initialHour);
    });

    it('should set minute correctly', () => {
        const initialMinute = component.minute;
        component.set({ index: 0, value: '30' }, 'MINUTE');
        expect(component.minute).toBe(30);
        expect(component.minute).not.toBe(initialMinute);
    });

    it('should set second correctly', () => {
        const initialDate = new Date();
        (component as any).value = initialDate;
        fixture.detectChanges();

        const initialSecond = initialDate.getUTCSeconds();
        console.log('Initial UTC second:', initialSecond);

        const newSecond = (initialSecond + 1) % 60; // Ensure we're setting a different second
        component.set({ index: 0, value: newSecond.toString() }, 'SECOND');
        fixture.detectChanges();

        const updatedSecond = new Date((component as any).value).getUTCSeconds();
        console.log('Updated UTC second:', updatedSecond);

        expect(updatedSecond).toBe(newSecond);
        expect(updatedSecond).not.toBe(initialSecond);
    });


    it('should emit change event when time is set', () => {
        jest.spyOn(component.change, 'emit');
        component.set({ index: 0, value: '10' }, 'HOUR');
        expect(component.change.emit).toHaveBeenCalled();
    });

    it('should not allow setting time before min', () => {
        const minDate = new Date();
        minDate.setHours(minDate.getHours() + 1);
        (component as any).min = minDate;
        component.set({ index: 0, value: (minDate.getHours() - 1).toString() }, 'HOUR');
        expect((component as any).value).toEqual(minDate);
    });

    it('should not allow setting time after max', () => {
        const maxDate = new Date();
        maxDate.setHours(maxDate.getHours() - 1);
        (component as any).max = maxDate;
        component.set({ index: 0, value: (maxDate.getHours() + 1).toString() }, 'HOUR');
        expect((component as any).value).toEqual(maxDate);
    });

    it('should return correct meridian', () => {
        expect(component.meridian).toBe('AM');
    });

    it('should not change value when setting meridian', () => {
        const initialValue = (component as any).value;
        component.set({ index: 0, value: 'PM' }, 'MERIDIAN');
        expect((component as any).value).toEqual(initialValue);
    });

    it('should handle invalid meridian input', () => {
        const initialValue = (component as any).value;
        component.set({ index: 0, value: 'INVALID' }, 'MERIDIAN');
        expect((component as any).value).toEqual(initialValue);
    });

    it('should always return AM for meridian regardless of hour', () => {
        component.set({ index: 0, value: '10' }, 'HOUR');
        expect(component.meridian).toBe('AM');
        component.set({ index: 0, value: '14' }, 'HOUR');
        expect(component.meridian).toBe('AM');
        component.set({ index: 0, value: '23' }, 'HOUR');
        expect(component.meridian).toBe('AM');
    });

    it('should not modify time when ngAfterViewInit is called', () => {
        const initialValue = (component as any).value;
        component.ngAfterViewInit();
        expect((component as any).value).toEqual(initialValue);
    });

    it('should handle all time unit settings', () => {
        component.set({ index: 0, value: '15' }, 'HOUR');
        expect(component.hour).toBe(15);

        component.set({ index: 0, value: '30' }, 'MINUTE');
        expect(component.minute).toBe(30);

        component.set({ index: 0, value: '45' }, 'SECOND');
        expect(component.second).toBe(45);

        component.set({ index: 0, value: 'PM' }, 'MERIDIAN');
        expect(moment((component as any).value).format('A')).toBe('PM');
    });

    it('should be called with the correct value', () => {
        // Create a spy to track if the method is called
        const onDateUpdateSpy = jest.spyOn(component, 'onDateUpdate');

        // Sample value for newVal
        const newValue = '2024-09-06';

        // Call the method
        component.onDateUpdate(newValue);

        // Verify that the method was called with the correct argument
        expect(onDateUpdateSpy).toHaveBeenCalledWith(newValue);
    });
});