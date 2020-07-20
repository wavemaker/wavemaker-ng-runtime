import { Input, Directive } from '@angular/core';

/**
 * The wmDesigndialog component defines the designdialog widget.
 */
@Directive()
export class Designdialog {
    /**
     * This property specifies the title for the designdialog widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string = 'Information';
    /**
     * Name of the designdialog widget.
     */
    @Input() name: string;
    /**
     * This property specifies the tab order of the designdialog Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * This property specifies if the header of the dialog should be shown or not
     */
    @Input() showheader: boolean = true;
    /**
     * This property specifies if the dialog should behave as a modal or not
     */
    @Input() modal: boolean = true;
    /**
     * This property specifies if the dialog will have the close icon in header or not
     */
    @Input() closable: boolean = true;
    /**
     * This property specifies the animation applied to the designdialog widget.
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'bounce', 'fadeIn', 'rotateOut', 'check', etc </code></p>
     */
    @Input() animation: string = '';
    /**
     * This property sets the icon for dialog header.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iconclass: string = 'wi wi-file-text';
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
     * Callback function which will be triggered when the close button for the dialog is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the designdialog widget
     */
    onClose($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the dialog is opened.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the designdialog widget
     */
    onOpen($event: MouseEvent, widget: any) {}
}