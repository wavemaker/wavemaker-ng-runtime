import { ComponentFixture, waitForAsync } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { CircleProgressComponent, CircleProgressOptions, CircleProgressOptionsInterface } from 'ng-circle-progress';
import { ProgressCircleComponent } from './progress-circle.component';
import { FormsModule } from '@angular/forms';
import { App } from '@wm/core';
import { provideAsWidgetRef } from '@wm/components/base';
import { By } from '@angular/platform-browser';
import { ITestModuleDef, ITestComponentDef, ComponentTestBase } from 'projects/components/base/src/test/common-widget.specs';
import { compileTestComponent, mockApp } from 'projects/components/base/src/test/util/component-test-util';
import * as utils from '../utils';  // Import the utils module

jest.mock('../utils');  // Mock the entire utils module

const markup = `<div wmProgressCircle title="progess-circle" [attr.aria-label]="'progess-circle'" name="progess-circle" hint="progess-circle" tabindex="1"></div>`;

@Component({
    template: markup
})
class ProgressCircleWrapperComponent {
    @ViewChild(ProgressCircleComponent, { static: true }) wmComponent: ProgressCircleComponent;
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule],
    declarations: [ProgressCircleWrapperComponent, ProgressCircleComponent, CircleProgressComponent],
    providers: [
        { provide: App, useValue: mockApp },
        provideAsWidgetRef(ProgressCircleComponent),
        { provide: CircleProgressOptions, useValue: CircleProgressOptions }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-progress-circle',
    widgetSelector: '[wmProgressCircle]',
    testModuleDef: testModuleDef,
    testComponent: ProgressCircleWrapperComponent,
    inputElementSelector: 'circle-progress'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();

describe('ProgressCircle component', () => {
    let wrapperComponent: ProgressCircleWrapperComponent;
    let progressCircleComponent: ProgressCircleComponent;
    let fixture: ComponentFixture<ProgressCircleWrapperComponent>;

    beforeEach(waitForAsync(() => {
        fixture = compileTestComponent(testModuleDef, ProgressCircleWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        progressCircleComponent = wrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create progress circle component', () => {
        expect(wrapperComponent).toBeTruthy();
    });

    it('should initialize with default options', () => {
        expect(progressCircleComponent.options).toBeDefined()
    });

    it('should update display format when caption placement changes', () => {
        progressCircleComponent.captionplacement = 'inside';
        progressCircleComponent.updateDisplayValueFormat();
        fixture.detectChanges();
        expect(progressCircleComponent.options.showTitle).toBeTruthy();
        expect(progressCircleComponent.options.showSubtitle).toBeFalsy();
    });

    it('should handle type changes correctly', () => {
        const element = fixture.debugElement.query(By.css('[wmProgressCircle]')).nativeElement;
        progressCircleComponent.type = 'success';
        progressCircleComponent.onPropertyChange('type', 'success', 'default');
        fixture.detectChanges();
        expect(element.classList.contains('progress-circle-success')).toBeTruthy();
    });

    it('should set percentagevalue directly when datavalue is a percentage', () => {
        // Mock the isPercentageValue function
        (utils.isPercentageValue as jest.Mock).mockReturnValue(true);

        // Set a percentage value
        const percentageValue = '75%';
        progressCircleComponent.datavalue = percentageValue;

        // Call onPropertyChange method
        progressCircleComponent.onPropertyChange('datavalue', percentageValue);

        // Check if percentagevalue is set correctly
        expect(progressCircleComponent.percentagevalue).toBe(75);

        // Verify that isPercentageValue was called
        expect(utils.isPercentageValue).toHaveBeenCalledWith(percentageValue);
    });

    it('should calculate percentagevalue when datavalue is not a percentage', () => {
        // Mock the isPercentageValue function
        (utils.isPercentageValue as jest.Mock).mockReturnValue(false);

        // Mock the calculatePercent function
        (utils.calculatePercent as jest.Mock).mockReturnValue(50);

        // Set a non-percentage value
        const dataValue = '500';
        progressCircleComponent.datavalue = dataValue;
        progressCircleComponent.minvalue = 0;
        progressCircleComponent.maxvalue = 1000;

        // Call onPropertyChange method
        progressCircleComponent.onPropertyChange('datavalue', dataValue);

        // Check if percentagevalue is calculated correctly
        expect(progressCircleComponent.percentagevalue).toBe(50);

        // Verify that isPercentageValue and calculatePercent were called
        expect(utils.isPercentageValue).toHaveBeenCalledWith(dataValue);
        expect(utils.calculatePercent).toHaveBeenCalledWith(500, 0, 1000);
    });

    describe('getDefaultOptions', () => {
        it('should return the options object', () => {
            const mockOptions: Partial<CircleProgressOptionsInterface> = {
                percent: 75,
                radius: 100,
                outerStrokeWidth: 16,
                innerStrokeWidth: 8,
                outerStrokeColor: "#78C000",
                innerStrokeColor: "#C7E596"
            };
            progressCircleComponent.options = mockOptions as CircleProgressOptionsInterface;
            expect(progressCircleComponent.getDefaultOptions()).toBe(mockOptions);
        });
    });

    describe('getLib', () => {
        it('should return the correct library name', () => {
            expect(progressCircleComponent.getLib()).toBe('ng-circle-progress');
        });
    });

    describe('overrideDefaults', () => {
        it('should override default options with provided options', () => {
            const initialOptions: Partial<CircleProgressOptionsInterface> = {
                percent: 75,
                radius: 100,
                outerStrokeWidth: 16,
                innerStrokeWidth: 8
            };
            const overrideOptions: Partial<CircleProgressOptionsInterface> = {
                radius: 120,
                outerStrokeColor: "#78C000",
                innerStrokeColor: "#C7E596"
            };
            progressCircleComponent.options = initialOptions as CircleProgressOptionsInterface;

            progressCircleComponent.overrideDefaults(overrideOptions as CircleProgressOptionsInterface);

            expect(progressCircleComponent.options).toEqual({
                percent: 75,
                radius: 120,
                outerStrokeWidth: 16,
                innerStrokeWidth: 8,
                outerStrokeColor: "#78C000",
                innerStrokeColor: "#C7E596"
            });
        });

        it('should not modify original options object if empty override is provided', () => {
            const initialOptions: Partial<CircleProgressOptionsInterface> = {
                percent: 75,
                radius: 100,
                outerStrokeWidth: 16,
                innerStrokeWidth: 8
            };
            progressCircleComponent.options = initialOptions as CircleProgressOptionsInterface;

            progressCircleComponent.overrideDefaults({} as CircleProgressOptionsInterface);

            expect(progressCircleComponent.options).toEqual(initialOptions);
        });
    });
});
