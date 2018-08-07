import { Input } from '@angular/core';

/**
 * The wmCamera component defines the camera widget.
 */

export class Camera {
    /**
     * Allow simple editing of image before selection.
     */
    @Input() allowedit: boolean = false;
    /**
     * This specifies whether image or video is to be captured. <br>
     * <p><em>Allowed Values: </em><code>IMAGE, VIDEO</code></p>
     * <div class="summary">
     * <p><code>IMAGE</code><em>: To capture a picture.</em></p>
     * <p><code>VIDEO</code><em>: To record a video.</em></p>
     * </div>
     */
    @Input() capturetype: string = 'IMAGE';
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Rotate the image to correct for the orientation of the device during capture.
     */
    @Input() correctorientation: boolean = false;
    /**
     * This property defines the value of the camera widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: string;
    /**
     * This property specifies CSS class of the icon.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iconclass: string = 'wi wi-photo-camera';
    /**
     * This property specifies size of the icon. Value has to be specified along with the units (em or px).
     */
    @Input() iconsize: string = '2em';
    /**
     * Quality of the saved image, expressed as a range of 0-100, where 100 is typically full resolution with no loss from file compression.
     */
    @Input() imagequality: number = 80;
    /**
     * This property specifies the width in px to resize the image.
     */
    @Input() imagetargetwidth: number;
    /**
     * This property specifies the height in px to resize the image.
     */
    @Input() imagetargetheight: number;
    /**
     * Choose the returned image file's encoding.
     * <p><em>Allowed Values: </em><code>JPEG, PNG</code></p>
     * <div class="summary">
     * <p><code>JPEG</code><em>: Encoding of type ".jpeg"</em></p>
     * <p><code>PNG</code><em>: Encoding of type ".png"</em></p>
     * </div>
     */
    @Input() imageencodingtype: string = 'JPEG';
    /**
     * This property specifies how the elements should be aligned horizontally. <br>
     * <p><em>Allowed Values: </em><code>left, center, right</code></p>
     * <div class="summary">
     * <p><code>left</code><em>: Aligns an element to the left.</em></p>
     * <p><code>center</code><em>: Aligns an element to the center.</em></p>
     * <p><code>right</code><em>:  Aligns an element to the right.</em></p>
     * </div>
     */
    @Input() horizontalalign: string;
    /**
     * Name of the camera widget.
     */
    @Input() name: string;
    /**
     * Save the image to the photo album on the device after capture.
     */
    @Input() savetogallery: boolean = false;
    /**
     * This property will be used to show/hide the camera widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This event handler is called whenever a success event is triggered.
     * @param $event DOM event on which call back is triggered
     * @param localFilePath URL of the file
     * @param localFile File object
     * @param widget Instance of the widget
     */
    onSuccess($event: MouseEvent, widget: any, localFilePath: string, localFile: any) {}
}