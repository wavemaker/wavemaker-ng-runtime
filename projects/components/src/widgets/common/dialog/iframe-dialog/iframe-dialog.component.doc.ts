import { Input } from '@angular/core';

/**
 * The wmIFramedialog component defines the iframedialog widget.
 */
export class IFramedialog {
    /**
     * This property specifies the title for the iframedialog widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string = 'External Content';
    /**
     * Name of the iframedialog widget.
     */
    @Input() name: string;
    /**
     * This property specifies the ok button text for the iframedialog widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() oktext: string = 'OK';
    /**
     * This property specifies the tab order of the iframedialog Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * This property specifies if the header of the dialog should be shown or not
     */
    @Input() showheader: boolean = true;
    /**
     * This property specifies the url which is to be loaded in the iframe dialog. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() url: string = 'http://www.wavemaker.com';
    /**
     * This property specifies if the dialog should behave as a modal or not
     */
    @Input() modal: boolean = false;
    /**
     * This property specifies if the dialog will have the close icon in header or not
     */
    @Input() closable: boolean = true;
    /**
     * This property specifies if the dialog actions are to be shown or not
     */
    @Input() showactions: boolean = true;
    /**
     * This property specifies the animation applied to the iframedialog widget.
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'bounce', 'fadeIn', 'rotateOut', 'check', etc </code></p>
     */
    @Input() animation: string = '';
    /**
     * This property specifies if you want the provided URL to be encoded at run time.
     */
    @Input() encodeurl: boolean = false;
    /**
     * This property sets the icon for dialog header.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iconclass: string = 'wi wi-globe';
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
     * @param widget  Instance of the iframedialog widget
     */
    onOk($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the close button for the dialog is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the iframedialog widget
     */
    onClose($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the dialog is opened.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the iframedialog widget
     */
    onOpen($event: MouseEvent, widget: any) {}
}