import { getElementByTagOnDocQuery, getHtmlSelectorElement, onClickCheckTaglengthOnBody } from "./component-test-util";
import { defineLocale, deLocale } from "ngx-bootstrap";
import { getFormattedDate, getNativeDateObject } from "@wm/core";
declare const moment;

export const datepatternTest = (fixture, selector: string, inputSelector: string, attr?: string, isLower?: boolean) => {
    fixture.whenStable().then(() => {
        let dateControl = getHtmlSelectorElement(fixture, selector)
        let dateInputControl = getHtmlSelectorElement(fixture, inputSelector);
        let attrVal = dateControl.nativeElement.getAttribute(attr || 'datepattern');
        if (!isLower) {
            attrVal = attrVal.toUpperCase();
        }
        expect(moment(dateInputControl.nativeElement.value, attrVal, true).isValid()).toBe(true);
    })
};

export const outputpatternTest = (fixture, selector: string, datavalue, isLower?: boolean, hrFormat?: boolean) => {
    fixture.whenStable().then(() => {
        let dateInputControl = getHtmlSelectorElement(fixture, selector);
        let attrVal = dateInputControl.nativeElement.getAttribute('outputformat');
        if (!isLower) {
            attrVal = attrVal.toUpperCase();
        }
        if (hrFormat) {
            let spltVal = attrVal.split('T');
            let mmCase = spltVal[1].replace('MM', 'mm');

            let ssCase = mmCase.replace('SS', 'ss');

            attrVal = spltVal[0] + 'T' + ssCase
        }

        expect(moment(datavalue, attrVal, true).isValid()).toBe(true);

    });
};

export const getTimeFieldValue = (index) => {
    return (<HTMLInputElement>(document.getElementsByTagName('timepicker')[0].getElementsByClassName('bs-timepicker-field')[index || 0])).value
}

export const triggerTimerClickonArrowsByIndex = (index?) => {

    getTimePickerElement()[index || 0].dispatchEvent(new Event("click"));
}

export const disableMaxDatePanel = (ele) => {
    let datePickerRows = ele[0].querySelectorAll('tbody tr');
    var eleRow = datePickerRows[0];
    expect(eleRow.children[7].querySelector('[bsdatepickerdaydecorator]').classList).toContain('disabled');
    for (let rowIndex = 1; rowIndex < datePickerRows.length; rowIndex++) {
        for (let index = 1; index < datePickerRows[rowIndex].children.length; index++) {
            expect(datePickerRows[rowIndex].children[index].querySelector('[bsdatepickerdaydecorator]').classList).toContain('disabled');
        }
    }

    expect(ele[0].querySelectorAll('.next')[0].hasAttribute('disabled')).toBeTruthy();
}

export const disableMindatePanel = (ele) => {
    let datePickerRows = ele[0].querySelectorAll('tbody tr');
    var eleRow = datePickerRows[0];
    for (let index = 1; index < 6; index++) {
        expect(eleRow.children[index].querySelector('[bsdatepickerdaydecorator]').classList).toContain('disabled');
    }
    expect(ele[0].querySelectorAll('.previous')[0].hasAttribute('disabled')).toBeTruthy();
}

export const expectCheckEleHasDisabled = (eleRow, index) => {
    expect(eleRow.children[index].querySelector('[bsdatepickerdaydecorator]').classList).toContain('disabled');
}
export const excludedDaysDisable = (ele) => {
    let datePickerRows = ele[0].querySelectorAll('tbody tr');
    datePickerRows.forEach(eleRow => {
        expectCheckEleHasDisabled(eleRow, 2);
        expectCheckEleHasDisabled(eleRow, 7);
    });
}

export const getTimePickerElement = () => {
    return document.getElementsByTagName('timepicker')[0].getElementsByClassName('btn-link');
}

export const localizedDatePickerTest = (fixture, btnClass) => {
    onClickCheckTaglengthOnBody(fixture, btnClass, 'bs-datepicker-container', 1);
    fixture.whenStable().then(() => {
        expect($('bs-datepicker-container').find('.bs-datepicker-head button.current span')[0].innerText).toBe(deLocale.months[new Date().getMonth()]);
        expect($('bs-datepicker-container').find('.days.weeks th')[new Date().getDay()].innerText).toBe(deLocale.weekdaysShort[new Date().getDay()]);
    });
}

export const localizedTimePickerTest = (fixture, meridians, btnClass) => {
    onClickCheckTaglengthOnBody(fixture, btnClass, null, null);
    fixture.whenStable().then(() => {
        const timePicker = getElementByTagOnDocQuery('timepicker');
        expect(timePicker[0].querySelector('button').innerHTML).toEqual(meridians[0]);
    });
}

export const localizedValueOnInputTest = (fixture, value, wmComponent, pattern?) => {
    const input =  getHtmlSelectorElement(fixture, '.app-textbox');
    input.nativeElement.value = value;
    input.triggerEventHandler('change', {target: input.nativeElement});
    fixture.detectChanges();
    const dateObj = getNativeDateObject(value, {meridians: (wmComponent as any).meridians, pattern: pattern});
    expect(getFormattedDate((wmComponent as any).datePipe, dateObj, (wmComponent as any).outputformat)).toEqual(wmComponent.datavalue);
}

export class MockAbstractI18nService {
    public getSelectedLocale() {
        return 'en';
    }

    public getLocalizedMessage(val) {
        return val;
    }

}

export class MockAbstractI18nServiceDe {
    constructor(bsLocaleService) {
        defineLocale('de', deLocale);
        bsLocaleService.use('de');
        moment.defineLocale('de', deLocale);
    }
    public getSelectedLocale() {
        return 'de';
    }

    public getLocalizedMessage(val) {
        return val;
    }
}


export class MockAbstractI18nServiceRO {
    constructor(bsLocaleService) {
        defineLocale('ro', deLocale);
        bsLocaleService.use('ro');
    }
    public getSelectedLocale() {
        return 'ro';
    }

    public getLocalizedMessage(val) {
        return val;
    }
}
