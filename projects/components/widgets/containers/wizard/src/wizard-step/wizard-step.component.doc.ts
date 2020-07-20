import { Input, Directive } from '@angular/core';

/**
 * The wmWizardStep component defines the wizardstep widget.
 */
@Directive()
export class WizardStep {

    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Title of the wizardstep widget.
     */
    @Input() title: string = 'Step Title';

    /**
     * Name of the wizardstep widget.
     */
    @Input() name: string;

    /**
     * This property will be used to show/hide the wizardstep widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

    /**
     * This property will be used to enable skip option on current step. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() enableskip: boolean = false;

    /**
     * This property defines the class of the icon that is shown in the title of the step.
     */
    @Input() iconclass: string;

    /**
     * Callback function which will be triggered when the widget is loaded.
     * @param widget  Instance of the wizardstep widget
     * @param stepIndex  Index of active wizard step
     */
    onLoad(widget: any, stepIndex: number) {}

    /**
     * Callback function which will be triggered when the next step button is clicked on widget.
     * @param widget  Instance of the wizardstep widget
     * @param currentStep  Instances of active wizardstep
     * @param stepIndex  Index of active wizardstep
     */
    onNext(widget: any, currentStep: number, stepIndex: number) {}

    /**
     * Callback function which will be triggered when the previous step button is clicked on widget.
     * @param widget  Instance of the wizardstep widget
     * @param currentStep  Instances of active wizardstep
     * @param stepIndex  Index of active wizardstep
     */
    onPrev(widget: any, currentStep: number, stepIndex: number) {}

    /**
     * Callback function which will be triggered when the skip link is clicked on widget.
     * @param widget  Instance of the wizardstep widget
     * @param currentStep  Instances of active wizardstep
     * @param stepIndex  Index of active wizardstep
     */
    onSkip(widget: any, currentStep: number, stepIndex: number) {}
}