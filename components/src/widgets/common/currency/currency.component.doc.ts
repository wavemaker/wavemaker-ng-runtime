import { Input } from '@angular/core';

/**
 * The wmCurrency component defines the currency widget.
 */
export class Currency {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Currency symbol to be shown in the currency.
     * <p><em>Allowed Values: </em><code>Standard currencies like USD, INR, GBP etc</code></p>
     */
    @Input() currency: string = 'USD';
    /**
     * Value to be shown in the currency.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: string;
    /**
     * This property will be used to disable/enable the currency widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
    /**
     * Title/hint for the currency. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * Maximum value for currency.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() maxvalue: number;
    /**
     * Minimum value for currency.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() minvalue: number;
    /**
     * Name of the currency widget.
     */
    @Input() name: string;
    /**
     * Placeholder text for the widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() placeholder: string = 'Enter value';
    /**
     * This property will be used to make the currency widget non-editable on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() readonly: boolean;
    /**
     * This property defines if the currency is a required field while form submission. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() required: boolean;
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element.
     */
    @Input() shortcutkey: string;
    /**
     * This property will be used to show/hide the currency widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     *  This property will be used to increment/decrement the currency value by the specified step interval.
     */
    @Input() step: number;
    /**
     * This property specifies the tab order of the Currency Widget.
     */
    @Input() tabindex: number = 0;

    /**
     * Callback function which will be triggered when the widget loses focus.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the currency widget
     */
    blur($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the currency widget
     */
    click($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget value is changed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the currency widget
     * @param newVal  New value of the currency widget
     * @param oldVal  Previous value of the currency widget
     */
    change($event: MouseEvent, widget: any, newVal: number, oldVal: number) {}
    /**
     * Callback function which will be triggered when the widget gets focused.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the currency widget
     */
    focus($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the currency widget
     */
    mouseenter($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the currency widget
     */
    mouseleave($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the currency widget
     */
    tap($event: TouchEvent, widget: any) {}
}