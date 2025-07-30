import { Component, ViewChild } from '@angular/core';
import { WizardComponent } from './wizard.component';
import { FormsModule } from '@angular/forms';
import { waitForAsync, ComponentFixture } from '@angular/core/testing';
import { compileTestComponent, mockApp } from '../../../../base/src/test/util/component-test-util';
import { ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import {App, DynamicComponentRefProvider} from '@wm/core';
import { WizardStepComponent } from "./wizard-step/wizard-step.component";
import { TextContentDirective } from '@wm/components/base';

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
    @ViewChild(WizardComponent, /* TODO: add static flag */ { static: true }) wmComponent: WizardComponent;
    public wizardstep1Next(widget, currentStep, stepIndex) {
        // console.log('calling on next');
    }

    public wizardstep2Load(widget, stepIndex) {
        // console.log('calling on load for step2');
    }
    public wizard1Cancel(widget, steps) {
        // console.log('cancelled step');
    }
}
const testModuleDef: ITestModuleDef = {
    imports: [
        FormsModule, TextContentDirective,
        WizardComponent, WizardStepComponent
    ],
    declarations: [WizardWrapperComponent],
    providers: [
        { provide: App, useValue: mockApp },
        DynamicComponentRefProvider
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
    beforeEach(waitForAsync(() => {
        fixture = compileTestComponent(testModuleDef, WizardWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        wmComponent = wrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create wizard component', () => {
        expect(wrapperComponent).toBeTruthy();
    });

    it('should have correct param values in onNext/onLoad callback event', async () => {
        const frstStepRef = wmComponent.getWidget().getStepRefByIndex(0);
        const secondStepRef = wmComponent.getWidget().getStepRefByIndex(1);

        // Wait for the component to be stable
        await fixture.whenStable();

        // Spy on the invokeEventCallback method
        jest.spyOn(frstStepRef, 'invokeEventCallback');

        // Trigger the next step
        await wmComponent.next();
        fixture.detectChanges();

        // Assert that the invokeEventCallback was called correctly for the first step
        expect(frstStepRef.invokeEventCallback).toHaveBeenCalledTimes(1);
        expect(frstStepRef.invokeEventCallback).toHaveBeenCalledWith('next', { currentStep: frstStepRef, stepIndex: 0 });

        // Spy on the invokeEventCallback method for the second step
        jest.spyOn(secondStepRef, 'invokeEventCallback');

        // Use a Promise to handle the setTimeout delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Assert that the invokeEventCallback was called correctly for the second step
        expect(secondStepRef.invokeEventCallback).toHaveBeenCalledTimes(1);
        expect(secondStepRef.invokeEventCallback).toHaveBeenCalledWith('load', { stepIndex: 1 });
    });


    it('should have correct param values in onPrev callback event', async () => {
        const secondStepRef = wmComponent.getWidget().getStepRefByIndex(1);
        fixture.whenStable().then(() => {
            jest.spyOn(secondStepRef, 'invokeEventCallback');
            wmComponent.next();
            fixture.detectChanges();
            wmComponent.prev();
            fixture.detectChanges();
            expect(secondStepRef.invokeEventCallback).toHaveBeenCalledWith('prev', { currentStep: secondStepRef, stepIndex: 1 });
        });
    });

    it('should have correct param values in onSkip callback event', async () => {
        const frstStepRef = wmComponent.getWidget().getStepRefByIndex(0);
        fixture.whenStable().then(() => {
            frstStepRef.setProperty('enableskip', true);
            jest.spyOn(frstStepRef, 'invokeEventCallback');
            wmComponent.skip();
            fixture.detectChanges();
            expect(frstStepRef.invokeEventCallback).toHaveBeenCalledWith('skip', { currentStep: frstStepRef, stepIndex: 0 });
        });
    });

    it('should call next() with "skip" when skip() is called', () => {
        jest.spyOn(wmComponent, 'next');
        wmComponent.skip();
        expect(wmComponent.next).toHaveBeenCalledWith('skip');
    });

    it('should set isDone to true and invoke "done" event when done() is called', () => {
        const mockSteps = [{ isDone: false }, { isDone: false }];
        wmComponent['steps'] = { toArray: () => mockSteps } as any;
        wmComponent.currentStep = mockSteps[0] as any;
        jest.spyOn(wmComponent, 'invokeEventCallback');

        wmComponent.done();

        expect(wmComponent.currentStep.isDone).toBe(true);
        expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('done', { steps: mockSteps });
    });

    it('should invoke "cancel" event with steps when cancel() is called', () => {
        const mockSteps = [{ isDone: false }, { isDone: false }];
        wmComponent['steps'] = { toArray: () => mockSteps } as any;
        jest.spyOn(wmComponent, 'invokeEventCallback');

        wmComponent.cancel();

        expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('cancel', { steps: mockSteps });
    });



    describe('readMoreSubtitle', () => {

        beforeEach(waitForAsync(() => {

            // Mock jQuery
            (global as any).$ = jest.fn().mockImplementation((selector) => ({
                addClass: jest.fn(),
                removeClass: jest.fn(),
                css: jest.fn(),
                is: jest.fn(),
                has: jest.fn().mockReturnValue({ length: 0 }),
            }));
            ((global as any).$ as any).fn = {};
            ((global as any).$ as any).fn.on = jest.fn();
            ((global as any).$ as any).fn.off = jest.fn();
        }));

        // ... (previous tests remain the same)

        it('should handle readMoreSubtitle correctly', () => {
            const mockCurrentSubtitle = {
                addClass: jest.fn(),
                removeClass: jest.fn(),
            };
            const mockReadMore = {
                css: jest.fn(),
            };
            const mockDocument = {
                on: jest.fn(),
                off: jest.fn(),
            };

            // Mock jQuery selections
            ((global as any).$ as jest.Mock).mockImplementation((selector) => {
                if (selector === '.current .subtitle-wrapper') return mockCurrentSubtitle;
                if (selector === '.current .read_more') return mockReadMore;
                if (selector === document) return mockDocument;
                return { is: jest.fn(), has: jest.fn().mockReturnValue({ length: 0 }) };
            });

            wmComponent.readMoreSubtitle();

            // Check if classes and styles are applied correctly
            expect(mockCurrentSubtitle.addClass).toHaveBeenCalledWith('readmore_subtitle');
            expect(mockReadMore.css).toHaveBeenCalledWith('display', 'none');

            // Simulate a mouseup event outside the container
            const mouseupHandler = mockDocument.on.mock.calls[0][1];
            mouseupHandler({ target: document.body });

            // Check if classes and styles are removed correctly
            expect(mockCurrentSubtitle.removeClass).toHaveBeenCalledWith('readmore_subtitle');
            expect(mockReadMore.css).toHaveBeenCalledWith('display', 'block');
            expect(mockDocument.off).toHaveBeenCalledWith('mouseup');
        });
    });


});
