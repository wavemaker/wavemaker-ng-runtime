import {Component, ViewChild} from "@angular/core";
import {SelectComponent} from "./select.component";
import {ComponentTestBase, ITestComponentDef, ITestModuleDef} from "../../../../../base/src/test/common-widget.specs";
import {FormsModule} from "@angular/forms";
import {AbstractI18nService, App, AppDefaults} from '@wm/core';
import {ToDatePipe} from "@wm/components/base";
import {DatePipe} from "@angular/common";
import {MockAbstractI18nService} from '../../../../../base/src/test/util/date-test-util';
import { ComponentFixture } from "@angular/core/testing";
import { compileTestComponent } from "projects/components/base/src/test/util/component-test-util";

let mockApp = {
    subscribe: () => { return () => {}}
};

const markup = `<wm-select name="select1" hint="select field">`;

@Component({
    template: markup
})

class SelectWrapperComponent {
    @ViewChild(SelectComponent, /* TODO: add static flag */ {static: true}) wmComponent: SelectComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule],
    declarations: [SelectWrapperComponent, SelectComponent],
    providers: [
        {provide: App, useValue: mockApp},
        {provide: ToDatePipe, useClass: ToDatePipe},
        {provide: DatePipe, useClass: DatePipe},
        {provide: AppDefaults, useClass: AppDefaults},
        {provide: AbstractI18nService, useClass: MockAbstractI18nService}
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-select',
    widgetSelector: '[wmSelect]',
    testModuleDef: testModuleDef,
    testComponent: SelectWrapperComponent,
    inputElementSelector: 'select'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyAccessibility();

describe("SelectComponent", () => {
    let wrapperComponent: SelectWrapperComponent;
    let wmComponent: SelectComponent;
    let fixture: ComponentFixture<SelectWrapperComponent>;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef,SelectWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        wmComponent = wrapperComponent.wmComponent;
        wmComponent.datasetItems = [{key: '1', value: '1', label: '1'}, {key: '2', value: '2', label: '2'}, {key: '3', value: '3', label: '3'}, {key: '4', value: '4', label: '4'}]
        fixture.detectChanges();
    });

    it("should create select component", () => {
        expect(wmComponent).toBeTruthy();
    });

    it("should have name property", () => {
        expect(wmComponent.name).toBe("select1");
    });

    it("should have hint property", () => {
        expect(wmComponent.hint).toBe("select field");
    });

    it("should have datasetItems property", () => {
        expect(wmComponent.datasetItems).toBeDefined();
        expect(wmComponent.datasetItems.length).toBe(4);
    });

    it("should have options", () => {
        expect(fixture.nativeElement.querySelectorAll('option').length).toBe(5);
    });

    it("should have options with correct values", () => {
        let options = fixture.nativeElement.querySelectorAll('option');
        expect(options[1].value).toBe("1: '1'");
        expect(options[2].value).toBe("2: '2'");
        expect(options[3].value).toBe("3: '3'");
        expect(options[4].value).toBe("4: '4'");
    });

    it("should change the value on selecting an option", () => {
        let selectElement = fixture.nativeElement.querySelector('select');
        selectElement.value = selectElement.options[2].value;
        selectElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();
        expect(wmComponent.modelByKey[0]).toBe("2");
    });

    it("should have readonly property", () => {
        wmComponent.readonly = true;
        expect(wmComponent.readonly).toBeTruthy();
    });

    it("should not change the value on selecting an option when readonly is true", () => {
        wmComponent.readonly = true;
        wmComponent.datavalue = "1";
        let selectElement = fixture.nativeElement.querySelector('select');
        selectElement.value = selectElement.options[2].value;
        selectElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();
        expect(wmComponent.modelByKey[0]).toBe("1");
    });

    it("should not change the value on selecting an option when readonly is true and placeholder is given", () => {
        wmComponent.readonly = true;
        wmComponent.placeholder = "Select value";
        wmComponent.datavalue = "1";
        let selectElement = fixture.nativeElement.querySelector('select');
        selectElement.value = selectElement.options[2].value;
        selectElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();
        expect(wmComponent.modelByKey[0]).toBe("1");
    });

    it("should have placeholder property", () => {
        wmComponent.placeholder = "Select";
        expect(wmComponent.placeholder).toBe("Select");
    });

    it("should have required property", () => { 
        wmComponent.required = true;
        expect(wmComponent.required).toBeTruthy();
    });

    it("should change the value on selecting an option when required is true", () => {
        wmComponent.required = true;
        let selectElement = fixture.nativeElement.querySelector('select');
        selectElement.value = selectElement.options[2].value;
        selectElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();
        expect(wmComponent.modelByKey[0]).toBe("2");
    });

    it("should not change the value on selecting an option when required is true and placeholder is given", () => {
        wmComponent.required = true;
        wmComponent.placeholder = "Select value";
        let selectElement = fixture.nativeElement.querySelector('select');
        selectElement.value = selectElement.options[1].value;
        selectElement.dispatchEvent(new Event('change'));
        fixture.detectChanges();
        expect(wmComponent.modelByKey[0]).toBe("1");
    });

});