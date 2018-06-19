import { SwipeAnimation } from '@swipey';

import { $appDigest } from '@wm/core';

import { TabsComponent } from './tabs.component';

export class TabsAnimator extends SwipeAnimation {

    private _$el;

    public constructor(private tabs: TabsComponent) {
        super();
        this._$el = $(this.tabs.getNativeElement()).find('>.tab-content');
        this.init(this._$el);
    }

    public bounds() {
        const activeTabIndex = this.tabs.getActivePaneIndex(),
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

    public onUpper() {
        this.tabs.selectPrev();
        $appDigest();
    }

    public onLower() {
        this.tabs.selectNext();
        $appDigest();
    }

    public threshold() {
        return 5;
    }

}