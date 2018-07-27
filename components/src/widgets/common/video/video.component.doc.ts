import { Input } from '@angular/core';

/**
 * The `wmVideo` component defines the video widget.
 */
export class Video {
    /**
     * Title/hint for the video. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * Name of the video widget.
     */
    @Input() name: string;
    /**
     * The property allows to set an image while the video is loading, or until play button is hit. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() poster: string;
    /**
     * The property allows to set the file path of the video/mp4 for the video widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() mp4sourcepath: string;
    /**
     * The property allows to set the file path of the video/ogg for the video widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() oggsourcepath: string;
    /**
     * The property allows to set the file path of the video/WebM for the video widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() webmsourcepath: string;
    /**
     * This property allows to control how the video should be loaded when page loads . <br>
     * <p><em>Allowed Values: </em><code>none - default, metadata, auto</code></p>
     * <div class="summary">
     * <p><code>none - default</code><em>: Restricts the video from loading on page load.</em></p>
     * <p><code>metadata</code><em>: Loads only the metadata on page load.</em></p>
     * <p><code>auto</code><em>: Loads the entire video on page load.</em></p>
     * </div>
     */
    @Input() videopreload: string;
    /**
     * The property allows to set the message when audio file is not supported for the video widget.
     */
    @Input() supportmessage: string;
    /**
     * The property allows to set the source URL for the subtitle in .vtt format. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() subtitlesource: string;
    /**
     * The property allows to set the language for the subtitle of the video widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() subtitlelanguage: string;
    /**
     * This property will be used to show/hide the video widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property will be used to enable controls for video widget on the web page.
     */
    @Input() enablecontrols: boolean = true;
    /**
     * This property will be used to enable how the video should be played when page loads.
     */
    @Input() enableautoplay: boolean = false;
    /**
     * This property will be used to allow the video to be played again, once it is finished.
     */
    @Input() loop: boolean = false;
    /**
     * This property will be used to allow the video output to be muted.
     */
    @Input() mute: boolean = false;
    /**
     * This property specifies the tab order of the Video Widget.
     */
    @Input() tabindex: number = 0;
}