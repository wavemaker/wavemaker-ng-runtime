import { Input } from '@angular/core';

/**
 * The wmWizard component defines the wizard widget.
 */

export class Wizard {

    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Name of the wizard widget.
     */
    @Input() name: string;

    /**
     * This property defines the caption for Next step. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() nextbtnlabel: string = 'next';

    /**
     * This property defines the caption for Previous step. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() previousbtnlabel: string = 'Previous';

    /**
     * This property defines the caption for Done step. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() donebtnlabel: string = 'Done';

    /**
     * This property defines the caption for Cancel step. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() cancelbtnlabel: string = 'Cancel';

    /**
     * This property sets style on to the step title. <br>
     * <p><em>Allowed Values: </em><code>auto, justified</code></p>
     * <div class="summary">
     * <p><code>auto</code><em>: Step titles will occupy required space.</em></p>
     * <p><code>justified</code><em>: Step titles will be occupying full space.</em></p>
     * </div>
     */
    @Input() stepstyle: string = 'justified';

    /**
     * This property sets placement of actions. <br>
     * <p><em>Allowed Values: </em><code>left, right</code></p>
     * <div class="summary">
     * <p><code>left</code><em>: The next, done, prev buttons will be placed left and skip will be placed right</em></p>
     * <p><code>right</code><em>: The next, done, prev buttons will be placed Right and skip will be placed left</em></p>
     * </div>
     */
    @Input() actionsalignment: string = 'right';

    /**
     * This property allows users to set default step on load of wizard.<br>
     * <p><em>Allowed Values: </em><code>none, [wizardstep[, wizardstep ...]]</code></p>
     * <div class="summary">
     * <p><code>none</code><em>: By default first step is shown</em></p>
     * <p><code>wizardstep</code><em>: Wizardstep with the name is set as selected step</em></p>
     * </div>
     */
    @Input() defaultstep: string = 'none';

    /**
     * This property will be used to show/hide the wizard widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

    /**
     * This property will be used to show/hide cancel button in the wizard widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() cancelable: boolean = true;

    /**
     * This property specifies how the elements should be aligned horizontally. <br>
     * <p><em>Allowed Values: </em><code>left, center, right</code></p>
     * <div class="summary">
     * <p><code>left</code><em>: Aligns an element to the left.</em></p>
     * <p><code>center</code><em>: Aligns an element to the center.</em></p>
     * <p><code>right</code><em>:  Aligns an element to the right.</em></p>
     * </div>
     */
    @Input() horizontalalign: string;

    /**
     * Callback function which will be triggered when the widget cancel button is clicked.
     * @param widget  Instance of the wizard widget
     * @param steps  Instances of wizardsteps.
     */
    onCancel(widget: any, steps: Array<any>) {}

    /**
     * Callback function which will be triggered when the done button is clicked.
     * @param widget  Instance of the wizard widget
     * @param steps  Instances of wizardsteps
     */
    onDone(widget: any, steps: Array<any>) {}
}