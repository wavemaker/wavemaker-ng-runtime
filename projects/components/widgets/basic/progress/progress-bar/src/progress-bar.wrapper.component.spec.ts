import { Component, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { App } from "@wm/core";
import { ProgressBarComponent } from "./progress-bar.component";
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../../base/src/test/common-widget.specs";
import { compileTestComponent, mockApp } from "projects/components/base/src/test/util/component-test-util";
import { ComponentFixture, fakeAsync, tick, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideAsWidgetRef } from "@wm/components/base";

const markup = `<div wmProgressBar name="progress_bar1" hint="Progress bar" arialabel="Progress bar" tabindex="0"></div>`;

@Component({
    template: markup
})
class ProgressBarWrapperComponent {
    @ViewChild(ProgressBarComponent, { static: false }) wmComponent: ProgressBarComponent;
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule, ProgressBarComponent,
        ProgressBarWrapperComponent],
    declarations: [],
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

    it('should handle arialabel attribute correctly', () => {
        progressBarComponent.arialabel = 'Custom progress bar';
        fixture.detectChanges();
        const progressBarElement = fixture.debugElement.query(By.css('div.progress-bar')).nativeElement;
        expect(progressBarElement.getAttribute('aria-label')).toBe('Custom progress bar');
    });

    describe('prepareData', () => {
        it('should handle dataset correctly', fakeAsync(() => {
            progressBarComponent.dataset = [
                { value: 25, type: 'info' },
                { value: 75, type: 'success' }
            ];
            progressBarComponent.datavalue = 'value';
            progressBarComponent.type = 'type';
            progressBarComponent.displayformat = '9.99';

            progressBarComponent['prepareData']();
            tick(50); // Account for debounce

            expect(progressBarComponent.data.length).toBe(2);
            expect(progressBarComponent.data[0]).toEqual({
                cls: 'progress-bar-info',
                progressBarWidth: '25%',
                displayValue: '25.00'
            });
            expect(progressBarComponent.data[1]).toEqual({
                cls: 'progress-bar-success',
                progressBarWidth: '75%',
                displayValue: '75.00'
            });
        }));

        it('should handle percentage datavalue without dataset', fakeAsync(() => {
            progressBarComponent.datavalue = '60%';
            progressBarComponent.type = 'warning';

            progressBarComponent['prepareData']();
            tick(50);

            expect(progressBarComponent.data.length).toBe(1);
            expect(progressBarComponent.data[0]).toEqual({
                cls: 'progress-bar-warning',
                progressBarWidth: '60%',
                displayValue: '60'
            });
        }));

        it('should calculate percentage based on min and max values', fakeAsync(() => {
            progressBarComponent.datavalue = '75';
            progressBarComponent.minvalue = 50;
            progressBarComponent.maxvalue = 150;
            progressBarComponent.type = 'default';

            progressBarComponent['prepareData']();
            tick(50);

            expect(progressBarComponent.data.length).toBe(1);
            expect(progressBarComponent.data[0]).toEqual({
                cls: '',
                progressBarWidth: '25%',
                displayValue: '25'
            });
        }));

        it('should handle undefined datavalue', fakeAsync(() => {
            progressBarComponent.datavalue = undefined;
            progressBarComponent.type = 'default';

            progressBarComponent['prepareData']();
            tick(50);

            expect(progressBarComponent.data.length).toBe(1);
            expect(progressBarComponent.data[0]).toEqual({
                cls: '',
                progressBarWidth: 0,
                displayValue: '0'
            });
        }));

        it('should format display value according to displayformat', fakeAsync(() => {
            progressBarComponent.datavalue = '75.5678';
            progressBarComponent.displayformat = '9.99%';
            progressBarComponent.type = 'default';

            progressBarComponent['prepareData']();
            tick(50);

            expect(progressBarComponent.data.length).toBe(1);
            expect(progressBarComponent.data[0].displayValue).toBe('75.57%');
        }));
    });
});
