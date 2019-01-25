import { AfterViewInit, Component, HostBinding, Injector, Optional } from '@angular/core';

import { addClass, App, encodeUrl, getRouteNameFromLink, setAttr } from '@wm/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { DISPLAY_TYPE } from '../../framework/constants';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './anchor.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { NavItemDirective } from '../nav/nav-item/nav-item.directive';
import { disableContextMenu } from '../nav/navigation-control.directive';

const DEFAULT_CLS = 'app-anchor';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-anchor',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};

const regex = /Actions.goToPage_(\w+)\.invoke\(\)/g;

@Component({
    selector: 'a[wmAnchor]',
    templateUrl: './anchor.component.html',
    providers: [
        provideAsWidgetRef(AnchorComponent)
    ]
})
export class AnchorComponent extends StylableComponent implements AfterViewInit {
    static initializeProps = registerProps();

    private hasNavigationToCurrentPageExpr: boolean;
    private hasGoToPageExpr: boolean;

    public encodeurl;
    public hyperlink;
    public iconheight: string;
    public iconwidth: string;
    public iconurl: string;
    public iconclass: string;
    public caption: any;
    public badgevalue: string;
    @HostBinding('target') target: string;
    @HostBinding('attr.accesskey') shortcutkey: string;
    @HostBinding('attr.icon-position') iconposition: string;

    constructor(
        inj: Injector,
        @Optional() private navItemRef: NavItemDirective,
        private app: App
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    protected processEventAttr(eventName: string, expr: string, meta?: string) {

        super.processEventAttr(eventName, expr, meta);

        if (!this.hasNavigationToCurrentPageExpr) {
            const app = this.inj.get(App);
            const fns = expr.split(';').map(Function.prototype.call, String.prototype.trim);
            if (fns.some(fn => {
                regex.lastIndex = 0;
                const matches = regex.exec(fn);

                this.hasGoToPageExpr = matches && (matches.length > 0);

                return this.hasGoToPageExpr && matches[1] === app.activePageName;
            })) {
                this.hasNavigationToCurrentPageExpr = true;
            }
        }
    }

    private setNavItemActive() {
        if (this.navItemRef) {
            addClass(this.navItemRef.getNativeElement(), 'active');
        }
    }

    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any, meta?: string) {
        super.handleEvent(
            node,
            eventName,
            e => {
                if (this.hasGoToPageExpr && locals.$event) {
                    locals.$event.preventDefault();
                }
                eventCallback();
            },
            locals,
            meta
        );
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'hyperlink') {
            if (!nv) {
                setAttr(this.nativeElement, 'href', 'javascript:void(0)');
                this.nativeElement.addEventListener('contextmenu', disableContextMenu);
                return;
            }
            if (this.encodeurl) {
                nv = encodeUrl(nv);
            }
            // if hyperlink starts with 'www.' append '//' in the beginning
            if (nv.startsWith('www.')) {
                nv = `//${nv}`;
            }
            setAttr(this.nativeElement, 'href', nv);
            this.nativeElement.removeEventListener('contextmenu', disableContextMenu);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        if (this.hasNavigationToCurrentPageExpr) {
            addClass(this.nativeElement, 'active');
        }
        if (this.navItemRef) {
            setTimeout(() => {
                if (this.hyperlink && getRouteNameFromLink(this.hyperlink) === `/${this.app.activePageName}`) {
                    this.setNavItemActive();
                } else if (this.hasNavigationToCurrentPageExpr) {
                    this.setNavItemActive();
                }
            });
        }

    }
}
