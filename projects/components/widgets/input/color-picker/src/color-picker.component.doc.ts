import { Input, Directive } from '@angular/core';

/**
 * The wmColorPicker component defines the colorpicker widget.
 */
@Directive()
export class ColorPicker {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Value of the colorpicker widget. Accepts the value from a studio variable or from another widget's value.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: string;
    /**
     * Placeholder text for the widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() placeholder: string = 'Select Color';
    /**
     * This property will be used to disable/enable the colorpicker widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
    /**
     * Name of the colorpicker widget.
     */
    @Input() name: string;
    /**
     * This property will be used to make the colorpicker widget non-editable on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() readonly: boolean;
    /**
     * This property defines if the colorpicker is a required field while form submission. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() required: boolean;
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element.
     */
    @Input() shortcutkey: string;
    /**
     * This property will be used to show/hide the colorpicker widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property specifies the tab order of the Colorpicker Widget.
     */
    @Input() tabindex: number = 0;

    /**
     * Callback function which will be triggered when the widget loses focus.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the colorpicker widget
     */
    onBlur($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the colorpicker widget
     */
    onClick($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget value is changed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the colorpicker widget
     * @param newVal  New value of the colorpicker widget
     * @param oldVal  Previous value of the colorpicker widget
     */
    onChange($event: MouseEvent, widget: any, newVal: string, oldVal: string) {}
    /**
     * Callback function which will be triggered when the widget gets focused.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the colorpicker widget
     */
    onFocus($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the colorpicker widget
     */
    onMouseenter($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the colorpicker widget
     */
    onMouseleave($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the colorpicker widget
     */
    onTap($event: TouchEvent, widget: any) {}
}