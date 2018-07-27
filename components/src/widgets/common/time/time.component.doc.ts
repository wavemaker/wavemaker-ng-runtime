import { Input } from '@angular/core';

/**
 * The wmTime component defines the time widget.
 */
export class Time {
    /**
     * Name of the time widget.
     */
    @Input() name: string;
    /**
     * Placeholder for the time field.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() placeholder: string = 'Select Time';
    /**
     * Title/hint for the time widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * This property specifies the tab order of the time Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element.
     */
    @Input() shortcutkey: string;
    /**
     * This property defines the value of the time widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: string;
    /**
     * This property display pattern of the time widget.<br>
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'HH:mm:ss', 'h:m:s', 'hh:mm a', etc. </code></p>
     */
    @Input() timepattern: string = 'hh:mm a';
    /**
     * This property decide number of hours to increase or decrease.<br>
     */
    @Input() hourstep: number = 1;
    /**
     * This property decide number of minutes to increase or decrease.<br>
     */
    @Input() minutestep: number = 15;
    /**
     * This property output format of the time widget.<br>
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'HH:mm:ss', 'h:m:s', 'hh:mm a', etc. </code></p>
     */
    @Input() outputformat: string = 'HH:mm:ss';
    /**
     * If the required property is set to true, `required` class is applied to the label[an asterik will be displayed next to the content of the label']. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() required: boolean = false;
    /**
     * This property is used to specify the minimum time to start with. <br>
     */
    @Input() mintime: string;
    /**
     * This property is used to specify the maximum time to end with. <br>
     */
    @Input() maxtime: string;
    /**
     * This property makes the widget get focused automatically when the page loads. <br>
     */
    @Input() autofocus: boolean = false;
    /**
     * This property will be used to make the time widget non-editable on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() readonly: boolean = false;
    /**
     * This property will be used to show/hide the time widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property will be used to disable/enable the time widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean = false;

    /**
     * Callback function which will be triggered when the widget value changes.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the time widget
     * @param newVal  New value of the widget
     * @param oldVal  Old value of the widget
     */
    change($event: MouseEvent, widget: any, newVal: string, oldVal: string) {}
    /**
     * Callback function which will be triggered when the widget gets focused.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the time widget
     */
    focus($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget loses focus.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the time widget
     */
    blur($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the time widget
     */
    click($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the time widget
     */
    mouseenter($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the time widget
     */
    mouseleave($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the time widget
     */
    tap($event: TouchEvent, widget: any) {}
}