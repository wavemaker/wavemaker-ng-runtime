import { Input } from '@angular/core';

/**
 * The wmForm component defines a form in the layout.
 */
export class Form {
    /**
     * Defines the action to be performed on successful submission of the form.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() action: string;
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
     * The encoding type property specifies how the form-data should be encoded when submitting it to the server.
     * <p><em>Allowed Values: </em><code>application/x-www-form-urlencoded, multipart/form-data, text/plain</code></p>
     * <div class="summary">
     * <p><code>application/x-www-form-urlencoded</code><em>: Default. All characters are encoded before sent (spaces are converted to "+" symbols, and special characters are converted to ASCII HEX values)</em></p>
     * <p><code>multipart/form-data</code><em>: No characters are encoded. This value is required when you are using forms that have a file upload control.</em></p>
     * <p><code>text/plain</code><em>: Spaces are converted to "+" symbols, but no special characters are encoded.</em></p>
     */
    @Input() enctype: string;
    /**
     * This message will be displayed, if there is an error during form submit.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() errormessage: string = 'An error occured. Please try again!';
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
    @Input() messagelayout: string = 'Inline';
    /**
     * Defines the method to be used for submission of the form to the server.
     * <p><em>Allowed Values: </em><code>get, post, delete</code></p>
     * <div class="summary">
     * <p><code>get</code><em>: Appends the form-data to the URL in name/value pairs: URL?name=value&name=value.</em></p>
     * <p><code>post</code><em>: Sends the form-data as an HTTP post transaction.</em></p>
     * <p><code>delete</code><em>: Sends the form-data as an HTTP post transaction with DELETE type.</em></p>
     * </div>
     */
    @Input() method: string;
    /**
     * Name of the form widget.
     */
    @Input() name: string;
    /**
     * This message will be displayed, when data is posted by form.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() postmessage: string = 'Data posted successfully';
    /**
     * This property will be used to show/hide the form widget on the web page.
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
     * Defines the target for the form.
     * <p><em>Allowed Values: </em><code>_blank, _self, _parent, _top</code></p>
     * <div class="summary">
     * <p><code>_blank</code><em>: The response is displayed in a new window or tab</em></p>
     * <p><code>_self</code><em>:The response is displayed in the same frame.</em></p>
     * <p><code>_parent</code><em>: The response is displayed in the parent frame.</em></p>
     * <p><code>_top</code><em>: The response is displayed in the full body of the window.</em></p>
     */
    @Input() target: string;
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
     * Callback function which will be triggered when a swipeup event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the widget
     */
    onSwipeup($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a swipedown event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the widget
     */
    onSwipedown($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a swipeleft event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the widget
     */
    onSwipeleft($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a swiperight event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the widget
     */
    onSwiperight($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a pinchin event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the widget
     */
    onPinchin($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a pinchout event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the  widget
     */
    onPinchout($event: TouchEvent, widget: any) {}

    /**
     * Callback is triggered on submit of form and before sending service call. This callback an be used to validate or modify data.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param $data Input data collected from the form widget
     * @returns if the callback returns false, form submit is stopped. Anything else, form submit continues with modified data.
     */
    onBeforesubmit($event: MouseEvent, widget: any, $data: any): void | boolean {}
    /**
     * This event handler is called whenever a submit event is triggered.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param $formData Input data collected from the form widget
     */
    onSubmit($event: MouseEvent, widget: any, $formData: any) {}
    /**
     * This event is called after service call returns response, whether or not the service call was successful.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param $data response returned from the service call
     */
    onResult($event: MouseEvent, widget: any, $data: any) {}
    /**
     * This event handler is called whenever the form submit is success.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param $data response returned from the service call
     */
    onSuccess($event: MouseEvent, widget: any, $data: any) {}
    /**
     * This event handler is called whenever the form submit returns an error.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     * @param $data response returned from the service call
     */
    onError($event: MouseEvent, widget: any, $data: any) {}


    /**
     * This method is used to submit the form.
     */
    submit() {}
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