import { Input } from '@angular/core';

/**
 * The wmAlertdialog component defines the alertdialog widget.
 */

export class Alertdialog {
    /**
     * This property specifies the title for the alertdialog widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string = 'Alert';
    /**
     * Name of the alertdialog widget.
     */
    @Input() name: string;
    /**
     * This property specifies the message for the alertdialog widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() message: string = 'I am an alert box!';
    /**
     * This property specifies the ok button text for the alertdialog widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() oktext: string = 'OK';
    /**
     * This property defines the alerttype of the alertdialog widget.
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'error', 'information', 'success', 'warning' </code></p>
     */
    @Input() alerttype: string = 'error';
    /**
     * This property specifies the tab order of the alertdialog Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * This property specifies if the dialog should behave as a modal or not
     */
    @Input() modal: boolean = false;
    /**
     * This property specifies if the dialog will have the close icon in header or not
     */
    @Input() closable: boolean = true;
    /**
     * This property specifies the animation applied to the alertdialog widget.
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'bounce', 'fadeIn', 'rotateOut', 'check', etc </code></p>
     */
    @Input() animation: string = '';
    /**
     * This property sets the icon for dialog header.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iconclass: string = 'wi wi-warning';
    /**
     * This property sets the url for icon in dialog header.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iconurl: string;
    /**
     * This property sets the icon width for icon in dialog header.
     */
    @Input() iconwidth: string;
    /**
     * This property sets the icon height for icon in dialog header.
     */
    @Input() iconheight: string;
    /**
     * This property sets the icon margin for icon in dialog header.
     */
    @Input() iconmargin: string;

    /**
     * Callback function which will be triggered when the ok button for the dialog is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the alertdialog widget
     */
    onOk($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the dialog is opened.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the alertdialog widget
     */
    onOpen($event: MouseEvent, widget: any) {}
}