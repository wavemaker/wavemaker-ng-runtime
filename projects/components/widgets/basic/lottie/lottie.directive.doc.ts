import { Input } from '@angular/core';

/**
 * The `wmLottie` directive defines the Lottie widget.
 */

export class Lottie {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Name of the Lottie widget.
     */
    @Input() name: string;
    /**
     * This property specifies the source of Lottie animation.
     */
    @Input() source;
    /**
     * This property specifies the width of Lottie widget.
     */
    @Input() width;
    /**
     * This property specifies the height of Lottie wiget.
     */
    @Input() height;
    /**
     * This property will be used to show/hide the Lottie widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property will be used to play the animation automatically.
     */
    @Input() autoplay: boolean = false;
    /**
     * This property will be used to play the animation repeatedly.
     */
    @Input() loop: boolean = false;

    /**
     * This property will decide the speed at which animation has to be played.<br>
     * Negative level will make the animation to run in reverse.
     */
    @Input() speed: number = 1;
    /**
     * Callback function which will be triggered when the animation is loaded.
     * @param $event  event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    onReady($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the animation is about to start play.
     * @param $event  event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    onPlay($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the animation is paused.
     * @param $event  event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    onPause($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the animation is completed.
     * @param $event  event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    onComplete($event: MouseEvent, widget: any) {}

}