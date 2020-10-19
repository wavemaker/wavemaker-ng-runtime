import { Input, Directive } from '@angular/core';

/**
 * The wmDateTime component defines the datetime widget.
 */
@Directive()
export class Datetime {
    /**
     * Name of the datetime widget.
     */
    @Input() name: string;
    /**
     * Placeholder for the datetime field.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() placeholder: string = 'Select Date Time';
    /**
     * Hint text is shown for the datetime widget on hover. This is not available in mobile.<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * This property specifies the tab order of the datetime Widget. This is not available in mobile.
     */
    @Input() tabindex: number = 0;
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element. This is not available in mobile.
     */
    @Input() shortcutkey: string;
    /**
     * This property defines the value of the datetime widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: string;
    /**
     * This property is used to set the display pattern of the date widget. This is not available in mobile.<br>
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'yyyy-MM-dd hh:mm:ss a', 'yyyy-MM-ddTHH:mm:ss', 'yyyy, MMM dd', etc. </code></p>
     */
    @Input() datepattern: string = 'yyyy-MM-dd hh:mm:ss a';
    /**
     * This property is used to decide number of hours to increase or decrease. This is not available in mobile.<br>
     */
    @Input() hourstep: number = 1;
    /**
     * This property is used to decide number of minutes to increase or decrease. This is not available in mobile.<br>
     */
    @Input() minutestep: number = 15;
    /**
     * This property output format of the datetime widget.<br>
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'yyyy-MM-dd hh:mm:ss a', 'yyyy-MM-ddTHH:mm:ss', 'yyyy, MMM dd', etc. </code></p>
     */
    @Input() outputformat: string = 'timestamp';
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
     * This property, when set, displays week number in datetime-picker UI. This is not available in mobile.<br>
     */
    @Input() showweeks: boolean = false;
    /**
     * This property, when set, displays button bar in datetime-picker UI. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() showbuttonbar: boolean = true;
    /**
     * This property makes the widget get focused automatically when the page loads. <br>
     */
    @Input() autofocus: boolean = false;
    /**
     * This property will be used to make the datetime widget non-editable on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() readonly: boolean = false;
    /**
     * This property will be used to show/hide the datetime widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property will be used to disable/enable the datetime widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean = false;

    /**
     * Callback function which will be triggered when the widget value changes.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the datetime widget
     * @param newVal  New value of the widget
     * @param oldVal  Old value of the widget
     */
    onChange($event: MouseEvent, widget: any, newVal: string, oldVal: string) {}
    /**
     * Callback function which will be triggered when the widget gets focused.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the datetime widget
     */
    onFocus($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget loses focus.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the datetime widget
     */
    onBlur($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked. This is not available in mobile.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the datetime widget
     */
    onClick($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget. This is not available in mobile.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the datetime widget
     */
    onMouseenter($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget. This is not available in mobile.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the datetime widget
     */
    onMouseleave($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the datetime widget
     */
    onTap($event: TouchEvent, widget: any) {}
}