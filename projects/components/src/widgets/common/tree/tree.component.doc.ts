import { Input } from '@angular/core';

/**
 * The 'wmTree' directive used to represent data in hierarchical format..
 */
export class Tree {
    /**
     * Name of the tree widget.
     */
    @Input() name: string;
    /**
     * This property specifies the tab order of the Tree Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * This property specifies expand/collapse icons for tree widget. <br>
     * <p><em>Allowed Values: </em><code>folder, plus-minus, circle-plus-minus, chevron, menu, triangle, expand-collapse</code></p>
     */
    @Input() treeicons: string;
    /**
     * This property is used to set depth in terms of the levels of the tree to be expanded by default.
     */
    @Input() levels: number = 0;
    /**
     * Set this property to a variable to populate the list of values to display.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: any = 'node1, node2, node3';
    /**
     * This Property allows user for multiple selection for ordering the display of rows based on fields in ascending or descending order.
     */
    @Input() orderby: string;
    /**
     * This property is used to set label for node.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() nodelabel: string;
    /**
     * This property is used to set icon for node.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() nodeicon: string;
    /**
     * This property is used to set children for particular node.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() nodechildren: string;
    /**
     * This property is used to set id for nodes.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() nodeid: string;
    /**
     * This property is used to set action for particular node.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() nodeaction: string;
    /**
     * This property is used to expand the node when it is clicked.<br>
     * <p><em>Allowed Values: </em><code>Expand node, Do nothing</code></p>
     * <div class="summary">
     * <p><code>Expand node</code><em>: Expands the node.</em></p>
     * <p><code>Horizontal</code><em>: Do nothing.</em></p>
     * </div>
     */
    @Input() nodeclick: string = 'none';
    /**
     * This property will be used to show/hide the tree widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Callback function which will be triggered when the tree node is expanded.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     * @param $item   which provides expanded node details
     * @param $path   which provide expanded node path
     */
    onExpand($event: MouseEvent, widget: any, $item: any, $path: any) {}
    /**
     * Callback function which will be triggered when the tree node is collapsed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     * @param $item   which provides collapsed node details
     * @param $path   which provide collapsed node path
     */
    onCollapse($event: MouseEvent, widget: any, $item: any, $path: any) {}
    /**
     * Callback function which will be triggered when the tree node is selected.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     * @param $item   which provides selected node details
     * @param $path   which provide selected node path
     */
    onSelect($event: MouseEvent, widget: any, $item: any) {}
}