import { CommonModule } from '@angular/common';
import { WmComponentsModule } from "@wm/components/base";
import {
    AfterContentInit,
    AfterViewInit,
    Component,
    ContentChild,
    ContentChildren,
    Inject,
    Injector,
    OnInit,
    Optional,
    QueryList,
    Self,
    TemplateRef
} from '@angular/core';

import {noop} from '@wm/core';
import {
    APPLY_STYLES_TYPE,
    IWidgetConfig,
    provideAsWidgetRef,
    styler,
    StylableComponent,
    Context
} from '@wm/components/base';

import { registerProps } from './wizard.props';
import { WizardStepDirective } from './wizard-step/wizard-step.directive';

const DEFAULT_CLS = 'app-wizard panel clearfix';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-wizard',
    hostClass: DEFAULT_CLS
};

@Component({
  standalone: true,
  imports: [CommonModule, WmComponentsModule],
    selector: 'div[wmWizard]',
    templateUrl: './wizard.component.html',
    providers: [
        provideAsWidgetRef(WizardComponent),
        {provide: Context, useFactory: () => { return {} }, multi: true}
    ]
})
export class WizardComponent extends StylableComponent implements OnInit, AfterContentInit, AfterViewInit {
    static initializeProps = registerProps();

    @ContentChildren(WizardStepDirective) steps: QueryList<WizardStepDirective>;
    @ContentChild('wizardAction', { read: TemplateRef, descendants: false }) wizardAction: TemplateRef<any>;

    public message: {caption: string, type: string};
    public currentStep: WizardStepDirective;

