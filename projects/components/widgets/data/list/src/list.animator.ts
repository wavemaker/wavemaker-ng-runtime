import { QueryList } from '@angular/core';
import { Subscription } from 'rxjs';

import { SwipeAnimation } from '@swipey';
import { ButtonComponent } from '@wm/components/input';

import { ListComponent } from './list.component';

declare  const _, $;

export class ListAnimator extends SwipeAnimation {
    private $el: JQuery<HTMLElement>;
    private li: JQuery<HTMLElement>;
    private limit: number;
    private transitionProportions: any;
    private rightChildrenCount: number;
    private leftChildrenCount: number;
    private position: string;
    private actionPanel: JQuery<HTMLElement>;
    private actionItems: QueryList<ButtonComponent>;
    public $btnSubscription: Subscription;

    constructor(private list: ListComponent) {
        super();
        this.$el = $(this.list.getNativeElement()).find('ul.app-livelist-container').first();

        this.leftChildrenCount = this.$el.find('>.app-list-item-left-action-panel > button:visible').length;
        this.rightChildrenCount = this.$el.find('>.app-list-item-right-action-panel > button:visible').length;

        // when there are no children in both the templates then do not apply swipeAnimation;
        if (!this.leftChildrenCount && !this.rightChildrenCount) {
            return;
        }

        // initialise swipe animation on the list component.
        this.init(this.$el);

        // retrieves all the button components which are placed outside the listTemplate.
        this.$btnSubscription = this.list.btnComponents.changes.subscribe(items => this.actionItems = items);
    }

    // This method sets the css for left or right action panels based on the template. Appends the actionTemplate before li.
    private createActionPanel(li: JQuery<HTMLElement>, actionPanelTemplate: JQuery<HTMLElement>): JQuery<HTMLElement> {
        actionPanelTemplate.css({
            width: li.outerWidth() + 'px',
            height: li.outerHeight() + 'px',
            marginBottom: -1 * li.outerHeight() + 'px',
            float: 'left',
            padding: 0
        });

        return actionPanelTemplate.insertBefore(li);
    }

    // Returns the total width occupied by all the children inside the element
    private computeTotalChildrenWidth($ele: JQuery<HTMLElement>): number {
        return _.reduce($ele.children(), (totalWidth, el) => {
            return totalWidth + $(el).outerWidth();
        }, 0);
    }

    // Returns amount of transition to be applied on element when swiped left or right
    private computeTransitionProportions($ele: JQuery<HTMLElement>): number {
        const totalWidth = this.computeTotalChildrenWidth($ele);
        const reverse = this.position === 'right';
        let d = 0;
        return _.map($ele.children(), e => {
            const f = (totalWidth - d) / totalWidth;
            d += $(e).outerWidth();
            return reverse ? f : (d / totalWidth);
        });
    }

    // Resets the transform applied on the element.
    private resetElement(el: JQuery<HTMLElement>): void {
        if (el) {
            el.css({
                transform: 'none',
                transition: 'none'
            });
        }
    }

    private resetState(): void {
        this.resetElement(this.li);
        this.resetElement(this.actionPanel);
        if (this.actionPanel) {
            this.actionPanel = null;
        }
    }

    // Returns the target button (child element) inside the left and right actionPanels.
    private getChildActionElement(actionTemplate): JQuery<HTMLElement> {
        if (actionTemplate.children().length) {
            if (this.position === 'left') {
                return actionTemplate.children().first();
            }
            return actionTemplate.children().last();
        }
    }

    // create the actionPanels and set the background-color for remaining panel as that of first child element
    // calculates the children's width and its transition proportionates.
    private initActionPanel(actionTemplate: JQuery<HTMLElement>): void {
        this.actionPanel = this.createActionPanel(this.li, actionTemplate);
        this.actionPanel.css({
            backgroundColor: this.getChildActionElement(this.actionPanel).css('background-color')
        });
        this.limit = this.computeTotalChildrenWidth(this.actionPanel);
        this.transitionProportions = this.computeTransitionProportions(this.actionPanel);
    }

