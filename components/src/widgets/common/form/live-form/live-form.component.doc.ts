import { Input } from '@angular/core';

/**
 * The wmLiveForm component defines a live-form in the layout.
 */
export class LiveForm {
    /**
     * Enabling this property turns on auto-completion in the editor. As the user types into the pull-down select editor, the choices change dynamically.
     */
    @Input() autocomplete: boolean = false;
    /**
     * Defines the alignment of the caption elements of widgets inside the form.
     * <p><em>Allowed Values: </em><code>left, center, right</code></p>
     * <div class="summary">
     * <p><code>left</code><em>: Caption is aligned to left.</em></p>
     * <p><code>center</code><em>: Caption is aligned in center.</em></p>
     * <p><code>right</code><em>: Caption is aligned to right.</em></p>
     */
    @Input() captionalign: string = 'left';
    /**
     * Defines the position of the caption elements of widgets inside the form.
     * <p><em>Allowed Values: </em><code>left, top, right</code></p>
     * <div class="summary">
     * <p><code>left</code><em>: Caption is positioned to left of form widget.</em></p>
     * <p><code>top</code><em>: Caption is positioned on top of form widget.</em></p>
     * <p><code>right</code><em>: Caption is positioned to right of form widget.</em></p>
     */
    @Input() captionposition: string = 'left';
    /**
     * Accepts integer(x) between 1-12 and adds class col-xs-(x) for mobile, col-sm-(x) for Tablet Potrait, col-md-(x) for Laptop Tablet Landscape , col-lg-(x) for Large screen to suit bootstrap fluid grid system.
     */
    @Input() captionwidth: string = 'xs-12 sm-3 md-3 lg-3';
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Enable control for collapsing and expanding the widget.
     */
    @Input() collapsible: boolean = false;
    /**
     * This property specifies the datasource to which values of form are submitted.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: any;
    /**
     * This property controls whether live form is in view or edit mode when form is opened
     * <p><em>Allowed Values: </em><code>Edit, View</code></p>
     * <div class="summary">
     * <p><code>Edit</code><em>: Live Form is opened in edit mode.</em></p>
     * <p><code>View</code><em>: Live Form is opened in view mode.</em></p>
     * </div>
     */
    @Input() defaultmode: string = 'View';
    /**
     * Set the default state of the form whether it is expanded or collapsed.
     */
    @Input() expanded: boolean = false;
    /**
     * Default data to show in the form on load.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() formdata: any;
    /**
     * CSS class of the icon showed in form header.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iconclass: string;
    /**
     * This property decides the appearance of the success/error message after submit operation.
     * <p><em>Allowed Values: </em><code>Inline, Toaster</code></p>
     * <div class="summary">
     * <p><code>Inline</code><em>: Message is shown at the top of the form widget.</em></p>
     * <p><code>Toaster</code><em>: Message is shown in the toaster.</em></p>
     * </div>
     */
    @Input() messagelayout: string = 'Toaster';
    /**
     * Name of the form widget.
     */
    @Input() name: string;
    /**
     * This property will be used to show/hide the button widget on the web page.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean;
    /**
     * This property defines the sub heading or title for the widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() subheading: string;
    /**
     * This property specifies the tab order of the Form Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * Title of the form.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string;
    /**
     * This property defines the type of validation applied on the form.
     * <p><em>Allowed Values: </em><code>default, html, none</code></p>
     * <div class="summary">
     * <p><code>default</code><em>: Inline validations are applied on form submit.</em></p>
     * <p><code>html</code><em>: HTML 5 validations are applied on form submit.</em></p>
     * <p><code>none</code><em>: Validations are disabled on form.</em></p>
     * </div>
     * */
    @Input() validationtype: string = 'default';
    /**
     * This message will be displayed, when data is inserted by liveform.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() insertmessage: string = 'Record added successfully';
    /**
     * This message will be displayed, when data is updated by liveform.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() updatemessage: string = 'Record updated successfully';
    /**
     * his message will be displayed, when data is deleted by liveform.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() deletemessage: string = 'Record deleted successfully';
    /**
     * This message will be displayed, if there is an error during form submit.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() errormessage: string = 'An error occured. Please try again!';

    /**
     * Callback is triggered on save of form and before sending service call. This callback an be used to validate or modify data.
     * @param $event DOM event on which call back is triggered
     * @param $operation current operation being performed on form - update/insert/delete
     * @param $data Input data collected from the form widget
     * @param options extra options can be passed by user here. Ex: setting options.period = true will send temporal call
     * @returns if the callback returns false, form submit is stopped. Anything else, form submit continues with modified data.
     */
    beforeservicecall($event: MouseEvent, $operation: string, $data: any, options: any): void | boolean {}
    /**
     * This event is called after service call returns response, whether or not the service call was successful.
     * @param $event DOM event on which call back is triggered
     * @param $operation current operation being performed on form - update/insert/delete
     * @param $data response returned from the service call
     */
    result($event: MouseEvent, $operation: string, $data: any) {}
    /**
     * This event handler is called whenever the form submit is success.
     * @param $event DOM event on which call back is triggered
     * @param $operation current operation being performed on form - update/insert/delete
     * @param $data response returned from the service call
     */
    success($event: MouseEvent, $operation: string, $data: any) {}
    /**
     * This event handler is called whenever the form submit returns an error.
     * @param $event DOM event on which call back is triggered
     * @param $operation current operation being performed on form - update/insert/delete
     * @param $data response returned from the service call
     */
    error($event: MouseEvent, $operation: string, $data: any) {}


    /**
     * This method is used to submit the form.
     */
    submit() {}
    /**
     * This method is used to edit the form. Form will go into edit mode.
     */
    edit() {}
    /**
     * This method is used to cancel the current operation.
     */
    cancel() {}
    /**
     * This method is used to open a new form.
     */
    new() {}
    /**
     * This method is used to delete a record in the form.
     */
    delete() {}
    /**
     * This method is used to save the form.
     * @param event submit DOM event
     * @param updateMode default update mode of the form
     * @param newForm If true, new form is opened on save success
     * /
    save(event?, updateMode?, newForm?) {}
    /**
     * This method is used to save the form and open new form on save success.
     */
    saveAndNew() {}
    /**
     * This method is used to save the form and open the view mode of form on save success.
     */
    saveAndView() {}
    /**
     * This method is used to reset the form.
     */
    reset() {}
    /**
     * This method is used to clear the message in the form in case of inline message layout.
     */
    clearMessage() {}
    /**
     * This method is used to show the message in the form.
     * @param show Show or hide the message
     * @param msg message content
     * @param type type of the message - error, success, info or warning
     * @param header title of the message
     */
    toggleMessage(show: boolean, msg?: string, type?: string, header?: string) {}
    /**
     * This method loops through the form fields and highlights the invalid fields by setting state to touched.
     */
    highlightInvalidFields() {}
}