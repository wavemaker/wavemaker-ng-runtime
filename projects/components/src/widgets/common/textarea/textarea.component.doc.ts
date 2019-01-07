import { Input } from '@angular/core';
import {TextareaComponent} from './textarea.component';

/**
 * The wmTextarea component defines the textarea widget.
 */
export class Textarea {
    /**
     * This property makes the widget get focused automatically when the page loads. <br>
     */
    @Input() autofocus: boolean;
    /**
     * Class of the widget.
     */
    @Input() class: string = 'btn-default';
    /**
     * Value of the textarea widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: string;
    /**
     * This property will be used to disable/enable the textarea widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
    /**
     * Hint text is shown for the textarea widget on hover. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * Maximum number of characters that are allowed in the widget.
     */
    @Input() maxchars: number;
    /**
     * Name of the textarea widget.
     */
    @Input() name: string;
    /**
     * Placeholder for the textarea.
     */
    @Input() placeholder: string;
    /**
     * This property doesnot allow to change the value in the textarea widget. <br>
     * <p><em>Bindable: </em><code>false</code></p>
     */
    @Input() readonly: boolean = false;
    /**
     * This property will be used to make the textarea widget readonly on the web page. <br>
     * <p><em>Bindable: </em><code>false</code></p>
     */
    @Input() required: boolean = false;
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element.
     */
    @Input() shortcutkey: string;
    /**
     * This property will be used to show/hide the textarea widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property specifies the tab order of the textarea Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * Updates the textarea value based on the event type. <br>
     * <p><em>Event Types: </em><code>blur, keypress</code></p>
     * <div class="summary">
     * <p><code>blur</code><em>: datavalue will be updated on blur event.</em></p>
     * <p><code>keypress</code><em>: datavalue will be updated on keypress.</em></p>
     * </div>
     */
    @Input() updateon: string = 'blur';

    /**
     * Callback function which will be triggered when the widget value is changed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     * @param newVal  datavalue of the textarea widget
     * @param oldVal  previously selected datavalue of the textarea widget
     */
    onChange($event: Event, widget: any, newVal: string|number, oldVal: string|number) {}
    /**
     * Callback function which will be triggered when the widget loses focus.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     */
    onBlur($event: Event, widget: any) {}
    /**
     * Callback function which will be triggered when the widget gets focused.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     */
    onFocus($event: Event, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     */
    onClick($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     */
    onMouseenter($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     */
    onMouseleave($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     */
    onTap($event: TouchEvent, widget: any) {}
    /**
     * Callback function which will be triggered whenever a key is pressed down.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     */
    onKeydown($event: KeyboardEvent, widget: any) {}
    /**
     * Callback function which will be triggered whenever a key is pressed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     */
    onKeypress($event: KeyboardEvent, widget: any) {}
    /**
     * Callback function which will be triggered whenever a key is released.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     * @returns {void} This method does not return anything
     */
    onKeyup($event: KeyboardEvent, widget: any) {}
}