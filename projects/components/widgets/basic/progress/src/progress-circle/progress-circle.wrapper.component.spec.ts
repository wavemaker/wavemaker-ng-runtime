import { ComponentFixture, waitForAsync } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { CircleProgressComponent, CircleProgressOptions } from 'ng-circle-progress';
import { ProgressCircleComponent } from './progress-circle.component';
import { FormsModule } from '@angular/forms';
import { App } from '@wm/core';
import { provideAsWidgetRef } from '@wm/components/base';
import { By } from '@angular/platform-browser';
import { ITestModuleDef, ITestComponentDef, ComponentTestBase } from 'projects/components/base/src/test/common-widget.specs';
import { compileTestComponent, mockApp } from 'projects/components/base/src/test/util/component-test-util';

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

    it('should update percentagevalue when datavalue changes', () => {
        progressCircleComponent.minvalue = 0;
        progressCircleComponent.maxvalue = 100;
        progressCircleComponent.datavalue = '50';
        progressCircleComponent.onPropertyChange('datavalue', '50');
        fixture.detectChanges();
        expect(progressCircleComponent.percentagevalue).toBe(50);
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
});
