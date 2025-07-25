import { CommonModule } from '@angular/common';
import { TextContentDirective } from "@wm/components/base";
import {
    AfterContentInit,
    AfterViewChecked,
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

import {DynamicComponentRefProvider, noop} from '@wm/core';
import {
    APPLY_STYLES_TYPE,
    IWidgetConfig,
    provideAsWidgetRef,
    styler,
    StylableComponent,
    Context, createArrayFrom
} from '@wm/components/base';

import { registerProps } from './wizard.props';

import {WizardStepComponent} from "./wizard-step/wizard-step.component";
import {find, findIndex, forEach, get, indexOf, isArray, isNumber, isString} from "lodash-es";

const DEFAULT_CLS = 'app-wizard panel clearfix';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-wizard',
    hostClass: DEFAULT_CLS
};

@Component({
  standalone: true,
  imports: [CommonModule, TextContentDirective],
    selector: 'div[wmWizard]',
    templateUrl: './wizard.component.html',
    providers: [
        provideAsWidgetRef(WizardComponent),
        {provide: Context, useFactory: () => { return {} }, multi: true}
    ],
    exportAs: 'wmWizard'
})
export class WizardComponent extends StylableComponent implements OnInit, AfterContentInit, AfterViewInit, AfterViewChecked {
    static initializeProps = registerProps();

    @ContentChildren(WizardStepComponent) steps: QueryList<WizardStepComponent>;
    @ContentChild('wizardAction', { read: TemplateRef, descendants: false }) wizardAction: TemplateRef<any>;

    public message: {caption: string, type: string};
    public currentStep: WizardStepComponent;

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
    public defaultstep;
    public fieldDefs;
    public type;
    public nodatamessage;
    private dynamicComponentProvider;
    private _dynamicContext;
    private dynamicStepIndex;
    public dynamicWizard;
    public defaultstepindex;
    private _isFirstLoad: boolean = true;
    public autoActivation:boolean;

    get hasPrevStep(): boolean {
        return !this._isFirstStep(this.currentStep);
    }

