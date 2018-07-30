import { Input } from '@angular/core';

/**
 * The wmFileUpload component defines the file upload widget.
 */
export class FileUpload {
    /**
     * Caption/Label for the fileupload widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() caption: string;
    /**
     * Name of the fileupload widget.
     */
    @Input() name: string;
    /**
     * Title/hint for the fileupload widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * This property specifies the tab order of the fileupload Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * If set to true, multiple file upload is enabled. By default single file upload is enabled
     */
    @Input() multiple: boolean = false;
    /**
     * This property allows user to set message of the Fileuplaod widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() fileuploadmessage: string = 'You can also browse for files';
    /**
     * This property will be used to show/hide the fileupload widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property will be used to disable/enable the fileupload widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
    /**
     * This property specifies the content types that are allowed to be uploaded. <br>
     * <p><em>Allowed Values: </em><code>zip, pdf, rar, txt, ppt, pot, pps, pptx, potx, ppsx, mpg, mp4, mov, avi, mp3, docx, js, md, html, css, xlsx, png, jpg, jpeg, file, default</code></p>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() contenttype: string;
    /**
     * This property specifies the max file size that can be uploaded. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() maxfilesize: number;
    /**
     * CSS class of the icon.
     */
    @Input() iconclass: string = 'wi wi-file-upload';

    /**
     * Callback function which will be triggered before the file is selected.
     * @param $event        DOM event on which call back is triggered
     * @param widget        Instance of the Fleupload widget
     * @param selectedFiles List of selected files
     */
    beforeselect($event: MouseEvent, widget: any, selectedFiles: any) {}
    /**
     * Callback function which will be triggered when the file is selected.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the Fleupload widget
     * @param files List of files to be selected
     */
    select($event: MouseEvent, widget: any, files: any) {}
}