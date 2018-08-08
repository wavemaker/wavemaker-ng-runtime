import { Input } from '@angular/core';

/**
 * The wmConfirmdialog component defines the confirmdialog widget.
 */
export class Confirmdialog {
    /**
     * This property specifies the title for the confirmdialog widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string = 'Confirm';
    /**
     * Name of the confirmdialog widget.
     */
    @Input() name: string;
    /**
     * This property specifies the message for the confirmdialog widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() message: string = 'I am an confirm box!';
    /**
     * This property specifies the ok button text for the confirmdialog widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() oktext: string = 'OK';
    /**
     * This property specifies the cancel button text for the confirmdialog widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() canceltext: string = 'CANCEL';
    /**
     * This property specifies the tab order of the confirmdialog Widget.
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
     * This property specifies the animation applied to the confirmdialog widget.
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'bounce', 'fadeIn', 'rotateOut', 'check', etc </code></p>
     */
    @Input() animation: string = '';
    /**
     * This property sets the icon for dialog header.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iconclass: string = 'wi wi-done';
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
     * @param widget  Instance of the confirmdialog widget
     */
    onOk($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the cancel button for the dialog is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the confirmdialog widget
     */
    onCancel($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the dialog is opened.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the confirmdialog widget
     */
    onOpen($event: MouseEvent, widget: any) {}
}