    public stepClass: string;
    public class;
    public name;
    private readonly promiseResolverFn: Function;
    public actionsalignment: any;
    public cancelable: any;
    public enablenext: any;
    public wizContext: any;
    public cancelbtnlabel: any;
    public donebtnlabel: any;
    public previousbtnlabel: any;
    public nextbtnlabel: any;

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
        return this.enablenext ? true : (this.currentStep.enableNext && this.currentStep.isValid);
    }

    get enableDone(): boolean {
        if (!this.currentStep) {
            return;
        }
        return this.currentStep.enableDone && this.currentStep.isValid;
    }

    constructor(inj: Injector, @Self() @Inject(Context) contexts: Array<any>, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        let resolveFn: Function = noop;

        super(inj, WIDGET_CONFIG, explicitContext, new Promise(res => resolveFn = res));
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SHELL);

        this.promiseResolverFn = resolveFn;

        // initialize the message object with default values
        this.message = {
            caption: '',
            type: ''
        };
        this.wizContext = contexts[0];
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
        this.addMoreText();
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
            this.addMoreText();
        }
    }

    // Method to navigate to next step
    public async next(eventName: string = 'next') {
        const currentStep = this.currentStep;
        const currentStepIndex = this.getCurrentStepIndex();

        // abort if onSkip method returns false
        if (eventName === 'skip') {
            const response = await currentStep.invokeSkipCB(currentStepIndex);
            if (response === false) {
                return;
            }
            this.extendNextFn(currentStep, currentStepIndex);
        } else if (this.currentStep.isValid && eventName === 'next') {
            const response  = await currentStep.invokeNextCB(currentStepIndex);
            if (response === false) {
                return;
            }
            this.extendNextFn(currentStep, currentStepIndex);
        } else if (this.enablenext && !this.currentStep.isValid){
            Array.from((<any>this).currentStep.getAllEmbeddedForms())?.forEach((form:any) => {
                form.widget.highlightInvalidFields();
            });
        }
    }

    extendNextFn(currentStep, currentStepIndex){
        let nextStep: WizardStepDirective;
        nextStep = this.getNextValidStepFormIndex(currentStepIndex + 1);
        nextStep.isInitialized = true;

        // If there are any steps which has show then only change state of current step else remain same
        if (nextStep) {
            currentStep.isDone = true;
            currentStep.done = true;
            nextStep.active = true;
            this.currentStep = nextStep;
        }
        this.addMoreText();
    }
    // Method to navigate to previous step
    public async prev() {
        const currentStep = this.currentStep;
        const currentStepIndex = this.getCurrentStepIndex();

        let prevStep: WizardStepDirective;

        // abort if onPrev method returns false.
        const response = await currentStep.invokePrevCB(currentStepIndex);
        if (response === false) {
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
        this.addMoreText();
    }

    public skip() {
        this.next('skip');
    }

    public gotoStep(stepName: string) {
        if(stepName) {
            const gotoStepIndex = this.steps.toArray().map(step => step.name).indexOf(stepName);
            if(gotoStepIndex !== -1) {
                const gotoStep: WizardStepDirective = this.getStepRefByIndex(gotoStepIndex);
                if(gotoStep?.show) {
                    this.onWizardHeaderClick(event, gotoStep);
                } else {
                    console.error("The gotoStep function cannot navigate to hidden steps");
                }
            } else {
                console.error(`Could not find step '${stepName}'`);
            }
        }
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
    public addMoreText(){
        setTimeout(() => {


        var newWindowWidth = $(window).width();
        if(newWindowWidth < 768){
        $(".app-wizard-step.current .subtitle-wrapper .step-title").css({"height":"auto","display":"block"});
        var subtitleTextLength = $(".app-wizard-step.current .subtitle-wrapper .step-title").height();
        $(".read_more").css("display","none");
        $(".current .subtitle-wrapper").removeClass("readmore_subtitle");

        if(subtitleTextLength>44){
            $(".app-wizard-step.current .subtitle-wrapper .step-title").css({"height":"44px","display":"-webkit-box"});
            $(".current .read_more").css("display","block");
            $(".active .read_more").css("display","none");
            $(".disable .read_more").css("display","none");
            $(".app-wizard-step>a").css("height","100px")
            }
        }
    });

    }
    public readMoreSubtitle(){
        $(".current .subtitle-wrapper").addClass("readmore_subtitle");
        $(".current .read_more").css("display","none");
        $(document).on("mouseup",function(e:any)
        {
            var container = $(".subtitle-wrapper");
            // if the target of the click isn't the container nor a descendant of the container
            if (!container.is(e.target) && container.has(e.target).length === 0)
            {
                $(".current .subtitle-wrapper").removeClass("readmore_subtitle");
                $(".current .read_more").css("display","block");
                $(document).off("mouseup");
            }
        });
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
        } else if (key === 'actionsalignment') {
            this.nativeElement.querySelector('div.app-wizard-actions')?.classList.replace(ov, nv);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    ngAfterContentInit() {
        super.ngAfterContentInit();
        this.promiseResolverFn();
        this.wizContext.hasNextStep = () => this.hasNextStep;
        this.wizContext.hasPreviousStep = () => this.hasPrevStep;
        this.wizContext.hasNoNextStep = () => this.showDoneBtn;
        this.wizContext.cancelable = () => this.cancelable;
        this.wizContext.skippable = () => this.currentStep?.enableskip;
        this.wizContext.next = () => this.next();
        this.wizContext.previous = () => this.prev();
        this.wizContext.done = () => this.done();
        this.wizContext.cancel = () => this.cancel();
        this.wizContext.skip = () => this.skip();
        this.wizContext.nextbtnlabel = () => this.nextbtnlabel;
        this.wizContext.previousbtnlabel = () => this.previousbtnlabel;
        this.wizContext.donebtnlabel = () => this.donebtnlabel;
        this.wizContext.cancelbtnlabel = () => this.cancelbtnlabel;
        this.wizContext.actionsalignment = () => this.actionsalignment;
        this.wizContext.disableNext = () => !this.enableNext;
        this.wizContext.disablePrevious = () => !this.enablePrev;
        this.wizContext.disableDone = () => !this.enableDone;
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(
            this.nativeElement.querySelector('.panel-body') as HTMLElement,
            this,
            APPLY_STYLES_TYPE.INNER_SHELL
        );
        setTimeout(() => { if($(window).width()<768) {
            $(".app-wizard").removeClass("vertical");
        }
        this.nativeElement.querySelector('div.app-wizard-actions-right')?.classList.remove('app-container');
        this.nativeElement.querySelector('div.app-wizard-actions')?.classList.add(this.actionsalignment);
        });
    }
}
