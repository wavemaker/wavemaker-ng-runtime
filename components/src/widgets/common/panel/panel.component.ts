import { AfterContentInit, Component, ContentChildren, ElementRef, forwardRef, Inject, Injector, OnInit, ViewChild } from '@angular/core';

import { AppLocale, noop, setCSS, toggleClass } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IWidgetConfig, WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './panel.props';
import { RedrawableDirective } from '../redraw/redrawable.directive';

registerProps();

const DEFAULT_CLS = 'app-panel panel';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-panel', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmPanel]',
    templateUrl: './panel.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => PanelComponent)}
    ]
})

export class PanelComponent extends StylableComponent implements OnInit, AfterContentInit {

    public $lazyLoad = noop;
    public iconurl: string;
    public iconclass: string;
    public collapsible: boolean;
    public expanded: boolean = true;
    public enablefullscreen: boolean;
    public fullscreen: boolean;
    public title: string;
    public subheading: string;
    public actions: any;

    private helpClass: string;
    private fullScreenTitle: string;
    private expandCollapseTitle: string;

    @ViewChild('panelHeading') private panelHeader: ElementRef;
    @ViewChild('panelContent') private panelContent: ElementRef;
    @ContentChildren(RedrawableDirective, {descendants: true}) reDrawableComponents;

    private hasFooter: boolean;

    // conditions to show the footer
    protected get hideFooter () {
        return !this.hasFooter || !this.expanded;
    }

    // conditions to show header
    protected get showHeader() {
        return this.iconurl || this.iconclass || this.collapsible || this.actions || this.title || this.subheading || this.enablefullscreen;
    }

    constructor(inj: Injector, @Inject(AppLocale) private appLocale: any) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SHELL);

        this.fullScreenTitle = `${this.appLocale.LABEL_FULLSCREEN}/${this.appLocale.LABEL_EXITFULLSCREEN}`;
        this.expandCollapseTitle = `${appLocale.LABEL_COLLAPSE}/${appLocale.LABEL_EXPAND}`;
    }

    // toggle the panel state between collapsed - expanded. invoke the respective callbacks
    protected togglePanel($event) {
        if (this.collapsible) {
            this.invokeEventCallback(this.expanded ? 'collapse' : 'expand', {$event});
            this.expanded = !this.expanded;
            if (this.expanded) {
                this.$lazyLoad();
                this.reDrawChildren();
            }
        }
    }

    // toggle the fullscreen state of the panel. invoke the respective callbacks
    protected toggleFullScreen($event) {
        if (this.enablefullscreen) {
            this.invokeEventCallback(this.fullscreen ? 'exitfullscreen' : 'fullscreen', {$event});
            this.fullscreen = !this.fullscreen;
            toggleClass(this.nativeElement, 'fullscreen', this.fullscreen);
        }
        this.computeDimensions();
    }

    // show/hide help
    protected toggleHelp() {
        this.helpClass = this.helpClass ? null : 'show-help';
        toggleClass(this.nativeElement, 'show-help', !!this.helpClass);
    }

    // hide the panel and invoke the respective event handler
    protected closePanel($event) {
        this.getWidget().show = false;
        this.invokeEventCallback('close', {$event});
    }

    // calculation of dimensions when the panel the panel state changes from/to fullscreen
    private computeDimensions() {
        const headerHeight = this.panelHeader.nativeElement.offsetHeight;
        const footer = this.nativeElement.querySelector('.panel-footer') as HTMLElement;
        const content = this.panelContent.nativeElement.children[0];
        const vHeight = window.outerHeight;

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

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'expanded':
                this.expanded = nv;
                break;
            case 'content':
                if (this.expanded) {
                    setTimeout(() => this.$lazyLoad, 50);
                }
                break;
        }
    }

    ngAfterContentInit() {
        this.hasFooter = !!this.nativeElement.querySelector('[wmPanelFooter]');
        styler(this.panelContent.nativeElement.querySelector('.panel-body') as HTMLElement, this, APPLY_STYLES_TYPE.INNER_SHELL);
    }
}

//Todo Vinay - menu, action click event
