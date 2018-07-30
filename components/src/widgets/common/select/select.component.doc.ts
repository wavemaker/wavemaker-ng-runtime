import { Input } from '@angular/core';

/**
 * The wmSelect component defines the select widget.
 */
export class Select {
    /**
     * This property makes the element get focused automatically when the page loads.
     */
    @Input() autofocus: boolean;
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * This property sets the dataValue to be returned by the select widget when the list is populated using the dataSet property. <br>
     */
    @Input() datafield: string;
    /**
     * This property accepts the options to create the select widget.
     * These options can be array of values, array of objects, object containing key-value pairs. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: Array<any> | Object;
    /**
     * This property defines the initial selected value of the select widget. <br>
     * Only when multiple is set to true, datavalue accepts array of values.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: any;
    /**
     * This property will be used to disable the select widget.
     * If the disabled property is true (checked), the widget becomes display-only. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
    /**
     * This is an advanced property that gives more control over what is displayed in the drop-down select list.
     * A Display Expression uses a Javascript expression to format exactly what is shown <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() displayexpression: string;
    /**
     * This property sets the displayValue to show in the select widget when the list is populated using the dataSet property. <br>
     */
    @Input() displayfield: string;
    /**
     * This property specifies the title/hint of the select. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * When this value is set to true multiple options can be selected from select widget. <br>
     */
    @Input() multiple: boolean;
    /**
     * Name of the select widget.
     */
    @Input() name: string;
    /**
     * Allows to display the data in asc or desc order based on this property <br>
     */
    @Input() orderby: string;
    /**
     * This property specifies the placeholder for the select. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() placeholder: string;
    /**
     * This property will be used to make the select widget non-editable. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() readonly: boolean;
    /**
     * This property will be used to validate the state of the select widget when used inside a form widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() required: boolean;
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element.
     */
    @Input() shortcutkey: string;
    /**
     * This property will be used to show/hide the select widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property specifies the tab order of the select widget.
     */
    @Input() tabindex: number = 0;

    /**
     * Callback function which will be triggered when the widget loses focus.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the select widget
     */
    blur($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the select widget
     */
    click($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked or when datavalue has changed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the select widget
     * @param newVal  datavalue of the select widget
     * @param oldVal  previously selected datavalue of the select widget
     */
    change($event: MouseEvent, widget: any, newVal: any, oldVal: any) {}
    /**
     * Callback function which will be triggered when the widget is double clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the select widget
     */
    dblclick($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget gets focused.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the select widget
     */
    focus($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the select widget
     */
    mouseenter($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the select widget
     */
    mouseleave($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the select widget
     */
    tap($event: TouchEvent, widget: any) {}
    /**
     * Callback function which will be triggered whenever a key is pressed down.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the select widget
     */
    keydown($event: KeyboardEvent, widget: any) {}
    /**
     * Callback function which will be triggered whenever a key is pressed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the select widget
     */
    keypress($event: KeyboardEvent, widget: any) {}
    /**
     * Callback function which will be triggered whenever a key is released.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the select widget
     * @returns {void} This method does not return anything
     */
    keyup($event: KeyboardEvent, widget: any) {}
}