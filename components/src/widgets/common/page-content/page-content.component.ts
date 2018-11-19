import { Component, Injector, OnDestroy } from '@angular/core';

import { App, switchClass } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './page-content.props';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { PullToRefresh } from '../pull-to-refresh/pull-to-refresh';

registerProps();

const DEFAULT_CLS = 'app-page-content app-content-column';
const WIDGET_CONFIG = {widgetType: 'wm-page-content', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmPageContent]',
    templateUrl: './page-content.component.html',
    providers: [
        provideAsWidgetRef(PageContentComponent)
    ]
})
export class PageContentComponent extends StylableComponent implements OnDestroy {
    public pullToRefreshIns: PullToRefresh;
    private pulltorefresh: boolean;
    private childPullToRefresh: boolean;

    constructor(inj: Injector, private app: App) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);

        this.registerDestroyListener(this.app.subscribe('pullToRefresh:enable', () => {
            this.childPullToRefresh = true;
            this.initPullToRefresh();
        }));
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'columnwidth') {
            switchClass(this.nativeElement, `col-md-${nv} col-sm-${nv}`, `col-md-${ov} col-sm-${ov}`);
        } else if (key === 'pulltorefresh' && nv) {
            this.initPullToRefresh();
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    // when list component is ready, pulltorefresh instance is created and this appends pullToRefresh element on the page content.
    private initPullToRefresh() {
        if (!this.pullToRefreshIns && this.childPullToRefresh && this.pulltorefresh) {
            this.pullToRefreshIns = new PullToRefresh($(this.nativeElement), this.app, () => {
                this.app.notify('pulltorefresh');
                this.invokeEventCallback('pulltorefresh');
            });
            this.registerDestroyListener(() => {
                this.pullToRefreshIns.cancelSubscription();
            });
        }
    }
}
