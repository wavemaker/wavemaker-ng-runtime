import { Input, Directive } from '@angular/core';

/**
 * The wmButton component defines the button widget.
 */
@Directive()
export class Button {
    /**
     * This property specifies the value to be displayed along with the label of the button. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() badgevalue: string;
    /**
     * This property specifies the label of the button. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() caption: string;
    /**
     * Class of the widget.
     */
    @Input() class: string = 'btn-default';
    /**
     * This property allows user to bind expression to class property.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() conditionalclass: string;
    /**
     * This property will be used to disable/enable the button widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
    /**
     * Hint text is shown for the button widget on hover. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * CSS class of the icon.
     */
    @Input() iconclass: string;
    /**
     * url of the icon.
     */
    @Input() iconurl: string;
    /**
     * height of the icon.
     */
    @Input() iconheight: string;
    /**
     * margin of the icon.
     */
    @Input() iconmargin: string;
    /**
     * Property to set the position of icon in the widget.
     * <p><em>Allowed Values: </em><code>left, top, right</code></p>
     * <div class="summary">
     * <p><code>left</code><em>: Positions icon to the left.</em></p>
     * <p><code>top</code><em>: Positions icon on the top.</em></p>
     * <p><code>right</code><em>:  Positions icon to the right.</em></p>
     * </div>
     */
    @Input() iconposition: string;
    /**
     * width of the icon.
     */
    @Input() iconwidth: string;
    /**
     * Name of the button widget.
     */
    @Input() name: string;
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element.
     */
    @Input() shortcutkey: string;
    /**
     * This property will be used to show/hide the button widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property specifies the tab order of the Button Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * Type of the button widget. <br>
     * <p><em>Allowed Values: </em><code>button, submit, reset</code></p>
     * <div class="summary">
     * <p><code>button</code><em>: Just a button.</em></p>
     * <p><code>reset</code><em>: Resets data in the current form.</em></p>
     * <p><code>submit</code><em>:  Submits the current form data.</em></p>
     * </div>
     */
    @Input() type: string;

    /**
     * Callback function which will be triggered when the widget loses focus.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    onBlur($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    onClick($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is double clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    onDblclick($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget gets focused.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    onFocus($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
   onMouseenter($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    onMouseleave($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the tap event occurs on button widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    onTap($event: TouchEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the double tap event occurs on button widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    onDoubletap($event: TouchEvent, widget: any) {}
    /**
     * Callback function which will be triggered whenever a key is pressed down.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    onKeydown($event: KeyboardEvent, widget: any) {}
    /**
     * Callback function which will be triggered whenever a key is pressed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    onKeypress($event: KeyboardEvent, widget: any) {}
    /**
     * Callback function which will be triggered whenever a key is released.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     * @returns {void} This method does not return anything
     */
    onKeyup($event: KeyboardEvent, widget: any) {}
}
