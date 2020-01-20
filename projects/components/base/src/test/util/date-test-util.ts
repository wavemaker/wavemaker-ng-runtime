import { getHtmlSelectorElement } from "./component-test-util";
declare const moment

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
