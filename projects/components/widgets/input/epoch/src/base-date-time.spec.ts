import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Injector, LOCALE_ID } from '@angular/core';
import { AbstractI18nService, App, AppDefaults, hasCordova, isIos } from '@wm/core';
import { BaseDateTimeComponent, getTimepickerConfig } from './base-date-time.component';
import { ToDatePipe } from '@wm/components/base';
import { DatePipe, FormStyle, getLocaleDayPeriods, TranslationWidth } from '@angular/common';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { MockAbstractI18nService } from 'projects/components/base/src/test/util/date-test-util';
import { AbstractControl, FormControl } from '@angular/forms';

const createMockJQueryElement = () => ({
    attr: jest.fn(),
    find: jest.fn().mockReturnThis(),
    first: jest.fn().mockReturnThis(),
    on: jest.fn(),
    off: jest.fn(),
    parent: jest.fn().mockReturnThis(),
    is: jest.fn(),
    next: jest.fn().mockReturnThis(),
    hasClass: jest.fn(),
    val: jest.fn(),
    addClass: jest.fn(),
    removeClass: jest.fn(),
    css: jest.fn(),
    length: 0,
    closest: jest.fn().mockReturnThis(), 
    focus: jest.fn()
});

const mockJQuery = jest.fn().mockImplementation(() => createMockJQueryElement());
(global as any).$ = mockJQuery;

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    isIos: jest.fn(),
    hasCordova: jest.fn()
}));

jest.mock('@angular/common', () => ({
    ...jest.requireActual('@angular/common'),
    getLocaleDayPeriods: jest.fn(),
    FormStyle: { Format: 'Format' },
    TranslationWidth: { Abbreviated: 'Abbreviated' },
}));


describe('getTimepickerConfig', () => {
    let i18nServiceMock: any;

    beforeEach(() => {
        i18nServiceMock = {
            getSelectedLocale: jest.fn(),
        };
    });

    it('should return TimepickerConfig with meridians based on selected locale', () => {
        // Arrange: Mocking the selected locale and getLocaleDayPeriods function
        i18nServiceMock.getSelectedLocale.mockReturnValue('en-US');
        (getLocaleDayPeriods as jest.Mock).mockReturnValue(['AM', 'PM']); // Mocking return value for meridians

        // Act: Call the function with the mock i18nService
        const config = getTimepickerConfig(i18nServiceMock);

        // Assert: Verify that the meridians are set based on the mocked locale
        expect(i18nServiceMock.getSelectedLocale).toHaveBeenCalled();
        expect(getLocaleDayPeriods).toHaveBeenCalledWith('en-US', FormStyle.Format, TranslationWidth.Abbreviated);
        expect(config.meridians).toEqual(['AM', 'PM']);
    });

    it('should return TimepickerConfig with different meridians for another locale', () => {
        // Arrange: Mocking another locale and day periods
        i18nServiceMock.getSelectedLocale.mockReturnValue('fr-FR');
        (getLocaleDayPeriods as jest.Mock).mockReturnValue(['matin', 'soir']); // Mocking return value for French locale

        // Act: Call the function with the mock i18nService
        const config = getTimepickerConfig(i18nServiceMock);

        // Assert: Verify the meridians are set correctly for French locale
        expect(i18nServiceMock.getSelectedLocale).toHaveBeenCalled();
        expect(getLocaleDayPeriods).toHaveBeenCalledWith('fr-FR', FormStyle.Format, TranslationWidth.Abbreviated);
        expect(config.meridians).toEqual(['matin', 'soir']);
    });

    it('should return TimepickerConfig with empty meridians if locale has no day periods', () => {
        // Arrange: Mocking a locale with no day periods
        i18nServiceMock.getSelectedLocale.mockReturnValue('unknown-locale');
        (getLocaleDayPeriods as jest.Mock).mockReturnValue([]); // No day periods for this locale

        // Act: Call the function with the mock i18nService
        const config = getTimepickerConfig(i18nServiceMock);

        // Assert: Verify the meridians are empty for unknown locale
        expect(i18nServiceMock.getSelectedLocale).toHaveBeenCalled();
        expect(getLocaleDayPeriods).toHaveBeenCalledWith('unknown-locale', FormStyle.Format, TranslationWidth.Abbreviated);
        expect(config.meridians).toEqual([]);
    });
});

