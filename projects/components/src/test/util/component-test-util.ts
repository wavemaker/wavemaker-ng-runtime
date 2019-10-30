import {ComponentsTestModule} from "../components.test.module";
import {async, ComponentFixture, TestBed} from '@angular/core/testing';

export const compileTestComponent = (moduleDef, componentInstance): ComponentFixture<any> => {
    TestBed.configureTestingModule(moduleDef)
        .compileComponents();

    return TestBed.createComponent(componentInstance);
};