    public bounds(e?: any, $d?: number): any {
        const target = $(e.target).closest('li');
        // default bounds when action template markup is not available.
        let bounds: {} = {
            strictUpper: true,
            strictLower: true,
            lower: 0,
            center: 0,
            upper: 0
        };
        // apply swipe animation only on list items having "app-list-item" class.
        if (!target.hasClass('app-list-item')) {
            return bounds;
        }
        if (!this.li || this.li[0] !== target[0]) {
            let selector =  $d > 0 ? '.app-list-item-left-action-panel' : '.app-list-item-right-action-panel';
            let actionTemplate = this.$el.find('>' + selector);

            // when groupby is set select the action panel from the list group items.
            if (!actionTemplate.length && this.list.groupby) {
                selector = 'li > ul.list-group >' + selector;
                actionTemplate = this.$el.find('>' + selector);
            }

            // check for children visiblity. If children are visible then initiate the action panel.
            if (!actionTemplate.length || !actionTemplate.find('button:visible').length) {
                return bounds;
            }

            this.resetState();
            this.li = target;

            this.position = actionTemplate.attr('position');
            this.initActionPanel(actionTemplate);

            if ($d > 0) {
                // bounds while swiping from right to left to open left action panel. It can be moved upto limit value (Upper bound).
                bounds = {
                    strictUpper: false,
                    lower: 0,
                    center: 0,
                    upper: this.limit
                };
            } else {
                // bounds while swiping from left to right to open right action panel. It can be moved in reverse direction with -limit value (lower bound).
                bounds = {
                    strictLower: false,
                    lower: -this.limit,
                    center: 0,
                    upper: 0
                };
            }
        } else if (this.position === 'left') {
            // when left action panel is visible (i.e. center at limit value) then this can be moved by distance (limit) in reverse direction to close the view.
            bounds = {
                strictUpper: false,
                lower: -this.limit,
                center: this.limit
            };
        } else if (this.position === 'right') {
            // when right action panel is visible (i.e. center at -limit value) then this can be moved by distance (limit) to close the view.
            bounds = {
                center: -this.limit,
                upper: this.limit,
                strictLower: false
            };
        }
        return bounds;
    }

    public context(): any {
        return {
            computeActionTransition: (index: number, $d: number): number => {
                const sign = $d > 0 ? 1 : -1;

                if (sign * $d > this.limit) {
                    // once the distance swiped is beyond the limit, then calculate the proportionate distance moved after the limit value.
                    return ($d - sign * this.limit) + (this.transitionProportions[index] * sign * this.limit);
                }
                return this.transitionProportions[index] * $d;
            }
        };
    }

    public animation(): any {
        return [{
            target: () => this.li,
            css: {
                transform: 'translate3d(${{$D + $d}}px, 0, 0)'
            }
        }, { // styles to be applied on the child elements of action panel
            target: () => (this.actionPanel && this.actionPanel.children()),
            css: {
                transform: 'translate3d(${{computeActionTransition($i, $D + $d)}}px, 0, 0)'
            }
        }];
    }

    // Triggers full swipe event on the target element.
    public invokeFullSwipeEvt($event: Event): void {
        let target, actions, index;
        // Check if button are visible or not, invoke the tap event of the last button which is visible.
        if (this.position === 'left') {
            actions = this.actionItems.filter(btn => {
                return btn.getAttr('swipe-position') === 'left' && btn.$element.is(':visible');
            });
            index = 0;
        } else {
            actions = this.actionItems.filter(btn => {
                return btn.getAttr('swipe-position') === 'right' && btn.$element.is(':visible');
            });
            index = actions.length - 1;
        }
        target = actions[index];
        if (target && target.hasEventCallback('tap')) {
            target.invokeEventCallback('tap', {$event});
        }
        this.resetState();
        this.li = null;
    }

    // Called when swipeEnd is triggered. d contains the total distance covered by the element until touchEnd.
    public onAnimation($event: Event, d: number): void {
        // set the selecteditem on the list component on swipe.
        this.list.triggerListItemSelection(this.li, $event);
        if (this.actionPanel && this.actionPanel.attr('enablefullswipe') === 'true') {
            const sign = d > 0 ? 1 : -1;
            const $el = this.getChildActionElement(this.actionPanel);
            if ($el) {
                const index = this.position === 'right' ? this.rightChildrenCount - 1 : 0;
                // proportionate amount of distance covered by the target element.
                const distPercentage = this.transitionProportions[index] * sign * d * 100 / (this.li.outerWidth() - this.limit + $el.width());

                // If distance travelled by the target button element is more than 50% of the list item width then invoke the fullswipe.
                if (distPercentage > 50) {
                    // invoke fullswipe event
                    this.invokeFullSwipeEvt($event);
                }
            }
        }
    }

    public onLower(): void {
        if (this.position === 'left') {
            this.resetState();
            this.li = null;
        }
    }

    public onUpper(): void {
        if (this.position === 'right') {
            this.resetState();
            this.li = null;
        }
    }

    public threshold(): number {
        return 10;
    }
}
