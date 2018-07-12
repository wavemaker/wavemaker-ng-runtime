import { SwipeAnimation } from '@swipey';

import { $appDigest, addClass, isMobile, setCSS, setCSSFromObj } from '@wm/core';

import { TabsComponent } from './tabs.component';

export class TabsAnimator extends SwipeAnimation {

    private _$el;
    private _noOfTabs;

    public constructor(private tabs: TabsComponent) {
        super();
        this._$el = $(this.tabs.getNativeElement()).find('>.tab-content');
        const childEls = this._$el.find('>.tab-pane');
        this._noOfTabs = childEls.length;

        const maxWidth = `${this._noOfTabs * 100}%`;
        addClass(this.tabs.getNativeElement(), 'has-transition');
        setCSSFromObj(this._$el[0], {maxWidth: maxWidth, width: maxWidth});
        const width = `${100 / this._noOfTabs}%`;
        for (const child of Array.from(childEls)) {
            setCSS(child as HTMLElement, 'width', width);
        }
        this.init(this._$el);
    }

    public bounds() {
        const activeTabIndex = this.tabs.getActiveTabIndex(),
            w = this._$el.find('>.tab-pane:first').width(),
            noOfTabs = this._$el.find('>.tab-pane:visible').length,
            centerVal = -1 * activeTabIndex * w;
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

    public transitionTabIntoView() {
        const activeTabIndex = this.tabs.getActiveTabIndex();
        setCSS(this._$el[0], 'transform', `translate3d(${-1 *  activeTabIndex / this._noOfTabs * 100}%, 0, 0)`);
    }

    public onUpper() {
        this.tabs.prev();
        $appDigest();
    }

    public onLower() {
        this.tabs.next();
        $appDigest();
    }

    public threshold() {
        return 5;
    }

}