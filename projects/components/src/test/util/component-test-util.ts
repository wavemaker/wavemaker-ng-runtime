import {ComponentsTestModule} from "../components.test.module";
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

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
