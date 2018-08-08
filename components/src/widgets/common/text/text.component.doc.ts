import { Input } from '@angular/core';

/**
 * The wmText component defines the text widget.
 */
export class Text {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Name of the text widget.
     */
    @Input() name: string;
    /**
     * Type of the text widget. <br>
     * <p><em>Allowed Values: </em><code>color, date, datetime-local, email, month, number, password, search, tel, text, time, url, week</code></p>
     */
    @Input() type: string = 'text';
    /**
     * A placeholder is text to show in the editor when there is no value.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() placeholder: string = 'Enter text';
    /**
     * Hint text is shown for the text widget on hover. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * This property specifies the tab order of the text Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element.
     */
    @Input() shortcutkey: string;
    /**
     * This is the default value to display value for an editor widget. Note that the display value is just what the user sees initially, and is not always the dataValue returned by the widget.<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: string;
    /**
     * This property will be used to validate the state of the text widget when used inside a form widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() required: boolean = false;
    /**
     * Enter any regular expression to be used for client-side input validation.
     */
    @Input() regexp: string = '.*';
    /**
     * Defines the maximum number of characters that can be entered in the editor.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() maxchars: number;
    /**
     * This property makes the element get focused automatically when the page loads.
     */
    @Input() autofocus: boolean = false;
    /**
     * Selecting this property prevents the user from being able to change the data value of a widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() readonly: boolean = false;
    /**
     * This property will be used to show/hide the text widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property will be used to disable/enable the text widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
    /**
     * Enabling this property turns on auto-completion in the editor.<br>
     */
    @Input() autocomplete: boolean = false;
    /**
     * The keys in displayformat represent the special tokens/characters used to delimit acceptable ranges of inputs.<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() displayformat: string;
    /**
     * Updates the datavalue as selected.<br>
     * <p><em>Allowed Values: </em><code>blur, keypress</code></p>
     * <div class="summary">
     * <p><code>blur</code><em>: Datavalue will be updated on blur event.</em></p>
     * <p><code>keypress</code><em>: Datavalue will be updated on keypress.</em></p>
     * </div>
     */
    @Input() updateon: string = 'blur';
    /**
     * The amount of delay in milliseconds to update the datavalue.<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() updatedelay: number = 0;
    /**
     * Bind or enter a minimum value to the text<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() minvalue: number;
    /**
     * Bind or enter a maximum value to the text<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() maxvalue: number;
    /**
     * Use the stepper to increment/decrement the input value by the specified step interval.
     */
    @Input() step: number;
    /**
     * Callback function which will be triggered when the widget is clicked or when datavalue has changed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the text widget
     * @param newVal  datavalue of the text widget
     * @param oldVal  previously selected datavalue of the text widget
     */
    onChange($event: Event, widget: any, newVal: string|number, oldVal: string|number) {}
    /**
     * Callback function which will be triggered when the widget loses focus.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the text widget
     */
    onBlur($event: Event, widget: any) {}
    /**
     * Callback function which will be triggered when the widget gets focused.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the text widget
     */
    onFocus($event: Event, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the text widget
     */
    onClick($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the text widget
     */
    onMouseenter($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the text widget
     */
    onMouseleave($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the text widget
     */
    onTap($event: TouchEvent, widget: any) {}
    /**
     * Callback function which will be triggered whenever a key is pressed down.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the text widget
     */
    onKeydown($event: KeyboardEvent, widget: any) {}
    /**
     * Callback function which will be triggered whenever a key is pressed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the text widget
     */
    onKeypress($event: KeyboardEvent, widget: any) {}
    /**
     * Callback function which will be triggered whenever a key is released.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the text widget
     * @returns {void} This method does not return anything
     */
    onKeyup($event: KeyboardEvent, widget: any) {}
}