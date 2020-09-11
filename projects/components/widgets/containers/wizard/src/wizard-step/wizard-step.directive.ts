import { ContentChildren, Directive, HostBinding, Injector, Self } from '@angular/core';
import { NgForm } from '@angular/forms';

import { BaseComponent, IWidgetConfig, provideAsWidgetRef, RedrawableDirective } from '@wm/components/base';
import { WizardComponent } from '../wizard.component';

import { registerProps } from './wizard-step.props';

const DEFAULT_CLS = 'app-wizard-step-content';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-wizardstep',
    hostClass: DEFAULT_CLS,
};

const enum STEP_STATUS {
    CURRENT = 1,
    DISABLED,
    COMPLETED
}

@Directive({
    selector: 'form[wmWizardStep]',
    providers: [
        provideAsWidgetRef(WizardStepDirective)
    ],
    exportAs: 'wmWizardStep'
})
export class WizardStepDirective extends BaseComponent {
    static initializeProps = registerProps();

    public show: boolean;
    public name: string;
    public enableskip: any;
    public disablenext: boolean;
    public disabledone: boolean;
    public disableprevious: boolean;
    public isInitialized: boolean;
    isDone: boolean = false ;

    private status: STEP_STATUS = STEP_STATUS.DISABLED;
    private wizardComponent: WizardComponent;

    // reference to the components which needs a redraw(eg, grid, chart) when the height of this component changes
    @ContentChildren(RedrawableDirective, {descendants: true}) reDrawableComponents;

    @HostBinding('class.current')
    get isCurrent() {
        return this.active;
    }

    /**
     * along with the wizard form , also validate the forms
     * if there are any inside the wizard
     * @returns {boolean}
     */
    public get isValid() {
        return this.ngForm.valid && this.areEmbeddedFormsValid();
    }

    /**
     * get all the forms inside the wizard if any and validate
     * @returns {boolean}
     */
    private areEmbeddedFormsValid() {
        let embeddedForms = this.getAllEmbeddedForms();
        for (let form of embeddedForms) {
            if (form.widget && !form.widget.ngform.valid) {
                return false;
            }
        }
        return true;
    }

    private getAllEmbeddedForms() {
        return this.$element.find('form');
    }

    public get enableNext() {
        return !this.disablenext;
    }

    public get enableDone() {
        return !this.disabledone;
    }

    public get enablePrev() {
        return !this.disableprevious;
    }

    public set active(nv: boolean) {
        const isActive = this.active;
        this.status = STEP_STATUS.CURRENT;
        if (nv && !isActive) {
            this.redrawChildren();
        }
    }

    public get active(): boolean {
        return this.status === STEP_STATUS.CURRENT;
    }

    public set done(nv: boolean) {
        if (nv) {
            this.status = STEP_STATUS.COMPLETED;
        }
    }

    public get done(): boolean {
        return this.status === STEP_STATUS.COMPLETED;
    }

    public set disabled(nv: boolean) {
        if (nv) {
            this.status = STEP_STATUS.DISABLED;
        }
    }

    public get disabled(): boolean {
        return this.status === STEP_STATUS.DISABLED;
    }

    constructor(inj: Injector, @Self() private ngForm: NgForm) {
        super(inj, WIDGET_CONFIG);
        // If we inject directly as a param in the constructor, getting circular dependency error in unit testcases
        this.wizardComponent = this.inj.get(WizardComponent);
    }

    public invokeNextCB(index: number): boolean {
        return this.invokeEventCallback('next', {currentStep: this, stepIndex: index});
    }

    public invokePrevCB(index: number): boolean {
        return this.invokeEventCallback('prev', {currentStep: this, stepIndex: index});
    }

    public invokeSkipCB(index: number): boolean {
        return this.invokeEventCallback('skip', {currentStep: this, stepIndex: index});
    }

    // redraw all the projected components which are projected.
    private redrawChildren() {
        setTimeout(() => {
            if (this.reDrawableComponents) {
                this.reDrawableComponents.forEach(c => c.redraw());
            }
            const stepIndex = (this as any).wizardComponent.getCurrentStepIndex();
            this.invokeEventCallback('load', { stepIndex });
        }, 100);
    }
}
