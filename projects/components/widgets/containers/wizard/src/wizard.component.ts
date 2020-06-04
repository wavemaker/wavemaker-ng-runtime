import { AfterContentInit, AfterViewInit, Component, ContentChildren, Injector, OnInit, QueryList } from '@angular/core';

import { noop } from '@wm/core';
import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, styler, StylableComponent } from '@wm/components/base';

import { registerProps } from './wizard.props';
import { WizardStepDirective } from './wizard-step/wizard-step.directive';

const DEFAULT_CLS = 'app-wizard panel clearfix';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-wizard',
    hostClass: DEFAULT_CLS
};

@Component({
    selector: 'div[wmWizard]',
    templateUrl: './wizard.component.html',
    providers: [
        provideAsWidgetRef(WizardComponent)
    ]
})
export class WizardComponent extends StylableComponent implements OnInit, AfterContentInit, AfterViewInit {
    static initializeProps = registerProps();

    @ContentChildren(WizardStepDirective) steps: QueryList<WizardStepDirective>;

    public message: {caption: string, type: string};
    public currentStep: WizardStepDirective;

    public stepClass: string;
    public class;
    private readonly promiseResolverFn: Function;
    public actionsalignment: any;
    public cancelable: any;

    get hasPrevStep(): boolean {
        return !this.isFirstStep(this.currentStep);
    }

    get hasNextStep(): boolean {
        return !this.isLastStep(this.currentStep);
    }

    get showDoneBtn(): boolean {
        if (!this.currentStep) {
            return;
        }
        return !this.hasNextStep && this.currentStep.enableDone;
    }

    get enablePrev(): boolean {
        if (!this.currentStep) {
            return;
        }
        return this.currentStep.enablePrev;
    }

    get enableNext(): boolean {
        if (!this.currentStep) {
            return;
        }
        return this.currentStep.enableNext && this.currentStep.isValid;
    }

    get enableDone(): boolean {
        if (!this.currentStep) {
            return;
        }
        return this.currentStep.enableDone && this.currentStep.isValid;
    }

    constructor(inj: Injector) {
        let resolveFn: Function = noop;

        super(inj, WIDGET_CONFIG, new Promise(res => resolveFn = res));
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SHELL);

        this.promiseResolverFn = resolveFn;

