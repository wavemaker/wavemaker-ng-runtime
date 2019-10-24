import { Input } from '@angular/core';

/**
 * The wmToggle component defines the toggle widget.
 */
export class Toggle {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * This property allows user to bind expression to class property
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() conditionalclass: any;
    /**
     * This property defines the value of the widget when the element is in the checked state.
     * Default value is boolean value true. If specified, the value will be of string type
     */
    @Input() checkedvalue: string | boolean = true;
    /**
     * This property defines the initial selected value of the toggle widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: any;
    /**
     * This property will be used to disable the toggle widget.
     * If the disabled property is true (checked), the widget becomes display-only. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
    /**
     * Hint text is shown of the toggle widget on hover. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * Name of the toggle widget.
     */
    @Input() name: string;
    /**
     * This property will be used to make the toggle widget non-editable. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() readonly: boolean;
    /**
     * This property will be used to validate the state of the toggle widget when used inside a form widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() required: boolean;
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element.
     */
    @Input() shortcutkey: string;
    /**
     * This property will be used to show/hide the toggle widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property specifies the tab order of the toggle widget.
     */
    @Input() tabindex: number = 0;

    /**
     * Callback function which will be triggered when the widget loses focus.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the toggle widget
     */
    onBlur($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the toggle widget
     */
    onClick($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked or when datavalue has changed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the toggle widget
     * @param newVal  datavalue of the toggle widget
     * @param oldVal  previously selected datavalue of the toggle widget
     */
    onChange($event: MouseEvent, widget: any, newVal: any, oldVal: any) {}
    /**
     * Callback function which will be triggered when the widget gets focused.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the toggle widget
     */
    onFocus($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the toggle widget
     */
    onMouseenter($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the toggle widget
     */
    onMouseleave($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the toggle widget
     */
    onTap($event: TouchEvent, widget: any) {}
}
