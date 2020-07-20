import { Input, Directive } from '@angular/core';

/**
 * The wmTabs component defines the tabs widget.
 */
@Directive()
export class Tabs {

    /**
     * Class of the widget.
     */
    @Input() class: string;

    /**
     * Name of the tabs widget.
     */
    @Input() name: string;

    /**
     * This property will be used to show/hide the tabs widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

    /**
     * This property determines where the tabs should be displayed w.r.t. the content.
     * <p><em>Allowed Values: </em><code>left, top,right, bottom</code></p>
     * <div class="summary">
     * <p><code>left</code><em>: Tabs will be align at left side of the tabs widget</em></p>
     * <p><code>top</code><em>: Tabs will be align at top of the tabs widget</em></p>
     * <p><code>right</code><em>: Tabs will be align at right side of the tabs widget</em></p>
     * <p><code>bottom</code><em>: Tabs will be align at bottom of the tabs widget</em></p>
     * </div>
     */
    @Input() tabsposition:string = 'top';

    /**
     * This property sets the default active pane on a load of the widget based on the provided index.
     * The tab index is an integer starting from 0, 1, 2 and so on.
     */
    @Input() defaultpaneindex: number = 0;

    /**
     * This property determines how the tabs should be displayed w.r.t. the content
     * <p><em>Allowed Values: </em><code>none, slide</code></p>
     * <div class="summary">
     * <p><code>none</code><em>: There won't be any animations on tabs.</em></p>
     * <p><code>slide</code><em>: Selected tab will be animated into the viewport. Swipe events will work only when the transition value is slide.</em></p>
     * </div>
     */
    @Input() transition: string = 'none';

    /**
     * This property sets placement of content. <br>
     * <p><em>Allowed Values: </em><code>left, right, center</code></p>
     */
    @Input() horizontalalign: string = 'right';

    /**
     * Callback function which will be triggered when the active tab changed from one to another.
     * @param event  Instance of the change event
     * @param widget  Instance of the tabs widget
     * @param newPaneIndex  New tab pane index number
     * @param oldPaneIndex  Old tab pane index number
     */
    onChange(event: Event, widget: any, newPaneIndex:number, oldPaneIndex: number) {}

}