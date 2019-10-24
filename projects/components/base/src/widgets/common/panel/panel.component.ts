import { AfterContentInit, Component, ContentChildren, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';

import { $appDigest, noop, removeAttr, setCSS, toggleClass } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { registerProps } from './panel.props';
import { RedrawableDirective } from '../redraw/redrawable.directive';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { MenuAdapterComponent } from '../base/menu-adapator.component';

const DEFAULT_CLS = 'app-panel panel';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-panel', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmPanel]',
    templateUrl: './panel.component.html',
    providers: [
        provideAsWidgetRef(PanelComponent)
    ]
})

export class PanelComponent extends MenuAdapterComponent implements OnInit, AfterContentInit {
    static initializeProps = registerProps();

    public $lazyLoad = noop;
    public iconurl: string;
    public iconclass: string;
    public collapsible: boolean;
    public expanded = true;
    public enablefullscreen: boolean;
    public fullscreen: boolean;
    public title: string;
    public subheading: string;
    public actions: any;

    public helpClass = '';
    public helptext = '';
    private fullScreenTitle: string;
    private expandCollapseTitle: string;

    @ViewChild('panelHeading') private panelHeader: ElementRef;
    @ViewChild('panelContent') private panelContent: ElementRef;
    @ViewChild('panelBody') private panelBody: ElementRef;
    @ContentChildren(RedrawableDirective, {descendants: true}) reDrawableComponents;

    private hasFooter: boolean;

    // conditions to show the footer
    public get hideFooter () {
        return !this.hasFooter || !this.expanded;
    }

    // conditions to show header
    public get showHeader() {
        return this.iconurl || this.iconclass || this.collapsible || this.actions || this.title || this.subheading || this.enablefullscreen;
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SHELL);

        this.fullScreenTitle = `${this.appLocale.LABEL_FULLSCREEN}/${this.appLocale.LABEL_EXITFULLSCREEN}`;
        this.expandCollapseTitle = `${this.appLocale.LABEL_COLLAPSE}/${this.appLocale.LABEL_EXPAND}`;
        removeAttr(this.nativeElement, 'title');
    }

    // toggle the panel state between collapsed - expanded. invoke the respective callbacks
    public toggle($event) {
        if (this.collapsible) {
            this.invokeEventCallback(this.expanded ? 'collapse' : 'expand', {$event});
            this.expanded = !this.expanded;
            if (this.expanded) {
                this.$lazyLoad();
                this.reDrawChildren();
            }
        }
    }

    public expand($event) {
        if (!this.expanded) {
            this.toggle($event);
        }
    }

    public collapse($event) {
        if (this.expanded) {
            this.toggle($event);
        }
    }

    // toggle the fullscreen state of the panel. invoke the respective callbacks
    protected toggleFullScreen($event) {
        if (this.enablefullscreen) {
            this.invokeEventCallback(this.fullscreen ? 'exitfullscreen' : 'fullscreen', {$event});
            this.fullscreen = !this.fullscreen;
            toggleClass(this.nativeElement, 'fullscreen', this.fullscreen);
            // Re-plot the widgets inside panel
            this.reDrawChildren();
        }
        this.computeDimensions();
    }

    // show/hide help
    protected toggleHelp() {
        this.helpClass = this.helpClass ? '' : 'show-help';
        toggleClass(this.nativeElement, 'show-help', !!this.helpClass);
        $appDigest();
    }

    // hide the panel and invoke the respective event handler
    protected close($event) {
        this.getWidget().show = false;
        this.invokeEventCallback('close', {$event});
    }

    // calculation of dimensions when the panel the panel state changes from/to fullscreen
    private computeDimensions() {
        const headerHeight = this.panelHeader.nativeElement.offsetHeight;
        const footer = this.nativeElement.querySelector('.panel-footer') as HTMLElement;
        const content = this.panelContent.nativeElement;
        const vHeight = window.innerHeight;

        let inlineHeight;

        if (this.fullscreen) {
            inlineHeight = this.hideFooter ?  (vHeight - headerHeight) : vHeight - (footer.offsetHeight + headerHeight);
        } else {
            inlineHeight = this.height || '';
        }

        setCSS(content, 'height', inlineHeight);
    }

    // notify the redrawable components(charts, grid)
    private reDrawChildren() {
        setTimeout(() => {
            if (this.reDrawableComponents) {
                this.reDrawableComponents.forEach(c => c.redraw());
            }
        }, 100);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'expanded') {
            this.expanded = nv;
        } else if (key === 'content') {
            setTimeout(() => {
                if (this.expanded || !this.collapsible) {
                    this.$lazyLoad();
                }
            }, 20);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    ngAfterContentInit() {
        super.ngAfterContentInit();
        this.hasFooter = !!this.nativeElement.querySelector('[wmPanelFooter]');
        styler(this.panelBody.nativeElement as HTMLElement, this, APPLY_STYLES_TYPE.INNER_SHELL);
    }
}
