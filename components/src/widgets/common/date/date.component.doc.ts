import { Input } from '@angular/core';

/**
 * The wmDate component defines the date widget.
 */
export class Date {
    /**
     * Name of the date widget.
     */
    @Input() name: string;
    /**
     * Placeholder for the date field.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() placeholder: string = 'Select Date';
    /**
     * Title/hint for the date widget. This is not available in mobile.<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * This property specifies the tab order of the date Widget. This is not available in mobile.
     */
    @Input() tabindex: number = 0;
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element. This is not available in mobile.
     */
    @Input() shortcutkey: string;
    /**
     * This property defines the value of the date widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: string;
    /**
     * This property display pattern of the date widget. This is not available in mobile.<br>
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'MM-dd-yy', 'yyyy-MM-dd', 'mm/dd/yyyy', etc. </code></p>
     */
    @Input() datepattern: string = 'yyyy-MM-dd';
    /**
     * This property output format of the date widget.<br>
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'MM-dd-yy', 'yyyy-MM-dd', 'mm/dd/yyyy', etc. </code></p>
     */
    @Input() outputformat: string = 'yyyy-MM-dd';
    /**
     * If the required property is set to true, `required` class is applied to the label[an asterik will be displayed next to the content of the label']. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() required: boolean = false;
    /**
     * This property is used to specify the minimum date to start with. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() mindate: string;
    /**
     * This property is used to specify the maximum date to end with. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() maxdate: string;
    /**
     * This property specifies the days which are to be excluded. This is not available in mobile.<br>
     * <p><em>Allowed Values: </em><code>Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday. </code></p>
     */
    @Input() excludedays: string;
    /**
     * This property specifies the dates which are to be excluded. This is not available in mobile.<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() excludedates: string;
    /**
     * This property, when set, displays week number in date-picker UI. This is not available in mobile.<br>
     */
    @Input() showweeks: boolean = false;
    /**
     * This property, when set, displays button bar in date-picker UI. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() showbuttonbar: boolean = true;
    /**
     * This property makes the widget get focused automatically when the page loads. <br>
     */
    @Input() autofocus: boolean = false;
    /**
     * This property will be used to make the date widget non-editable on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() readonly: boolean = false;
    /**
     * This property will be used to show/hide the date widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property will be used to disable/enable the date widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean = false;

    /**
     * Callback function which will be triggered when the widget value changes.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the date widget
     * @param newVal  New value of the widget
     * @param oldVal  Old value of the widget
     */
    change($event: MouseEvent, widget: any, newVal: string, oldVal: string) {}
    /**
     * Callback function which will be triggered when the widget gets focused.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the date widget
     */
    focus($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget loses focus.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the date widget
     */
    blur($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked. This is not available in mobile.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the date widget
     */
    click($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget. This is not available in mobile.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the date widget
     */
    mouseenter($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget. This is not available in mobile.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the date widget
     */
    mouseleave($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the date widget
     */
    tap($event: TouchEvent, widget: any) {}
}