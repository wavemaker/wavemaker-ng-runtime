import { SwipeAnimation } from '@swipey';

import { $appDigest, addClass, setCSS, setCSSFromObj } from '@wm/core';

import { TabsComponent } from './tabs.component';

declare const $;

export class TabsAnimator extends SwipeAnimation {

    private _$el;

    public constructor(private tabs: TabsComponent) {
        super();
        this._$el = $(this.tabs.getNativeElement()).find('>.tab-content');
        this.init(this._$el);
    }

    public calibrate() {
        const activeTabIndex = this.tabs.getActiveTabIndex();
        const panes = this._$el.find('>.tab-pane');
        let activeTabVisibleIndex = 0;
        let noOfVisiblePanes = 0;
        let visiblePanes = [];
        panes.each((i, p) => {
            if (!$(p).prop('hidden')) {
                noOfVisiblePanes++;
                if (i === activeTabIndex) {
                    activeTabVisibleIndex = noOfVisiblePanes - 1;
                }
                visiblePanes.push(p);
            }
            return true;
        });
        return {
            activeTabIndex: activeTabVisibleIndex,
            noOfTabs: noOfVisiblePanes,
            panes: visiblePanes
        };
    }

    public bounds() {
        const {activeTabIndex, noOfTabs, panes} = this.calibrate(),
            w = $(panes[0]).width(),
            centerVal = -1 * activeTabIndex * w;
        this.clearContentFocus();
        return {
            strict: false,
            lower: activeTabIndex === noOfTabs - 1 ? 0 : -w,
            center: centerVal,
            upper: activeTabIndex === 0 ? centerVal : w
        };
    }

    public context() {
        return {
            'w': this._$el.width()
        };
    }

    public animation() {
        return {
            'transform': 'translate3d(${{ ($D + $d)/w * 100 + \'%\'}}, 0, 0)',
            '-webkit-transform': 'translate3d(${{ ($D + $d)/w * 100 + \'%\'}}, 0, 0)'
        };
    }
    /* WMS-18031 | On Tab Switch | Remove the Focus on the Existing Tab Contents */
    private clearContentFocus() {
        let activeTab = this._$el.find('>.tab-pane.active');
        if(activeTab.length && activeTab.find(document.activeElement).length){
            (document.activeElement as HTMLElement).blur();
        }
    }
    public transitionTabIntoView() {
        const {activeTabIndex, noOfTabs, panes} = this.calibrate();
        const maxWidth = `${noOfTabs * 100}%`;
        setCSSFromObj(this._$el[0], {maxWidth: maxWidth, width: maxWidth});
        addClass(this.tabs.getNativeElement(), 'has-transition');
        const width = `${100 / noOfTabs}%`;
        panes.forEach(p => {
            setCSS(p as any, 'width', width);
        });
        setCSS(this._$el[0], 'transform', `translate3d(${-1 *  activeTabIndex / noOfTabs * 100}%, 0, 0)`);
    }

    public onUpper($event?: Event) {
        this.tabs.prev($event);
        $appDigest();
    }

    public onLower($event?: Event) {
        this.tabs.next($event);
        $appDigest();
    }

    public threshold() {
        return 5;
    }
}
