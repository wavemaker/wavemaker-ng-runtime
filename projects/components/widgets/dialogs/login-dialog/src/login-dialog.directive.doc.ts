import { Input } from '@angular/core';

/**
 * The wmLogindialog component defines the logindialog widget.
 */
export class Logindialog {
    /**
     * This property specifies the title for the logindialog widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string;
    /**
     * Name of the logindialog widget.
     */
    @Input() name: string;
    /**
     * This property specifies if the dialog should behave as a modal or not
     */
    @Input() modal: boolean = false;
    /**
     * This property specifies the animation applied to the logindialog widget.
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'bounce', 'fadeIn', 'rotateOut', 'check', etc </code></p>
     */
    @Input() animation: string = '';
    /**
     * This property sets the icon for dialog header.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iconclass: string = 'wi wi-sign-in';
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
     * Callback function which will be triggered on submit of dialog.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the logindialog widget
     */
    onSubmit($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the dialog is closed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the logindialog widget
     */
    onClose($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the dialog is opened.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the logindialog widget
     */
    onOpen($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the login is successful.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the logindialog widget
     */
    onSuccess($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the login fails.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the logindialog widget
     */
    onError($event: MouseEvent, widget: any) {}
}