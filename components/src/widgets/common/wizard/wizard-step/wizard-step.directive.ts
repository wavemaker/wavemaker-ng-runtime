import { ContentChildren, Directive, HostBinding, Injector, Self } from '@angular/core';
import { NgForm } from '@angular/forms';

import { IWidgetConfig } from '../../../framework/types';
import { registerProps } from './wizard-step.props';
import { BaseComponent } from '../../base/base.component';
import { RedrawableDirective } from '../../redraw/redrawable.directive';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';

registerProps();

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


    public show: boolean;
    public name: string;

    public disablenext: boolean;
    public disabledone: boolean;
    public disableprevious: boolean;
    public isInitialized: boolean;

    private status: STEP_STATUS = STEP_STATUS.DISABLED;

    // reference to the components which needs a redraw(eg, grid, chart) when the height of this component changes
    @ContentChildren(RedrawableDirective, {descendants: true}) reDrawableComponents;

    @HostBinding('class.current')
    get isCurrent() {
        return this.active;
    }

    public get isValid() {
        return this.ngForm.valid;
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
            this.invokeEventCallback('load');
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
    }

    public onNext(index: number): boolean {
        return this.invokeEventCallback('next', {currentStep: this, stepIndex: index});
    }

    public onPrev(index: number): boolean {
        return this.invokeEventCallback('prev', {currentStep: this, stepIndex: index});
    }

    public onSkip(index: number): boolean {
        return this.invokeEventCallback('skip', {currentStep: this, stepIndex: index});
    }

    // redraw all the projected components which are projected.
    private redrawChildren() {
        setTimeout(() => {
            if (this.reDrawableComponents) {
                this.reDrawableComponents.forEach(c => c.redraw());
            }
        }, 100);
    }
}