        // initialize the message object with default values
        this.message = {
            caption: '',
            type: ''
        };
    }

    /**
     * returns next valid step. the index passed is also checked if its valid step
     * @param index
     * @returns {WizardStepDirective}
     */
    private getNextValidStepFormIndex(index: number): WizardStepDirective {
        for (let i = index; i < this.steps.length; i++) {
            const step = this.getStepRefByIndex(i);
            if (step.show) {
                return step;
            }
        }
    }

    /**
     * returns previous valid step. the index passed is also checked if its valid step
     * @param index
     * @returns {WizardStepDirective}
     */
    private getPreviousValidStepFormIndex(index: number): WizardStepDirective {
        for (let i = index; i >= 0; i--) {
            const step = this.getStepRefByIndex(i);
            if (step.show) {
                return step;
            }
        }
    }

    /**
     * returns current step index value.
     * @returns {number}
     */
    private getCurrentStepIndex(): number {
        return this.getStepIndexByRef(this.currentStep);
    }

    /**
     * returns stepRef when index is passed.
     * @param {number} index
     * @returns {WizardStepDirective}
     */
    private getStepRefByIndex(index: number): WizardStepDirective {
        return this.steps.toArray()[index];
    }

    /**
     * returns the index value of the step.
     * @param {WizardStepDirective} wizardStep
     * @returns {number}
     */
    private getStepIndexByRef(wizardStep: WizardStepDirective): number {
        return this.steps.toArray().indexOf(wizardStep);
    }

    /**
     * gets stepRef by searching on the name property.
     * @param {string} name
     * @returns {WizardStepDirective}
     */
    private getStepRefByName(name: string): WizardStepDirective {
        return this.steps.find(step => step.name === name);
    }

    /**
     * sets default step as current step if configured
     * or finds first valid step and set it as current step.
     * @param {WizardStepDirective} step
     */
    private setDefaultStep(step: WizardStepDirective) {
        // If the default step has show true then only update the currentStep
        if (step && step.show) {
            this.currentStep = step;
            step.active = true;
            step.isInitialized = true;
            // Mark all previous step status COMPLETED
            let index = this.getStepIndexByRef(step) - 1;
            while (index >= 0) {
                const prevStep = this.getStepRefByIndex(index);
                prevStep.done = true;
                prevStep.isInitialized = true;
                index--;
            }
        } else {
            // set next valid step as current step
            step = this.getNextValidStepFormIndex(0);
            if (step) {
                this.setDefaultStep(step);
            }
        }
    }

    /**
     * Selects the associated step when the wizard header is clicked.
     * @param $event
     * @param {WizardStepDirective} currentStep
     */
    private onWizardHeaderClick($event: Event, currentStep: WizardStepDirective) {
        // select the step if it's status is done
        if (currentStep.done) {
            // set all the next steps status as disabled and previous steps as done
            this.steps.forEach((step, index) => {
                if (index < this.getStepIndexByRef(currentStep)) {
                   step.done = true;
                   step.isDone = true;
                } else {
                    step.disabled = true;
                    step.isDone = false;
                }
            });
            // set the selected step as current step and make it active
            this.currentStep = currentStep;
            this.currentStep.active = true;
        }
    }

    // Method to navigate to next step
    public next(eventName: string = 'next') {
        const currentStep = this.currentStep;
        const currentStepIndex = this.getCurrentStepIndex();

        let nextStep: WizardStepDirective;

        // abort if onSkip method returns false
        if (eventName === 'skip') {
            if (currentStep.onSkip(currentStepIndex) === false) {
                return;
            }
        } else if (eventName === 'next') {
            if (currentStep.onNext(currentStepIndex) === false) {
                return;
            }
        }
        nextStep = this.getNextValidStepFormIndex(currentStepIndex + 1);
        nextStep.isInitialized = true;

        // If there are any steps which has show then only change state of current step else remain same
        if (nextStep) {
            currentStep.isDone = true;
            currentStep.done = true;
            nextStep.active = true;
            this.currentStep = nextStep;
        }
    }
    // Method to navigate to previous step
    public prev() {
        const currentStep = this.currentStep;
        const currentStepIndex = this.getCurrentStepIndex();

        let prevStep: WizardStepDirective;

        // abort if onPrev method returns false.
        if (currentStep.onPrev(currentStepIndex) === false) {
            return;
        }

        prevStep = this.getPreviousValidStepFormIndex(currentStepIndex - 1);

        // If there are any steps which has show then only change state of current step else remain same
        if (prevStep) {
            currentStep.isDone = false;
            currentStep.disabled = true;
            prevStep.active = true;
            this.currentStep = prevStep;
        }
    }

    public skip() {
        this.next('skip');
    }

    // Method to invoke on-Done event on wizard
    public done() {
        this.currentStep.isDone = true;
        this.invokeEventCallback('done', {steps: this.steps.toArray()});
    }
    // Method to invoke on-Cancel event on wizard
    public cancel () {
        this.invokeEventCallback('cancel', {steps: this.steps.toArray()});
    }

    private isFirstStep(stepRef: WizardStepDirective) {
        return this.steps.first === stepRef;
    }

    private isLastStep(stepRef: WizardStepDirective) {
        return this.steps.last === stepRef;
    }

    // Define the property change handler. This Method will be triggered when there is a change in the widget property
    onPropertyChange(key: string, nv: any, ov?: any) {
        // Monitoring changes for properties and accordingly handling respective changes

        if (key === 'stepstyle') {
            this.stepClass =  nv === 'justified' ? 'nav-justified' : '';
        } else if (key === 'defaultstep') {
            this.setDefaultStep(this.getStepRefByName(nv));
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    ngAfterContentInit() {
        super.ngAfterContentInit();
        this.promiseResolverFn();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(
            this.nativeElement.querySelector('.panel-body') as HTMLElement,
            this,
            APPLY_STYLES_TYPE.INNER_SHELL
        );
    }
}
