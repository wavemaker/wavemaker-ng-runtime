import { Input } from '@angular/core';

/**
 * The wmRichtexteditor component defines the rich-text-editor widget.
 */
export class RichTextEditor {
    /**
     * Name of the rich-text-editor widget.
     */
    @Input() name: string;
    /**
     * Placeholder for the rich-text-editor field.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() placeholder: string;
    /**
     * This property specifies the tab order of the rich-text-editor Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * This property defines the value of the rich-text-editor widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: string;
    /**
     * This property will be used to make the rich-text-editor widget non-editable on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() readonly: boolean = false;
    /**
     * This property will be used to show/hide the rich-text-editor widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property will be used to show or hide the preview part of the rich-text-editor widget. <br>
     */
    @Input() showpreview: boolean = false;

    /**
     * Callback function which will be triggered when the widget value changes.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the rich-text-editor widget
     * @param newVal  New value of the widget
     * @param oldVal  Old value of the widget
     */
    change($event: MouseEvent, widget: any, newVal: string, oldVal: string) {}
}