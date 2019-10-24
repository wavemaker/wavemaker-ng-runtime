import { AfterViewInit, Component, HostBinding, Injector, OnDestroy, Optional } from '@angular/core';

import {addClass, App, encodeUrl, EventNotifier, getRouteNameFromLink, setAttr} from '@wm/core';
import { DISPLAY_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';

import { registerProps } from './anchor.props';

const DEFAULT_CLS = 'app-anchor';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-anchor',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};

const regex = /Actions.goToPage_(\w+)\.invoke\(\)/g;
export const disableContextMenu = ($event: Event) => {
    $event.preventDefault();
};

@Component({
    selector: 'a[wmAnchor]',
    templateUrl: './anchor.component.html',
    providers: [
        provideAsWidgetRef(AnchorComponent)
    ]
})
export class AnchorComponent extends StylableComponent implements AfterViewInit, OnDestroy {
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
    private _eventNotifier = new EventNotifier(false);

    constructor(
        inj: Injector,
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

    public onActive(callback: (data: any) =>void) {
        this._eventNotifier.subscribe('on-active', callback);
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
        setTimeout(() => {
            if (this.hyperlink && getRouteNameFromLink(this.hyperlink) === `/${this.app.activePageName}`
                || this.hasNavigationToCurrentPageExpr) {
                this._eventNotifier.notify("on-active", {});
            }
        });

    }

    public ngOnDestroy() {
        this._eventNotifier.destroy();
    }
}
