import { ComponentsTestModule } from "../components.test.module";
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

export const compileTestComponent = (moduleDef, componentInstance): ComponentFixture<any> => {
    TestBed.configureTestingModule(moduleDef)
        .compileComponents();

    return TestBed.createComponent(componentInstance);
};

export const setInputValue = async (fixture, selector: string, value: string) => {
    const input = fixture.debugElement.query(By.css(selector)).nativeElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    return await fixture.whenStable();
};


export const getHtmlSelectorElement = (fixture, selector: string) => {
    return fixture.debugElement.query(By.css(selector));
}

export const getElementByTagOnDocQuery = (tagName: string) => {
    return document.getElementsByTagName(tagName);
}

export const checkElementClass = (fixture, cssquery: string, eleClass: string) => {
    fixture.whenStable().then(() => {
        let dateControl = getHtmlSelectorElement(fixture, cssquery);

        fixture.detectChanges();
        expect(dateControl.nativeElement.classList).toContain(eleClass);

    });
}

export const checkCustomElementClass = (elem, toCheckClass) => {
    expect(elem.classList.contains(toCheckClass)).toBeTruthy();
}

export const onClickCheckTaglengthOnBody =
    (fixture, selector: string, tagName: string, expectedEleLength: number, callback?: Function) => {
        if (selector) {
            let elem = getHtmlSelectorElement(fixture, selector)
            elem.nativeElement.click();
        }

        fixture.detectChanges();
        if (!tagName) {
            return;
        }
        let element = document.getElementsByTagName(tagName);

        expect(element.length).toBe(expectedEleLength);
        if (callback) {
            callback(element);
        }
    };

export const onClickCheckClassEleLengthOnBody = (fixture, selector: string, classquery: string, expectedEleLength: number, callback?: Function) => {
    let element = getHtmlSelectorElement(fixture, selector)
    element.nativeElement.click();
    fixture.whenStable().then(() => {
        expect(document.getElementsByClassName(classquery).length).toBeGreaterThanOrEqual(expectedEleLength);
        if (callback) {
            callback();
        }

    });
};

export const hasAttributeCheck = (fixture, selector: string, attribute: string) => {
    fixture.whenStable().then(() => {
        let element = getHtmlSelectorElement(fixture, selector);
        expect(element.nativeElement.hasAttribute(attribute)).toBe(true);
    });
}

export const notHavingTheAttribute = (fixture, selector: string, attribute: string) => {
    fixture.whenStable().then(() => {
        let element = getHtmlSelectorElement(fixture, selector);
        expect(element.nativeElement.hasAttribute(attribute)).toBe(false);
    });
}

export const mockApp = { 
    subscribe: () => { return () => {}},
    getSelectedLocale: () => {
        return 'en';
    }
};

export const mockViewport = {};
