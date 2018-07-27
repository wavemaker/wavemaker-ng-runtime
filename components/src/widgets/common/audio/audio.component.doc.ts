import { Input } from '@angular/core';

/**
 * The `wmAudio` component defines the audio widget.
 */
export class Audio {
    /**
     * Title/hint for the audio. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * Name of the audio widget.
     */
    @Input() name: string;
    /**
     * The property allows to set the file path of the mp3 for the audio widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() mp3sourcepath: string;
    /**
     * This property allows to control how the audio should be loaded when page loads . <br>
     * <p><em>Allowed Values: </em><code>none - default, metadata, auto</code></p>
     * <div class="summary">
     * <p><code>none - default</code><em>: Restricts the audio from loading on page load.</em></p>
     * <p><code>metadata</code><em>: Loads only the metadata on page load.</em></p>
     * <p><code>auto</code><em>: Loads the entire audio on page load.</em></p>
     * </div>
     */
    @Input() audiopreload: string;
    /**
     * The property allows to set the message when audio file is not supported for the audio widget.
     */
    @Input() supportmessage: string;
    /**
     * This property will be used to show/hide the audio widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property will be used to enable controls for audio widget on the web page.
     */
    @Input() enablecontrols: boolean = true;
    /**
     * This property will be used to enable how the audio should be played when page loads.
     */
    @Input() enableautoplay: boolean = false;
    /**
     * This property will be used to allow the audio to be played again, once it is finished.
     */
    @Input() loop: boolean = false;
    /**
     * This property will be used to allow the audio output to be muted.
     */
    @Input() mute: boolean = false;
    /**
     * This property specifies the tab order of the Audio Widget.
     */
    @Input() tabindex: number = 0;
}