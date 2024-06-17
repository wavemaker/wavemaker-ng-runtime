import { compileTestComponent } from "../../../../base/src/test/util/component-test-util";
import {
    ITestModuleDef,
    ITestComponentDef,
    ComponentTestBase
} from "../../../../base/src/test/common-widget.specs";
import { ComponentsTestModule } from "../../../../base/src/test/components.test.module";
import { FormsModule } from "@angular/forms";
import { DatePipe } from '@angular/common';
import { ToDatePipe } from '@wm/components/base';
import { RatingComponent } from "./rating.component";
import { ComponentFixture } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Component, ViewChild } from "@angular/core";
import {AbstractI18nService, App, AppDefaults} from '@wm/core';
import {MockAbstractI18nService} from '../../../../base/src/test/util/date-test-util';

let mockApp = {
    subscribe: () => { return () => {}}
};

const markup = `<div tabindex="1"  wmRating  name="rating1"></div>`;
@Component({
    template: markup
})
class TestComponent {
    @ViewChild(RatingComponent, /* TODO: add static flag */ {static: true}) wmComponent: RatingComponent;
}

const testModuleDef: ITestModuleDef = {
    declarations: [RatingComponent, TestComponent],
    imports: [FormsModule, ComponentsTestModule],
    providers: [
        { provide: App, useValue: mockApp },
        {provide: AbstractI18nService, useClass: MockAbstractI18nService},
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AppDefaults, useClass: AppDefaults }
    ]
};
const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: "wm-rating",
    widgetSelector: `[wmRating]`,
    testModuleDef,
    testComponent: TestComponent
};
const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();

describe("wm-rating: Component Specific tests", () => {
    let wmComponent: RatingComponent;
    let fixture: ComponentFixture<TestComponent>, testElement;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, TestComponent);
        fixture.detectChanges();
        wmComponent = fixture.componentInstance.wmComponent;
        testElement = fixture.debugElement.queryAll(By.css("label"))[3];
    });
    it("should create the component", () => {
        expect(fixture.componentInstance).toBeTruthy();
        expect(wmComponent).toBeTruthy();
    });
    it("should set the datavalue", () => {
        wmComponent.datavalue = 2;
        fixture.detectChanges();
        expect(
            fixture.debugElement.queryAll(By.css("label.active")).length
        ).toBeTruthy();
        wmComponent.datavalue = 5;
        fixture.detectChanges();
        expect(
            fixture.debugElement.queryAll(By.css("label.active")).length
        ).toBeTruthy();
    });
    it("should set the caption as per datavalue", () => {
        wmComponent.datavalue = 5;
        fixture.detectChanges();
        expect(
            fixture.debugElement.query(By.css("label.caption")).nativeElement
                .textContent
        ).toBe(wmComponent.datavalue.toString());
    });
    it("should set the datavalue on click", () => {
        const testVal = 2;
        expect(
            !!fixture.debugElement.queryAll(By.css("label.active")).length
        ).toBeFalsy();
        testElement = fixture.debugElement
            .queryAll(By.css("label"))
            [testVal + 1].query(By.css("input"));
        testElement.triggerEventHandler("click", null);
        fixture.detectChanges();
        expect(
            fixture.debugElement.queryAll(By.css("label.active")).length
        ).toBe(testVal);
    });
    it("should call MouseOver event listener", () => {
        jest.spyOn(wmComponent, "onMouseOver");
        testElement.nativeElement.dispatchEvent(new MouseEvent("mouseover"));
        expect(wmComponent.onMouseOver).toHaveBeenCalled();
    });
    it('should set "rating-label-hover" class on mouseover', () => {
        testElement.nativeElement.dispatchEvent(new MouseEvent("mouseover"));
        expect(testElement.nativeElement.classList.length).toBe(1);
        expect(testElement.nativeElement.classList[0]).toBe(
            "rating-label-hover"
        );
    });
    it('should call TouchStart event listener',()=>{
        const onTouchStartSpy = jest.spyOn(wmComponent,"onTouchStart");
        testElement.nativeElement.dispatchEvent(new Event("touchstart"));
        expect(onTouchStartSpy).toHaveBeenCalled();
    });
    it('should not set "rating-label-hover" class on mouseover for touch enabled devices',()=>{
        testElement.nativeElement.dispatchEvent(new Event("touchstart"));
        testElement.nativeElement.dispatchEvent(new MouseEvent("mouseover"));
        expect(testElement.nativeElement.classList.length).toBe(0);
    });
});
