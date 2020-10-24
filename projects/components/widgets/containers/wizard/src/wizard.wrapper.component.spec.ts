import { Component, ViewChild } from '@angular/core';
import { WizardComponent } from './wizard.component';
import { WizardStepDirective } from './wizard-step/wizard-step.directive';
import { WmComponentsModule } from '@wm/components/base';
import { FormsModule } from '@angular/forms';
import { async, ComponentFixture } from '@angular/core/testing';
import { compileTestComponent } from '../../../../base/src/test/util/component-test-util';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import { App } from '@wm/core';

const mockApp = {};

const markup = `
        <div wmWizard role="tablist" stepstyle="justified" name="wizard1" class="classic" show="true" width="800" height="200"
                cancel.event="wizard1Cancel(widget, steps)">
                fontsize="20" fontfamily="Segoe UI" color="#0000FF" fontweight="700" fontstyle="italic"
                backgroundcolor="#00ff29" backgroundimage="http://www.google.com/doodle4google/images/splashes/featured.png"
                backgroundrepeat="repeat" backgroundposition="left" backgroundsize="200px 200px" backgroundattachment="fixed"
                bordercolor="#d92953" borderstyle="solid" borderwidth="3px 4px 5px 6px"
                padding="3px 4px 5px 6px" overflow="auto"
            <form wmWizardStep #wizard_step_id_1="wmWizardStep" name="wizardstep1" iconclass="wi wi-radio-button-checked"
                next.event="wizardstep1Next(widget, currentStep, stepIndex)" skip.event="wizardstep1Skip(widget, currentStep, stepIndex)">
                <ng-template [ngIf]="wizard_step_id_1.isInitialized"></ng-template>
            </form>
            <form wmWizardStep #wizard_step_id_2="wmWizardStep" name="wizardstep2" load.event="wizardstep2Load(widget, stepIndex)" prev.event="wizardstep2Prev(widget, currentStep, stepIndex)">
                <ng-template [ngIf]="wizard_step_id_2.isInitialized"></ng-template>
            </form>
            <form wmWizardStep #wizard_step_id_3="wmWizardStep" name="wizardstep3">
                <ng-template [ngIf]="wizard_step_id_3.isInitialized"></ng-template>
            </form>
        </div>
    `;

@Component({
    template: markup
})
class WizardWrapperComponent {
    @ViewChild(WizardComponent, /* TODO: add static flag */ {static: true}) wmComponent: WizardComponent;
    public wizardstep1Next(widget, currentStep, stepIndex) {
        console.log('calling on next');
    }

    public wizardstep2Load(widget, stepIndex) {
        console.log('calling on load for step2');
    }
    public wizard1Cancel(widget, steps) {
        console.log('cancelled step');
    }
}
const testModuleDef: ITestModuleDef = {
    imports: [
        FormsModule,
        WmComponentsModule.forRoot(),
    ],
    declarations: [WizardWrapperComponent, WizardComponent, WizardStepDirective],
    providers: [
        { provide: App, useValue: mockApp },
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-wizard',
    widgetSelector: '[wmWizard]',
    testModuleDef: testModuleDef,
    testComponent: WizardWrapperComponent
};

// const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
// TestBase.verifyPropsInitialization();
// TestBase.verifyCommonProperties();
// TestBase.verifyStyles();

describe('wm-wizard: Component Specific Tests', () => {
    let wrapperComponent: WizardWrapperComponent;
    let wmComponent: WizardComponent;
    let fixture: ComponentFixture<WizardWrapperComponent>;
    beforeEach(async(() => {
        fixture = compileTestComponent(testModuleDef, WizardWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        wmComponent = wrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create wizard component', () => {
        expect(wrapperComponent).toBeTruthy();
    });

    it('should have correct param values in onNext/onLoad callback event',  async (done) => {
        const frstStepRef = wmComponent.getWidget().getStepRefByIndex(0);
        const secondStepRef = wmComponent.getWidget().getStepRefByIndex(1);
        fixture.whenStable().then(() => {
            spyOn(frstStepRef, 'invokeEventCallback');
            wmComponent.next();
            fixture.detectChanges();
            expect(frstStepRef.invokeEventCallback).toHaveBeenCalledTimes(1);
            expect(frstStepRef.invokeEventCallback).toHaveBeenCalledWith('next', {currentStep: frstStepRef, stepIndex: 0});

            spyOn(secondStepRef, 'invokeEventCallback');
            // We have setTimeout in wizardstep directive redraw chilsdren method So adding same here.
            setTimeout(() => {
                expect(secondStepRef.invokeEventCallback).toHaveBeenCalledTimes(1);
                expect(secondStepRef.invokeEventCallback).toHaveBeenCalledWith('load', {stepIndex: 1});
                done();
            }, 100);
        });
    });

    it('should have correct param values in onPrev callback event',  async () => {
        const secondStepRef = wmComponent.getWidget().getStepRefByIndex(1);
        fixture.whenStable().then(() => {
            spyOn(secondStepRef, 'invokeEventCallback');
            wmComponent.next();
            fixture.detectChanges();
            wmComponent.prev();
            fixture.detectChanges();
            expect(secondStepRef.invokeEventCallback).toHaveBeenCalledWith('prev', {currentStep: secondStepRef, stepIndex: 1});
        });
    });

    it('should have correct param values in onSkip callback event',  async () => {
        const frstStepRef = wmComponent.getWidget().getStepRefByIndex(0);
        fixture.whenStable().then(() => {
            frstStepRef.setProperty('enableskip', true);
            spyOn(frstStepRef, 'invokeEventCallback');
            wmComponent.skip();
            fixture.detectChanges();
            expect(frstStepRef.invokeEventCallback).toHaveBeenCalledWith('skip', {currentStep: frstStepRef, stepIndex: 0});
        });
    });

});
