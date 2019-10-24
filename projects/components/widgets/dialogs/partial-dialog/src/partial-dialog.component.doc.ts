import { Input } from '@angular/core';

/**
 * The wmPagedialog component defines the pagedialog widget.
 */
export class Pagedialog {
    /**
     * This property specifies the title for the pagedialog widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string = 'Page Content';
    /**
     * Name of the pagedialog widget.
     */
    @Input() name: string;
    /**
     * This property specifies the ok button text for the pagedialog widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() oktext: string = 'OK';
    /**
     * This property specifies the tab order of the pagedialog Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * This property specifies if the dialog should behave as a modal or not
     */
    @Input() modal: boolean = false;
    /**
     * This property specifies the content of the pagedialog widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() content: string;
    /**
     * This property specifies if the dialog will have the close icon in header or not
     */
    @Input() closable: boolean = true;
    /**
     * This property specifies if the dialog actions are to be shown or not
     */
    @Input() showactions: boolean = true;
    /**
     * This property specifies the animation applied to the pagedialog widget.
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'bounce', 'fadeIn', 'rotateOut', 'check', etc </code></p>
     */
    @Input() animation: string = '';
    /**
     * This property sets the icon for dialog header.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iconclass: string = 'wi wi-file';
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
     * Callback function which will be triggered when the dialog is loaded.
     * @param widget  Instance of the pagedialog widget
     */
    onLoad(widget: any) {}
    /**
     * Callback function which will be triggered when the ok button for the dialog is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the pagedialog widget
     */
    onOk($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the cancel button for the dialog is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the pagedialog widget
     */
    onCancel($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the dialog is opened.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the pagedialog widget
     */
    onOpen($event: MouseEvent, widget: any) {}
}