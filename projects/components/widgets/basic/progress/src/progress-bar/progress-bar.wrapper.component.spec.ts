import { Component, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { App } from "@wm/core";
import { ProgressBarComponent } from "./progress-bar.component";
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../../base/src/test/common-widget.specs";
import { compileTestComponent, mockApp } from "projects/components/base/src/test/util/component-test-util";
import { ComponentFixture, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideAsWidgetRef } from "@wm/components/base";
import { getDecimalCount } from "../utils";


const markup = `<div wmProgressBar name="progress_bar1" hint="Progress bar" tabindex="1">`;

@Component({
    template: markup
})
class ProgressBarWrapperComponent {
    @ViewChild(ProgressBarComponent, { static: true }) wmComponent: ProgressBarComponent;
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule],
    declarations: [ProgressBarWrapperComponent, ProgressBarComponent],
    providers: [
        { provide: App, useValue: mockApp },
        provideAsWidgetRef(ProgressBarComponent)
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-progress-bar',
    widgetSelector: '[wmProgressBar]',
    testModuleDef: testModuleDef,
    testComponent: ProgressBarWrapperComponent,
    inputElementSelector: 'div.progress-bar'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();

describe('ProgressBar component', () => {
    let wrapperComponent: ProgressBarWrapperComponent;
    let progressBarComponent: ProgressBarComponent;
    let fixture: ComponentFixture<ProgressBarWrapperComponent>;

    beforeEach(waitForAsync(() => {
        fixture = compileTestComponent(testModuleDef, ProgressBarWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        progressBarComponent = wrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create progress bar component', () => {
        expect(wrapperComponent).toBeTruthy();
    });

    it('should initialize with default properties', () => {
        expect(progressBarComponent.displayformat).toBeUndefined();
        expect(progressBarComponent.datavalue).toBeUndefined();
        expect(progressBarComponent.minvalue).toBe(0);
        expect(progressBarComponent.maxvalue).toBe(100);
        expect(progressBarComponent.type).toBe("default");
        expect(progressBarComponent.dataset).toBeUndefined();
        expect(progressBarComponent.hint).toBe("Progress bar");
        expect(progressBarComponent.data.length).toBe(1);
        expect(progressBarComponent.data[0].cls).toBe('');
        expect(progressBarComponent.data[0].progressBarWidth).toBe(0);
        expect(progressBarComponent.data[0].displayValue).toBe("0");
    });
    it('should apply the correct class for type', () => {
        progressBarComponent.type = 'success';
        progressBarComponent.onPropertyChange('type', 'success');
        fixture.detectChanges();
        expect(progressBarComponent.data[0].cls).toBe('progress-bar-success');
    });

    it('should handle hint attribute correctly', () => {
        progressBarComponent.hint = 'Custom progress bar';
        fixture.detectChanges();
        const progressBarElement = fixture.debugElement.query(By.css('div.progress-bar')).nativeElement;
        expect(progressBarElement.getAttribute('aria-label')).toBe('Custom progress bar');
    });
});