@Component({
    template: '<div></div>'
})
class TestBaseDateTimeComponent extends BaseDateTimeComponent {
    constructor(inj: Injector) {
        super(inj, { widgetType: 'wm-form-field-datetime' }, null);
        Object.defineProperty(this, 'nativeElement', { writable: true, value: createMockJQueryElement() });
    }
}

describe('BaseDateTimeComponent', () => {
    let component: TestBaseDateTimeComponent;
    let fixture: ComponentFixture<TestBaseDateTimeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TestBaseDateTimeComponent],
            providers: [
                { provide: AbstractI18nService, useClass: MockAbstractI18nService },
                { provide: App, useValue: mockApp },
                { provide: AppDefaults, useValue: {} },
                ToDatePipe,
                DatePipe,
                { provide: LOCALE_ID, useValue: 'en-US' },
                {
                    provide: Injector,
                    useValue: {
                        get: jest.fn().mockReturnValue({
                            getTimezone: jest.fn(),
                            getSelectedLocale: jest.fn().mockReturnValue('en-US')
                        })
                    }
                }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestBaseDateTimeComponent);
        component = fixture.componentInstance;
        (component as any)._dateOptions = {};
        component.excludedDatesToDisable = [];
        component.excludedDaysToDisable = [];
        (component as any).i18nService = { getLocalizedMessage: jest.fn(msg => msg) } as any;
        mockJQuery.mockClear();
        jest.clearAllMocks();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
        expect(component.required).toBeUndefined();
        expect(component.disabled).toBeUndefined();
        expect(component.readonly).toBeUndefined();
        expect(component.dataentrymode).toBeUndefined();
        expect(component.excludedays).toBeUndefined();
        expect(component.excludedates).toBeUndefined();
        expect(component.mindate).toBeUndefined();
        expect(component.maxdate).toBeUndefined();
    });

    it('should update datepattern and format', () => {
        component.datepattern = 'yyyy-MM-dd HH:mm:ss';
        component.updateFormat('datepattern');
        expect(component._dateOptions.dateInputFormat).toBe('yyyy-MM-dd HH:mm:ss');
        expect((component as any).showseconds).toBe(true);
        expect((component as any).ismeridian).toBe(false);
    });

    it('should update timepattern and format', () => {
        component.timepattern = 'HH:mm:ss';
        component.updateFormat('timepattern');
        expect((component as any).showseconds).toBe(true);
        expect((component as any).ismeridian).toBe(false);
    });

    it('should validate min and max date', () => {
        const testDate = new Date('2023-06-15');
        component.mindate = '2023-06-01';
        component.maxdate = '2023-06-30';
        (component as any).minDateMaxDateValidationOnInput(testDate);
        expect((component as any).dateNotInRange).toBeFalsy();
    });

    it('should invalidate date before mindate', () => {
        const testDate = new Date('2023-05-15');
        component.mindate = '2023-06-01';
        component.maxdate = '2023-06-30';
        (component as any).minDateMaxDateValidationOnInput(testDate);
        expect((component as any).dateNotInRange).toBeTruthy();
    });

    it('should invalidate date after maxdate', () => {
        const testDate = new Date('2023-07-15');
        component.mindate = '2023-06-01';
        component.maxdate = '2023-06-30';
        (component as any).minDateMaxDateValidationOnInput(testDate);
        expect((component as any).dateNotInRange).toBeTruthy();
    });

    it('should validate excluded dates', () => {
        const testDate = new Date('2023-06-15');
        component.excludedates = '2023-06-10,2023-06-20';
        (component as any).minDateMaxDateValidationOnInput(testDate);
        expect((component as any).dateNotInRange).toBeFalsy();
    });

    it('should invalidate excluded date', () => {
        const testDate = new Date('2023-06-10');
        component.excludedates = '2023-06-10,2023-06-20';
        (component as any).minDateMaxDateValidationOnInput(testDate);
        expect((component as any).dateNotInRange).toBeTruthy();
    });

    it('should validate excluded days', () => {
        const testDate = new Date('2023-06-15'); // Thursday
        component.excludedays = '0,6'; // Sunday and Saturday
        (component as any).minDateMaxDateValidationOnInput(testDate);
        expect((component as any).dateNotInRange).toBeFalsy();
    });

    it('should invalidate excluded day', () => {
        const testDate = new Date('2023-06-18'); // Sunday
        component.excludedays = '0,6'; // Sunday and Saturday
        (component as any).minDateMaxDateValidationOnInput(testDate);
        expect((component as any).dateNotInRange).toBeTruthy();
    });

    it('should validate date format', () => {
        component.datepattern = 'yyyy-MM-dd';
        const validDate = '2023-06-15';
        const invalidDate = '15/06/2023';

        expect((component as any).formatValidation(new Date(validDate), validDate)).toBe(true);
        expect((component as any).formatValidation(new Date(invalidDate), invalidDate)).toBe(false);
    });

    it('should handle isDropDownDisplayEnabledOnInput', () => {
        expect((component as any).isDropDownDisplayEnabledOnInput('default')).toBe(true);
        expect((component as any).isDropDownDisplayEnabledOnInput('button')).toBe(false);
    });

    it('should handle isDataEntryModeEnabledOnInput', () => {
        expect((component as any).isDataEntryModeEnabledOnInput('default')).toBe(true);
        expect((component as any).isDataEntryModeEnabledOnInput('picker')).toBe(false);
    });

    describe('validate', () => {
        it('should return invalidDateTimeFormat error when format is invalid', () => {
            (component as any).invalidDateTimeFormat = true;
            const result = component.validate({} as AbstractControl);
            expect(result).toEqual({ invalidDateTimeFormat: { valid: false } });
        });

        it('should return dateNotInRange error when date is not in range', () => {
            (component as any).dateNotInRange = true;
            const result = component.validate({} as AbstractControl);
            expect(result).toEqual({ dateNotInRange: { valid: false } });
        });

        it('should return timeNotInRange error when time is not in range', () => {
            (component as any).timeNotInRange = true;
            const result = component.validate({} as AbstractControl);
            expect(result).toEqual({ timeNotInRange: { valid: false } });
        });

        it('should return required error when value is empty and required is true', () => {
            component['show'] = true;
            component['required'] = true;
            const control = new FormControl('');
            const result = component.validate(control);
            expect(result).toEqual({ required: true });
        });

        it('should return null when all validations pass', () => {
            (component as any).invalidDateTimeFormat = false;
            (component as any).dateNotInRange = false;
            (component as any).timeNotInRange = false;
            component['show'] = true;
            component['required'] = true;
            const control = new FormControl('2023-06-15');
            const result = component.validate(control);
            expect(result).toBeNull();
        });
    });

    describe('formatValidation', () => {
        let getFormattedDateMock;

        beforeEach(() => {
            getFormattedDateMock = jest.fn();
            (component as any).datePipe = { transform: getFormattedDateMock };
        });

        it('should validate timestamp format correctly', () => {
            component.datepattern = 'timestamp';
            const newVal = new Date('2023-06-15');
            const inputVal = '1686787200000'; // Timestamp for 2023-06-15
            getFormattedDateMock.mockReturnValue('1686787200000');

            const result = (component as any).formatValidation(newVal, inputVal);

            expect(result).toBe(true);
            expect((component as any).invalidDateTimeFormat).toBeUndefined();
        });

        it('should invalidate incorrect timestamp format', () => {
            component.datepattern = 'timestamp';
            const newVal = new Date('2023-06-15');
            const inputVal = '1686787200001'; // Incorrect timestamp
            getFormattedDateMock.mockReturnValue('1686787200000');

            const result = (component as any).formatValidation(newVal, inputVal);

            expect(result).toBe(false);
            expect((component as any).invalidDateTimeFormat).toBe(true);
        });

        it('should validate non-timestamp format correctly', () => {
            component.datepattern = 'yyyy-MM-dd';
            const newVal = new Date('2023-06-15');
            const inputVal = '2023-06-15';
            getFormattedDateMock.mockReturnValue('2023-06-15');

            const result = (component as any).formatValidation(newVal, inputVal);

            expect(result).toBe(true);
            expect((component as any).invalidDateTimeFormat).toBeUndefined();
        });

        it('should invalidate incorrect non-timestamp format', () => {
            component.datepattern = 'yyyy-MM-dd';
            const newVal = new Date('2023-06-15');
            const inputVal = '15-06-2023';
            getFormattedDateMock.mockReturnValue('2023-06-15');

            const result = (component as any).formatValidation(newVal, inputVal);

            expect(result).toBe(false);
            expect((component as any).invalidDateTimeFormat).toBe(true);
        });
    });


    describe('isOtheryear', () => {
        it('should return true when new date is in the next year', () => {
            (component as any).activeDate = new Date('2023-12-31');
            const newDate = new Date('2024-01-01');

            const result = (component as any).isOtheryear(newDate);

            expect(result).toBe(true);
        });

        it('should return true when new date is in the previous year', () => {
            (component as any).activeDate = new Date('2024-01-01');
            const newDate = new Date('2023-12-31');

            const result = (component as any).isOtheryear(newDate);

            expect(result).toBe(true);
        });

        it('should return false when new date is in the same year', () => {
            (component as any).activeDate = new Date('2023-06-15');
            const newDate = new Date('2023-07-15');

            const result = (component as any).isOtheryear(newDate);

            expect(result).toBe(false);
        });
    });

    describe('showDatePickerModal', () => {
        it('should show date picker and set active date', () => {
            const mockDate = new Date('2023-06-15');
            component.datetimepickerComponent = { show: jest.fn() };
            (component as any).setNextData = jest.fn();
            (component as any).addDatepickerMouseEvents = jest.fn();
            (component as any).setActiveDateFocus = jest.fn();
            jest.useFakeTimers();

            component.showDatePickerModal(mockDate);

            expect((component as any).activeDate).toEqual(mockDate);
            expect((component as any).setNextData).toHaveBeenCalledWith(mockDate);
            expect(component.datetimepickerComponent.show).toHaveBeenCalled();

            jest.runAllTimers();

            expect((component as any).addDatepickerMouseEvents).toHaveBeenCalled();
            expect((component as any).setActiveDateFocus).toHaveBeenCalledWith(mockDate, true);

            jest.useRealTimers();
        });
    });

    describe('onPropertyChange', () => {

        it('should do nothing for tabindex', () => {
            const spy = jest.spyOn(component as any, '_onChange');
            component.onPropertyChange('tabindex', 0);
            expect(spy).not.toHaveBeenCalled();
        });

        it('should call _onChange for required', () => {
            const spy = jest.spyOn(component as any, '_onChange');
            component.onPropertyChange('required', true);
            expect(spy).toHaveBeenCalledWith(component.datavalue);
        });

        it('should update datepattern and call updateFormat', () => {
            component.updateFormat = jest.fn();
            component.onPropertyChange('datepattern', 'yyyy-MM-dd');
            expect(component.updateFormat).toHaveBeenCalledWith('datepattern');
        });

        it('should update showweeks in _dateOptions', () => {
            component.onPropertyChange('showweeks', true);
            expect(component._dateOptions.showWeekNumbers).toBe(true);
        });

        it('should update mindate and call minDateMaxDateValidationOnInput', () => {
            const mockDate = new Date('2023-01-01');
            (component as any).minDateMaxDateValidationOnInput = jest.fn();
            component.onPropertyChange('mindate', mockDate);
            expect(component._dateOptions.minDate).toEqual(mockDate);
            expect((component as any).minDateMaxDateValidationOnInput).toHaveBeenCalledWith(component.datavalue);
        });

        it('should update maxdate and call minDateMaxDateValidationOnInput', () => {
            const mockDate = new Date('2023-12-31');
            (component as any).minDateMaxDateValidationOnInput = jest.fn();
            component.onPropertyChange('maxdate', mockDate);
            expect(component._dateOptions.maxDate).toEqual(mockDate);
            expect((component as any).minDateMaxDateValidationOnInput).toHaveBeenCalledWith(component.datavalue);
        });

        it('should update selectfromothermonth in _dateOptions', () => {
            component.onPropertyChange('selectfromothermonth', true);
            expect(component._dateOptions.selectFromOtherMonth).toBe(true);
        });

        it('should update todaybutton in _dateOptions', () => {
            component.onPropertyChange('todaybutton', true);
            expect(component._dateOptions.showTodayButton).toBe(true);
        });

        it('should update clearbutton in _dateOptions', () => {
            component.onPropertyChange('clearbutton', true);
            expect(component._dateOptions.showClearButton).toBe(true);
        });

        it('should update todaybuttonlabel in _dateOptions', () => {
            component.onPropertyChange('todaybuttonlabel', 'Today');
            expect(component._dateOptions.todayButtonLabel).toBe('Today');
        });

        it('should update clearbuttonlabel in _dateOptions', () => {
            component.onPropertyChange('clearbuttonlabel', 'Clear');
            expect(component._dateOptions.clearButtonLabel).toBe('Clear');
        });

        it('should update adaptiveposition in _dateOptions', () => {
            component.onPropertyChange('adaptiveposition', true);
            expect(component._dateOptions.adaptivePosition).toBe(true);
        });

        it('should update datepattern and call updateFormat', () => {
            component.updateFormat = jest.fn();
            component.onPropertyChange('datepattern', 'yyyy-MM-dd');
            expect(component.updateFormat).toHaveBeenCalledWith('datepattern');
        });

        it('should update showweeks in _dateOptions', () => {
            component.onPropertyChange('showweeks', true);
            expect(component._dateOptions.showWeekNumbers).toBe(true);
        });

        it('should update mindate and call minDateMaxDateValidationOnInput', () => {
            const mockDate = new Date('2023-01-01');
            (component as any).minDateMaxDateValidationOnInput = jest.fn();
            component.onPropertyChange('mindate', mockDate);
            expect(component._dateOptions.minDate).toEqual(mockDate);
            expect((component as any).minDateMaxDateValidationOnInput).toHaveBeenCalledWith(component.datavalue);
        });
    });

    describe('ngOnDestroy', () => {
        it('should unsubscribe from dateOnShowSubscription', () => {
            const mockUnsubscribe = jest.fn();
            (component as any).dateOnShowSubscription = { unsubscribe: mockUnsubscribe };
            component.ngOnDestroy();
            expect(mockUnsubscribe).toHaveBeenCalled();
        });

        it('should call cancelLocaleChangeSubscription if it exists', () => {
            const mockCancel = jest.fn();
            (component as any).cancelLocaleChangeSubscription = mockCancel;
            component.ngOnDestroy();
            expect(mockCancel).toHaveBeenCalled();
        });
    });

    describe('ngOnDetach', () => {
        it('should call hideModal on datetimepickerComponent if it exists', () => {
            const mockHideModal = jest.fn();
            component.datetimepickerComponent = { hideModal: mockHideModal };
            component.ngOnDetach();
            expect(mockHideModal).toHaveBeenCalled();
        });
    });

    describe('setTimezone', () => {
        it('should call i18nService.setTimezone with correct parameters', () => {
            const mockSetTimezone = jest.fn();
            (component as any).i18nService = { setTimezone: mockSetTimezone } as any;
            component.setTimezone('en-US');
            expect(mockSetTimezone).toHaveBeenCalledWith('en-US', component);
        });
    });

    describe('addDatepickerMouseEvents', () => {
        let jQueryMock: any;
        let setTimeoutSpy: jest.SpyInstance;

        beforeEach(() => {
            jQueryMock = {
                attr: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis(),
                focus: jest.fn().mockReturnThis(),
                append: jest.fn().mockReturnThis(),
                find: jest.fn().mockReturnThis(),
                remove: jest.fn().mockReturnThis(),
                first: jest.fn().mockReturnThis()
            };

            (global as any).$ = jest.fn().mockImplementation(() => jQueryMock);

            (component as any).getMonth = jest.fn().mockImplementation((date, offset) => ({
                fullMonth: offset === 0 ? 'January' : (offset === 1 ? 'February' : 'December'),
                date: new Date(2023, offset, 1)
            }));
            (component as any).setFocusForDate = jest.fn();
            (component as any).setFocusForCurrentMonthOryear = jest.fn();
            (component as any).setFocusForMonthOrDay = jest.fn();

            (component as any).next = { fullMonth: 'February', date: new Date(2023, 1, 1) };
            (component as any).prev = { fullMonth: 'December', date: new Date(2022, 11, 1) };
            (component as any).activeDate = new Date(2023, 0, 1);

            // Spy on setTimeout
            setTimeoutSpy = jest.spyOn(global, 'setTimeout');
        });

        afterEach(() => {
            setTimeoutSpy.mockRestore();
        });


        it('should handle previous button click with timeout', () => {
            (component as any).addDatepickerMouseEvents();
            const onCall = jQueryMock.on.mock.calls.find((call: any[]) => call[1] === '.previous');
            if (onCall) {
                const clickHandler = onCall[2];
                clickHandler({ originalEvent: {} });

                expect(setTimeoutSpy).toHaveBeenCalled();

                // Execute the timeout callback
                setTimeoutSpy.mock.calls[0][0]();

                expect(jQueryMock.attr).toHaveBeenCalledWith('aria-hidden', 'true');
                expect(jQueryMock.attr).toHaveBeenCalledWith('aria-label', 'Next Month, February 2023');
                expect(jQueryMock.attr).toHaveBeenCalledWith('aria-label', 'Previous Month, December 2022');
                expect(jQueryMock.append).toHaveBeenCalledWith(expect.stringContaining('Changed to Previous Month, December'));
                expect(jQueryMock.focus).toHaveBeenCalled();
            }
        });

        it('should handle next button click with timeout', () => {
            (component as any).addDatepickerMouseEvents();
            const onCall = jQueryMock.on.mock.calls.find((call: any[]) => call[1] === '.next');
            if (onCall) {
                const clickHandler = onCall[2];
                clickHandler({ originalEvent: {} });

                expect(setTimeoutSpy).toHaveBeenCalled();

                // Execute the timeout callback
                setTimeoutSpy.mock.calls[0][0]();

                expect(jQueryMock.attr).toHaveBeenCalledWith('aria-hidden', 'true');
                expect(jQueryMock.attr).toHaveBeenCalledWith('aria-label', 'Next Month, February 2023');
                expect(jQueryMock.attr).toHaveBeenCalledWith('aria-label', 'Previous Month, December 2022');
                expect(jQueryMock.append).toHaveBeenCalledWith(expect.stringContaining('Changed to Next Month, February'));
                expect(jQueryMock.focus).toHaveBeenCalled();
            }
        });

        it('should handle next button click', () => {
            (component as any).addDatepickerMouseEvents();
            const onCall = jQueryMock.on.mock.calls.find((call: any[]) => call[1] === '.next');
            if (onCall) {
                const clickHandler = onCall[2];
                clickHandler({ originalEvent: {} });
                expect((component as any).setFocusForDate).toHaveBeenCalledWith(1);
            }
        });

        it('should handle current button click', () => {
            (component as any).addDatepickerMouseEvents();
            const onCall = jQueryMock.on.mock.calls.find((call: any[]) => call[1] === '.current');
            if (onCall) {
                const clickHandler = onCall[2];
                clickHandler({ originalEvent: {} });
                expect((component as any).setFocusForCurrentMonthOryear).toHaveBeenCalled();
            }
        });

        it('should handle action buttons click', () => {
            (component as any).addDatepickerMouseEvents();
            const onCall = jQueryMock.on.mock.calls.find((call: any[]) => call[1] === '.bs-datepicker-action-buttons');
            if (onCall) {
                const clickHandler = onCall[2];
                const mockEvent = { stopPropagation: jest.fn(), originalEvent: {} };
                clickHandler(mockEvent);
                expect(mockEvent.stopPropagation).toHaveBeenCalled();
                expect((component as any).setFocusForMonthOrDay).toHaveBeenCalled();
            }
        });

        it('should set aria-label for next and previous buttons', () => {
            (component as any).addDatepickerMouseEvents();
            expect(jQueryMock.attr).toHaveBeenCalledWith('aria-label', 'Next Month, February 2023');
            expect(jQueryMock.attr).toHaveBeenCalledWith('aria-label', 'Previous Month, December 2022');
        });
    });

    describe('getMobileInput', () => {
        it('should return the mobile input element', () => {
            const mockElement = document.createElement('div');
            const mockInput = document.createElement('input');
            mockInput.classList.add('mobile-input');
            mockElement.appendChild(mockInput);
            (component as any).nativeElement = mockElement;

            const result = component.getMobileInput();
            expect(result).toBe(mockInput);
        });
    });

    describe('onDateTimeInputBlur', () => {
        it('should remove opacity classes when not in Cordova', () => {
            const mockElement = document.createElement('div');
            const mockInput = document.createElement('input');
            mockInput.classList.add('mobile-input');
            const mockChild1 = document.createElement('div');
            const mockChild2 = document.createElement('div');
            mockElement.appendChild(mockInput);
            mockElement.appendChild(mockChild1);
            mockElement.appendChild(mockChild2);
            (component as any).nativeElement = mockElement;

            // Mock hasCordova function
            (global as any).hasCordova = jest.fn().mockReturnValue(false);

            component.onDateTimeInputBlur();

            expect(mockChild1.classList.contains('add-opacity')).toBeFalsy();
            expect(mockChild2.classList.contains('add-opacity')).toBeFalsy();
            expect(mockInput.classList.contains('remove-opacity')).toBeFalsy();
        });

        it('should not modify classes when in Cordova', () => {
            const mockElement = document.createElement('div');
            (component as any).nativeElement = mockElement;

            // Mock hasCordova function
            (global as any).hasCordova = jest.fn().mockReturnValue(true);

            component.onDateTimeInputBlur();

            expect(mockElement.children.length).toBe(0);
        });
    });

    describe('onDateTimeInputFocus', () => {
        beforeEach(() => {
            component.loadNativeDateInput = true;
            (component as any)._triggeredByUser = true;
            (hasCordova as jest.Mock).mockReturnValue(false);
        });

        it('should add opacity classes when skipFocus is true', () => {
            const mockElement = document.createElement('div');
            const mockInput = document.createElement('input');
            mockInput.classList.add('mobile-input');
            const mockChild1 = document.createElement('div');
            const mockChild2 = document.createElement('div');
            mockElement.appendChild(mockInput);
            mockElement.appendChild(mockChild1);
            mockElement.appendChild(mockChild2);
            Object.defineProperty(component, 'nativeElement', {
                writable: true,
                value: mockElement
            });
            component.onDateTimeInputFocus(true);

            expect(mockChild1.classList.contains('add-opacity')).toBeTruthy();
            expect(mockChild2.classList.contains('add-opacity')).toBeTruthy();
            expect(mockInput.classList.contains('remove-opacity')).toBeTruthy();
        });

        it('should focus and click input when not skipping focus', () => {
            const mockInput = document.createElement('input');
            mockInput.classList.add('mobile-input');
            mockInput.focus = jest.fn();
            mockInput.click = jest.fn();
            Object.defineProperty(component, 'nativeElement', {
                writable: true,
                value: { querySelector: jest.fn().mockReturnValue(mockInput) }
            });

            component.onDateTimeInputFocus();

            expect(mockInput.focus).toHaveBeenCalled();
            expect(mockInput.click).toHaveBeenCalled();
        });

        it('should do nothing when loadNativeDateInput is false', () => {
            component.loadNativeDateInput = false;
            const mockInput = document.createElement('input');
            mockInput.focus = jest.fn();
            mockInput.click = jest.fn();
            Object.defineProperty(component, 'nativeElement', {
                writable: true,
                value: { querySelector: jest.fn().mockReturnValue(mockInput) }
            });

            component.onDateTimeInputFocus();

            expect(mockInput.focus).not.toHaveBeenCalled();
            expect(mockInput.click).not.toHaveBeenCalled();
        });
    });

    describe('isValidDate', () => {
        it('should return true for valid Date object', () => {
            const validDate = new Date();
            expect((component as any).isValidDate(validDate)).toBe(true);
        });

        it('should return false for invalid Date object', () => {
            const invalidDate = new Date('invalid');
            expect((component as any).isValidDate(invalidDate)).toBe(false);
        });
    });

    describe('updateTimeValue', () => {
        it('should update minutes correctly', () => {
            const mockEl = {
                find: jest.fn().mockReturnValue({ value: '' })
            };
            (component as any).bsTimePicker = {
                updateMinutes: jest.fn(),
                updateSeconds: jest.fn()
            };

            jest.useFakeTimers();
            (component as any).updateTimeValue(mockEl, '5', 'minutes');

            expect(mockEl.find).toHaveBeenCalledWith('input[aria-label="minutes"]');
            expect(mockEl.find).toHaveBeenCalledWith('input[aria-label="seconds"]');
            expect(mockEl.find().value).toBe('00');

            jest.runAllTimers();
            expect((component as any).bsTimePicker.updateMinutes).toHaveBeenCalled();
        });

        it('should update seconds correctly', () => {
            const mockEl = {
                find: jest.fn().mockReturnValue({ value: '' })
            };
            (component as any).bsTimePicker = {
                updateMinutes: jest.fn(),
                updateSeconds: jest.fn()
            };

            (component as any).updateTimeValue(mockEl, '30', 'seconds');

            expect(mockEl.find).toHaveBeenCalledWith('input[aria-label="minutes"]');
            expect(mockEl.find).toHaveBeenCalledWith('input[aria-label="seconds"]');
            expect(mockEl.find().value).toBe('00');
            expect((component as any).bsTimePicker.updateSeconds).toHaveBeenCalled();
        });
    });

    describe('getCordovaPluginDatePickerApi', () => {
        beforeEach(() => {
            (isIos as jest.Mock).mockReset();
        });

        it('should return undefined when not on iOS', () => {
            (isIos as jest.Mock).mockReturnValue(false);
            const result = component.getCordovaPluginDatePickerApi();
            expect(result).toBeUndefined();
        });

        it('should return the selectDate function when on iOS', () => {
            (isIos as jest.Mock).mockReturnValue(true);
            const mockSelectDate = jest.fn();
            Object.defineProperty(window, 'cordova', {
                value: {
                    wavemaker: {
                        datePicker: {
                            selectDate: mockSelectDate
                        }
                    }
                },
                writable: true
            });

            const result = component.getCordovaPluginDatePickerApi();
            expect(result).toBe(mockSelectDate);
        });

        it('should return undefined when on iOS but cordova.wavemaker.datePicker.selectDate is not available', () => {
            (isIos as jest.Mock).mockReturnValue(true);
            Object.defineProperty(window, 'cordova', {
                value: {},
                writable: true
            });

            const result = component.getCordovaPluginDatePickerApi();
            expect(result).toBeUndefined();
        });

        afterEach(() => {
            if ('cordova' in window) {
                delete (window as any).cordova;
            }
        });
    });

    describe('addEventsOnTimePicker', () => {

        beforeEach(() => {
            (component as any).updateTimeValue = jest.fn();
            (component as any).timeFormatValidation = jest.fn();
            (component as any).focus = jest.fn();
            component.invokeOnChange = jest.fn();
            (component as any).elementScope = {
                hideTimepickerDropdown: jest.fn(),
                setIsTimeOpen: jest.fn(),
                mintime: '00:00',
                maxtime: '23:59',
                bsTimeValue: new Date(),
                displayValue: '12:00'
            };
            (component as any).isValidDate = jest.fn().mockReturnValue(true);
        })
        it('should add keyup event listener to the first input field', () => {
            const mockElement = createMockJQueryElement();
            (component as any).addEventsOnTimePicker(mockElement);
            expect(mockElement.find).toHaveBeenCalledWith('.bs-timepicker-field');
            expect(mockElement.first().on).toHaveBeenCalledWith('keyup', expect.any(Function));
        });

        it('should update minutes and seconds when hour is entered', () => {
            const mockElement = createMockJQueryElement();
            mockElement.find.mockReturnValue({
                first: jest.fn().mockReturnThis(),
                on: jest.fn(),
                0: { value: '12' },
                1: { value: '' },
                2: { value: '' },
                length: 3
            });
            (component as any).addEventsOnTimePicker(mockElement);
            const keyupHandler = mockElement.find().first().on.mock.calls[0][1];
            keyupHandler({ target: { value: '12' } });
            expect((component as any).updateTimeValue).toHaveBeenCalledTimes(2);
            expect((component as any).updateTimeValue).toHaveBeenCalledWith(mockElement, '12', 'minutes');
            expect((component as any).updateTimeValue).toHaveBeenCalledWith(mockElement, '12', 'seconds');
        });

        it('should add keydown event listener', () => {
            const mockElement = createMockJQueryElement();
            (component as any).addEventsOnTimePicker(mockElement);
            expect(mockElement.on).toHaveBeenCalledWith('keydown', expect.any(Function));
        });

        it('should add click event listener to chevron buttons', () => {
            const mockElement = createMockJQueryElement();
            (component as any).addEventsOnTimePicker(mockElement);
            expect(mockElement.find).toHaveBeenCalledWith('a');
            expect(mockElement.find().on).toHaveBeenCalledWith('click', expect.any(Function));
        });
    });
});