import { Input } from '@angular/core';

/**
 * The `wmSegmentedControl` directive defines the segmented control widget.
 */
export class SegmentedControl {

    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Name of the Segmented control.
     */
    @Input() name: string;
    /**
     * This property will be used to show/hide the segmented control widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * Callback function which will be triggered when the widget value is changed.
     * @param widget  Instance of the segmented control widget
     * @param $new  Current selected index
     * @param $old  Previous selected index
     */
    onBeforesegmentchange(widget: any, $old: number, $new: number) {}
    /**
     * Callback function which will be triggered when the widget value is changed.
     * @param widget  Instance of the segmented control widget
     * @param $new  Current selected index
     * @param $old  Previous selected index
     */
    onSegmentchange(widget: any, $old: number, $new: number) {}
}