    get hasNextStep(): boolean {
        return !this._isLastStep(this.currentStep);
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

    /**
     * returns current step index of the Wizard's current step
     */
    get currentStepIndex() {
        return this.getStepIndexByRef(this.currentStep);
    }

    /**
     * returns weather the current step is first step or not
     */
    get isFirstStep(): boolean {
        return this._isFirstStep(this.currentStep);
    }

    /**
     * returns weather the current step is last step or not
     */
    get isLastStep(): boolean {
        return this._isLastStep(this.currentStep);
    }

    constructor(inj: Injector, dynamicComponentProvider: DynamicComponentRefProvider, @Self() @Inject(Context) contexts: Array<any>, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
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
        this.dynamicComponentProvider = dynamicComponentProvider;
        this.dynamicWizard = [];
        this.dynamicStepIndex = 0;
    }

    /**
     * This method is used to register the dynamic steps.
     * After all steps are initialzed, update the querylist manually based on index.
     * @param stepRef - refrence of the wizardstep
     */
    public registerDynamicStep(stepRef) {
        this.dynamicWizard.push(stepRef);
        const isLastStep =  this.dynamicWizard.length === this.dynamicStepIndex;
        if (isLastStep) {
            for (let i = 0; i < this.dynamicWizard.length; i++) {
                const newStepRef  = find(this.dynamicWizard, step => step.dynamicStepIndex === i);
                const isStepAlreadyExist = find(this.steps.toArray(), newStepRef);
                if (!isStepAlreadyExist) {
                    this.steps.reset([...this.steps.toArray(), newStepRef]);
                    if (newStepRef.active) {
                        setTimeout(() => {
                            newStepRef.select();
                        }, 20);
                    }
                }
            }
        }
    }

    /**
     * This method is to add the wizard step dynamically
     * @param wizardSteps - list of wizardsteps
     */
    public addStep(wizardSteps) {
        if (!isArray(wizardSteps)) {
            wizardSteps = [wizardSteps];
        }
        const stepNamesList = [];
        forEach(wizardSteps, (step, index) => {
            const isStepAlreadyCreated = find(this.steps.toArray(), {name: step.name});
            const isStepNameExist = indexOf(stepNamesList, step.name);
            // If user tries to add wizardstep with the same name which is already exists then do not create the step
            if (isStepAlreadyCreated || isStepNameExist > 0) {
                console.warn(`The wizard step with name ${step.name} already exists`);
                return;
            }

            let paramMarkup = '';
            let propsTmpl = '';
            this.dynamicStepIndex++;
            const name = step.name ? step.name : `wizardstep${this.steps.toArray().length + (index + 1)}`;
            stepNamesList.push(name);
            const partialParams = get(step, 'params');

            forEach(step, (value, key) => {
                if (key !== 'params') {
                    propsTmpl = `${propsTmpl} ${key}="${value}"`;
                }
            });

            forEach(partialParams, (value, key) => {
                paramMarkup = `${paramMarkup} <wm-param name="${key}" value="${value}"></wm-param>`;
            });
            const markup = `<wm-wizardstep dynamicStepIndex="${this.dynamicStepIndex - 1}" isdynamic="true" name="${name}" ${propsTmpl}>
                            ${paramMarkup}
                        </wm-wizardstep>`;

            if (!this._dynamicContext) {
                this._dynamicContext = Object.create(this.viewParent);
                this._dynamicContext[this.getAttr('wmWizard')] = this;
            }

            this.dynamicComponentProvider.addComponent(this.getNativeElement().querySelector('.app-wizard-body'), markup, this._dynamicContext, {inj: this.inj});

        });
        return stepNamesList;
    }

    /**
     * This method is to remove the wizard step
     * @param step - index or name of the step
     */
    public removeStep(step: number | string) {
        const stepRef = isString(step) ? this.getStepRefByName(step) : isNumber(step)
            ? this.getStepRefByIndex(step) : null;
        stepRef ? stepRef.remove() : console.warn(`Could not find step with name or index '${step}' to remove`);
    }

    /**
     * returns next valid step. the index passed is also checked if its valid step
     * @param index
     * @returns {WizardStepComponent}
     */
    private getNextValidStepFormIndex(index: number): WizardStepComponent {
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
     * @returns {WizardStepComponent}
     */
    private getPreviousValidStepFormIndex(index: number): WizardStepComponent {
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
     * @returns {WizardStepComponent}
     */
    private getStepRefByIndex(index: number): WizardStepComponent {
        return this.steps.toArray()[index];
    }

    /**
     * returns the index value of the step.
     * @param {WizardStepComponent} wizardStep
     * @returns {number}
     */
    private getStepIndexByRef(wizardStep: WizardStepComponent): number {
        return this.steps.toArray().indexOf(wizardStep);
    }

    /**
     * gets stepRef by searching on the name property.
     * @param {string} name
     * @returns {WizardStepComponent}
     */
    private getStepRefByName(name: string): WizardStepComponent {
        return this.steps.find(step => step.name === name);
    }

    /**
     * sets default step as current step if configured
     * or finds first valid step and set it as current step.
     * @param {WizardStepComponent} step
     */
    private setDefaultStep(step: WizardStepComponent) {
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
     * @param {WizardStepComponent} currentStep
     */
    private onWizardHeaderClick($event: Event, currentStep: WizardStepComponent) {
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

    private isPromise = (obj) => obj instanceof Promise || (obj !== null && typeof obj === 'object' && typeof obj.then === 'function' && typeof obj.catch === 'function');

    // Method to navigate to next step

    private handleNext(value: boolean | Promise<boolean>, currentStep, currentStepIndex) {
        if (this.isPromise(value)) {
            (value as Promise<boolean>).then(response => {
                if (response === false) {
                    return;
                }
                this.extendNextFn(currentStep, currentStepIndex);
            }, err => err);
        } else {
            if (value === false) {
                return;
            }
            this.extendNextFn(currentStep, currentStepIndex);
        }
    }

    public next(eventName: string = 'next') {
        const currentStep = this.currentStep;
        const currentStepIndex = this.getCurrentStepIndex();

        // abort if onSkip method returns false
        if (eventName === 'skip') {
            const response =  currentStep.invokeSkipCB(currentStepIndex);
            this.handleNext(response, currentStep, currentStepIndex);
        } else if (this.currentStep.isValid && eventName === 'next') {
            const response  =  currentStep.invokeNextCB(currentStepIndex);
            this.handleNext(response, currentStep, currentStepIndex);
        } else if (this.enablenext && !this.currentStep.isValid){
            Array.from((<any>this).currentStep.getAllEmbeddedForms())?.forEach((form:any) => {
                form.widget.highlightInvalidFields();
            });
            const invalidFormInputElement = this.currentStep.nativeElement?.querySelector("input.ng-invalid") as HTMLInputElement;
            invalidFormInputElement?.focus();

        }
    }

    private extendNextFn(currentStep, currentStepIndex) {
        const nextStep: WizardStepComponent = this.getNextValidStepFormIndex(currentStepIndex + 1);
        // If there are any steps which has show then only change state of current step else remain same
        if (nextStep) {
            nextStep.isInitialized = true;
            currentStep.isDone = true;
            currentStep.done = true;
            nextStep.active = true;
            this.currentStep = nextStep;
            // Remove 'current' class from all wizard steps in header
            const allStepItems = this.nativeElement.querySelectorAll('li[data-stepid]');
            allStepItems.forEach((el: Element) => {
                el.classList.remove('current');
                const anchor = el.querySelector('a');
                if (anchor) {
                    anchor.setAttribute('tabindex', '-1');
                }
            });
            // Add 'current' to next step header item
            const newStepLi = this.nativeElement.querySelector(`li[data-stepid="${nextStep.widgetId}"]`);
            const newStepAnchor = newStepLi?.querySelector('a') as HTMLElement;
            if (newStepLi && newStepAnchor) {
                newStepLi.classList.add('current');
                newStepAnchor.setAttribute('tabindex', '0');
                newStepAnchor.focus();
            }
            this.updateStepFocus();
        }
        this.addMoreText();
    }
    // Method to navigate to previous step
    public prev() {
        const currentStep = this.currentStep;
        const currentStepIndex = this.getCurrentStepIndex();

        // abort if onPrev method returns false.
        const response = currentStep.invokePrevCB(currentStepIndex);
        if (this.isPromise(response)) {
            (response as Promise<boolean>).then( response => {
                if (response === false) {
                    return;
                }
                this.extendPrevFn(currentStep, currentStepIndex);
            }, err => err);
        } else {
            if (response === false) {
                return;
            }
            this.extendPrevFn(currentStep, currentStepIndex);
        }
    }

    private extendPrevFn(currentStep, currentStepIndex){
        const prevStep: WizardStepComponent = this.getPreviousValidStepFormIndex(currentStepIndex - 1);

        // If there are any steps which has show then only change state of current step else remain same
        if (prevStep) {
            currentStep.isDone = false;
            currentStep.disabled = true;
            prevStep.active = true;
            this.currentStep = prevStep;
            //  Remove 'current' class from all steps
            const allStepItems = this.nativeElement.querySelectorAll('li[data-stepid]');
            allStepItems.forEach((el: Element) => {
                el.classList.remove('current');
                const anchor = el.querySelector('a');
                if (anchor) {
                    anchor.setAttribute('tabindex', '-1');
                }
            });
            // Apply 'current' to prev step
            const prevStepLi = this.nativeElement.querySelector(`li[data-stepid="${prevStep.widgetId}"]`);
            const prevStepAnchor = prevStepLi?.querySelector('a') as HTMLElement;
            if (prevStepLi && prevStepAnchor) {
                prevStepLi.classList.add('current');
                prevStepAnchor.setAttribute('tabindex', '0');
                prevStepAnchor.focus();
            }
            this.updateStepFocus();
        }
        this.addMoreText();
    }

    public skip() {
        this.next('skip');
    }

    /**
     * Navigates to the given step based on step name or step index
     * This will work only if the step is already in done state
     * @param step
     */
    public gotoStep(step: string | number) {
        let gotoStepIndex: number;
        if (isString(step)) {
            gotoStepIndex = this.steps.toArray().map(step => step.name).indexOf(step);
            if (gotoStepIndex === -1) {
                console.error(`Could not find step '${step}'`);
                return;
            }
        } else if (isNumber(step) && step >= 0) {
            gotoStepIndex = step;
        } else {
            console.error("Invalid step name or index provided");
            return;
        }

        const gotoStep: WizardStepComponent = this.getStepRefByIndex(gotoStepIndex);

        if (gotoStep?.show) {
            this.onWizardHeaderClick(event, gotoStep);
        } else {
            console.error("The gotoStep function cannot navigate to hidden steps");
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

    private _isFirstStep(stepRef: WizardStepComponent) {
        return this.steps.first === stepRef;
    }

    private _isLastStep(stepRef: WizardStepComponent) {
        return this.steps.last === stepRef;
    }

    private onDataChange(newVal) {
        this.fieldDefs = createArrayFrom(newVal);
    }

    private updateStepFocus() {
        setTimeout(() => {
            const currentStepElement = this.nativeElement.querySelector(".app-wizard-heading li.current a") as HTMLElement;
            currentStepElement?.focus();
        });
    }

    // Define the property change handler. This Method will be triggered when there is a change in the widget property
    onPropertyChange(key: string, nv: any, ov?: any) {
        // Monitoring changes for properties and accordingly handling respective changes

        if (key === 'stepstyle') {
            this.stepClass =  nv === 'justified' ? 'nav-justified' : '';
        } else if (key === 'dataset') {
            this.onDataChange(nv);
        } else if (key === 'defaultstep') {
            this.setDefaultStep(this.getStepRefByName(nv));
        }  else if (key === 'defaultstepindex') {
            this.setDefaultStep(this.getStepRefByIndex(nv));
        }  else if (key === 'actionsalignment') {
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
        this.steps.changes.subscribe( slides => {
            if (this.steps.length > 1 && this.type === 'dynamic' && this._isFirstLoad) {
                this.setDefaultStep(this.getStepRefByIndex(this.defaultstepindex));
                this._isFirstLoad = false;
            }
        });
    }
    private isSelectableStep(stepRef: WizardStepComponent): boolean {
            return stepRef.show && !stepRef.disabled;
    }
    private getSelectableStepBeforeIndex(index: number): WizardStepComponent {
            for (let i = index - 1; i >= 0; i--) {
                const step = this.getStepRefByIndex(i);
                if (this.isSelectableStep(step)) {
                    return step;
                }
            }
            if (index === 0) {
                const step = this.getStepRefByIndex(this.steps.length - 1);
                if (this.isSelectableStep(step)) {
                    return step;
                }
            }
        }
    private getSelectableStepAfterIndex(index: number): WizardStepComponent {
                for (let i = index + 1; i < this.steps.length; i++) {
                    const step = this.getStepRefByIndex(i);
                    if (this.isSelectableStep(step)) {
                        return step;
                    }
                }
                if (index === this.steps.length - 1) {
                    const step = this.getStepRefByIndex(0);
                     if (this.isSelectableStep(step)) {
                        return step;
                     }
                }
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
        });
    }
    ngAfterViewChecked() {
        this.nativeElement.querySelectorAll('div.app-wizard-actions').forEach(el => el?.classList.add(this.actionsalignment));
        this.nativeElement.querySelectorAll('div.app-wizard-actions-right').forEach(el => el?.classList.remove('app-container'));
    }
    public getActiveStepIndex(): number {
        return findIndex(this.steps.toArray(), {isCurrent: true});
    }
    onkeydown(event) {
        let newStep;
        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                newStep = this.autoActivation ? null : this.getSelectableStepBeforeIndex(this.getSelectedStepIndex());
                break;

            case 'ArrowRight':
            case 'ArrowDown':
                event.preventDefault();
                newStep = this.autoActivation ? null : this.getSelectableStepAfterIndex(this.getSelectedStepIndex());
                break;
            case 'Enter':
            case ' ':
            case 'Spacebar': 
                event.preventDefault();
                setTimeout(() => {
                    const activeElement  = this.nativeElement.querySelector('li.current');
                    const stepLi = activeElement.closest('li[data-stepid]'); 
                    const isInWizardHeader = activeElement.closest('.app-wizard-heading');
                            
                    if (stepLi && isInWizardHeader) {
                    const stepId = stepLi.getAttribute('data-stepid');
                    const stepIndex = this.steps.toArray().findIndex(step => step.widgetId === stepId);
                    const currentStep = this.steps.toArray()[stepIndex];

                        if (currentStep && currentStep !== this.currentStep) {
                            this.onWizardHeaderClick(event, currentStep);

                            // Update tabindex for accessibility
                            const allStepItems = this.nativeElement.querySelectorAll('li[data-stepid]');
                            allStepItems.forEach((el: Element) => {
                            (el as HTMLElement).setAttribute('tabindex', '-1');
                            });

                            const stepAnchor = stepLi.querySelector('a');
                            if (stepAnchor) {
                            stepAnchor.setAttribute('tabindex', '0');
                            stepAnchor.focus();
                            }
                        }
                    }
                }, 0);
                break;
            default:
                return;
        }
       if (newStep) {
            this.nativeElement.querySelector('li.current')?.classList.remove('current');
             this.nativeElement.querySelector(`li[data-stepid="${newStep.widgetId}"]`)?.classList.add('current');
             const stepLi = this.nativeElement.querySelector(".app-wizard-heading li.current a") as HTMLElement;
             const allStepItems = this.nativeElement.querySelectorAll('li[data-stepid] a');
             allStepItems.forEach((el: Element) => {
                (el as HTMLElement).setAttribute('tabindex', '-1');
             });
            (stepLi).setAttribute('tabindex', '0');
            stepLi?.focus();
        }
    }
    getSelectedStepIndex() {
        const index = this.steps.toArray().findIndex(step =>
            this.nativeElement.querySelector(`li[data-stepid="${step.widgetId}"]`)?.classList.contains("current"));
        return index >= 0 ? index : this.getActiveStepIndex();
    }
}
