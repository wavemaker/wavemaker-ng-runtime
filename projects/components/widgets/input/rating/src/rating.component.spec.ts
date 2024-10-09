import { compileTestComponent, mockApp } from "../../../../base/src/test/util/component-test-util";
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
import { AbstractI18nService, App, AppDefaults } from '@wm/core';
import { MockAbstractI18nService } from '../../../../base/src/test/util/date-test-util';

const markup = `<div tabindex="1"  wmRating  name="rating1"></div>`;
@Component({
    template: markup
})
class TestComponent {
    @ViewChild(RatingComponent, /* TODO: add static flag */ { static: true }) wmComponent: RatingComponent;
}

const testModuleDef: ITestModuleDef = {
    declarations: [RatingComponent, TestComponent],
    imports: [FormsModule, ComponentsTestModule],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: AbstractI18nService, useClass: MockAbstractI18nService },
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
    it('should call TouchStart event listener', () => {
        const onTouchStartSpy = jest.spyOn(wmComponent, "onTouchStart");
        testElement.nativeElement.dispatchEvent(new Event("touchstart"));
        expect(onTouchStartSpy).toHaveBeenCalled();
    });
    it('should not set "rating-label-hover" class on mouseover for touch enabled devices', () => {
        testElement.nativeElement.dispatchEvent(new Event("touchstart"));
        testElement.nativeElement.dispatchEvent(new MouseEvent("mouseover"));
        expect(testElement.nativeElement.classList.length).toBe(0);
    });

    // New tests for onDatavalueChange
    describe('onDatavalueChange', () => {
        it('should update selectedRatingValue and caption when datasetItems contain selected item', () => {
            wmComponent.datasetItems = [
                { index: 1, label: 'Poor', selected: false, key: 1, value: 1 },
                { index: 2, label: 'Fair', selected: true, key: 2, value: 2 },
                { index: 3, label: 'Good', selected: false, key: 3, value: 3 }
            ];

            wmComponent.onDatavalueChange(2);

            expect(wmComponent.selectedRatingValue).toBe(2);
            expect(wmComponent.caption).toBe('Fair');
        });
        it('should update selectedRatingValue and caption when datavalue matches an item index', () => {
            wmComponent.datasetItems = [
                { index: 1, label: 'Poor', selected: false, key: 1, value: 1 },
                { index: 2, label: 'Fair', selected: false, key: 2, value: 2 },
                { index: 3, label: 'Good', selected: false, key: 3, value: 3 }
            ];
            wmComponent.onDatavalueChange('3');
            expect(wmComponent.selectedRatingValue).toBe(3);
            expect(wmComponent.caption).toBe('Good');
        });

        it('should reset model when no item is found', () => {
            wmComponent.datasetItems = [
                { index: 1, label: 'Poor', selected: false, key: 1, value: 1 },
                { index: 2, label: 'Fair', selected: false, key: 2, value: 2 },
            ];
            wmComponent.onDatavalueChange(3);
            expect(wmComponent.modelByKey).toBeUndefined();
            expect(wmComponent.caption).toBe('');
            expect(wmComponent.selectedRatingValue).toBe(0);
        });
        it('should handle readonly case with valid datavalue', () => {
            wmComponent.readonly = true;
            wmComponent.maxvalue = 5;
            wmComponent.onDatavalueChange(4);
            expect(wmComponent.selectedRatingValue).toBe(4);
            expect(wmComponent.ratingsWidth).toBe('3.7em');
        });
    });

    // New tests for calculateRatingsWidth
    describe('calculateRatingsWidth', () => {
        beforeEach(() => {
            wmComponent.maxvalue = 5;
        });

        it('should return 0 for undefined datavalue', () => {
            const result = wmComponent.calculateRatingsWidth();
            expect(result).toBe(0);
            expect(wmComponent.caption).toBe('');
        });

        it('should calculate correct width for valid rating', () => {
            wmComponent.selectedRatingValue = 3;
            const result = wmComponent.calculateRatingsWidth(3);
            expect(parseFloat(result as string)).toBeCloseTo(parseFloat('2.775em'));
        });

        it('should cap width at maxvalue when selected rating exceeds maxvalue', () => {
            wmComponent.selectedRatingValue = 7;
            const result = wmComponent.calculateRatingsWidth(7);
            expect(parseFloat(result as string)).toBe(parseFloat('4.625em')); // 5 (maxvalue) * 0.925 (starWidth)
        });

        it('should handle edge case when maxvalue is 0', () => {
            wmComponent.maxvalue = 0;
            wmComponent.selectedRatingValue = 0;
            const result = wmComponent.calculateRatingsWidth(0);
            expect(result).toBe(0);
        });
    });

    // New tests for onPropertyChange
    describe('onPropertyChange', () => {
        it('should calculate ratingsWidth when readonly is set to true', () => {
            jest.spyOn(wmComponent, 'calculateRatingsWidth').mockReturnValue('2.775em');

            wmComponent.onPropertyChange('readonly', true);

            expect(wmComponent.calculateRatingsWidth).toHaveBeenCalled();
            expect(wmComponent.ratingsWidth).toBe('2.775em');
        });

        it('should prepare rating dataset when maxvalue changes', () => {
            const componentSpy = jest.spyOn(wmComponent, 'onPropertyChange');
            wmComponent.onPropertyChange('maxvalue', 5);
            expect(componentSpy).toHaveBeenCalledWith('maxvalue', 5);
            expect(wmComponent.datasetItems.length).toBe(5)
            expect(wmComponent.datasetItems).toBeDefined(); // Assuming prepareRatingDataset populates datasetItems
            expect(wmComponent.selectedRatingValue).toBe(0); // Assuming resetDatasetItems resets the selectedRatingValue
        });
    });

    // New test for onMouseleave
    describe('onMouseleave', () => {
        it('should set caption to displayValue', () => {
            wmComponent.displayValue = 'Good';

            wmComponent.onMouseleave();

            expect(wmComponent.caption).toBe('Good');
        });
    });
    describe('handleEvent', () => {
        it('should not call super.handleEvent for "change" event', () => {
            const mockSuperHandleEvent = jest.spyOn(Object.getPrototypeOf(RatingComponent.prototype), 'handleEvent').mockImplementation();
            const mockNode = document.createElement('div');
            const mockCallback = jest.fn();
            const mockLocals = {};

            wmComponent['handleEvent'](mockNode, 'change', mockCallback, mockLocals);

            expect(mockSuperHandleEvent).not.toHaveBeenCalled();
        });

        it('should not call super.handleEvent for "blur" event', () => {
            const mockSuperHandleEvent = jest.spyOn(Object.getPrototypeOf(RatingComponent.prototype), 'handleEvent').mockImplementation();
            const mockNode = document.createElement('div');
            const mockCallback = jest.fn();
            const mockLocals = {};

            wmComponent['handleEvent'](mockNode, 'blur', mockCallback, mockLocals);

            expect(mockSuperHandleEvent).not.toHaveBeenCalled();
        });

        it('should call super.handleEvent for other events', () => {
            const mockSuperHandleEvent = jest.spyOn(Object.getPrototypeOf(RatingComponent.prototype), 'handleEvent').mockImplementation();
            const mockNode = document.createElement('div');
            const mockCallback = jest.fn();
            const mockLocals = {};

            wmComponent['handleEvent'](mockNode, 'click', mockCallback, mockLocals);

            expect(mockSuperHandleEvent).toHaveBeenCalledWith(wmComponent.ratingEl.nativeElement, 'click', mockCallback, mockLocals);
        });
    });

    describe('onRatingClick', () => {
        it('should handle case when showcaptions is false', () => {
            wmComponent.showcaptions = false;
            const mockRate = { key: 2, index: 2, label: 'Fair' };
            jest.spyOn(wmComponent, 'invokeOnTouched');
            jest.spyOn(wmComponent, 'invokeOnChange');
            wmComponent.onRatingClick({}, mockRate);
            expect(wmComponent.caption).toBe(mockRate.label);
        });
    });
});