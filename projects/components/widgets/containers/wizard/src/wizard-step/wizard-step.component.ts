import {
    AfterViewInit,
    Component,
    ContentChildren,
    HostBinding,
    Inject,
    Injector,
    OnInit,
    Optional,
    Self
} from "@angular/core";
import {
    BaseComponent,
    IWidgetConfig,
    provideAsWidgetRef,
    RedrawableDirective,
    StylableComponent
} from "@wm/components/base";
import {NgForm} from "@angular/forms";
import {registerProps} from "./wizard-step.props";
import {noop} from "@wm/core";
import {WizardComponent} from "../wizard.component";

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

@Component({
    standalone: true,
    selector: 'form[wmWizardStep]',
    template: `<ng-content partial-container-target></ng-content>`,
    providers: [
        provideAsWidgetRef(WizardStepComponent),
        NgForm
    ],
    exportAs: 'wmWizardStep'
})
export class WizardStepComponent extends StylableComponent implements OnInit, AfterViewInit {
    static initializeProps = registerProps();

    public show: boolean;
    public name: string;
    public enableskip: any;
    public disablenext: boolean;
    public disabledone: boolean;
    public disableprevious: boolean;
    public isInitialized: boolean;
    private isdynamic: boolean;
    public $lazyLoad = noop;
    isDone: boolean = false;
    nextCBInProgress: boolean = false;
    prevCBInProgress: boolean = false;

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
        return (this.ngForm.valid || this.ngForm.disabled) && this.areEmbeddedFormsValid();
    }

    /**
     * get all the forms inside the wizard if any and validate
     * @returns {boolean}
     */
    private areEmbeddedFormsValid() {
        for (const form of this.getAllEmbeddedForms()) {
            if (form.widget && form.widget.ngform && !form.widget.ngform.valid) {
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

    constructor(inj: Injector, @Self() private ngForm: NgForm, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        // If we inject directly as a param in the constructor, getting circular dependency error in unit testcases
        this.wizardComponent = this.inj.get(WizardComponent);
    }

    public invokeNextCB(index: number): boolean | Promise<boolean> {
        return this.invokeEventCallback('next', {currentStep: this, stepIndex: index});
    }

    public invokePrevCB(index: number): boolean | Promise<boolean> {
        return this.invokeEventCallback('prev', {currentStep: this, stepIndex: index});
    }

    public invokeSkipCB(index: number): boolean | Promise<boolean> {
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

    public remove() {
        if (this.active) {
            this === this.wizardComponent.steps.last ? this.wizardComponent.prev() : this.wizardComponent.next();
        }
        const availablePanes = this.wizardComponent.steps.toArray();
        availablePanes.splice((this as any).wizardComponent.getStepIndexByRef(this), 1);
        this.wizardComponent.steps.reset([...availablePanes]);
        this.nativeElement.remove();
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'content') {
            setTimeout(() => this.$lazyLoad(), 100);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        if (this.isdynamic) {
            this.wizardComponent.registerDynamicStep(this);
        }
    }
}
