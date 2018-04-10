import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, forwardRef, Injector, OnInit, ViewChild } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './panel.props';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';
import { setCSS, toggleClass } from '@wm/utils';
import { getImageUrl, invokeEventHandler } from '../../utils/widget-utils';

registerProps();

const DEFAULT_CLS = 'app-panel panel';
const WIDGET_CONFIG = {widgetType: 'wm-panel', hostClass: DEFAULT_CLS};

const DEFAULT_TOGGLE_ICON = {'collapse': 'wi-plus', 'expand': 'wi-minus'};

declare const _, $;

/**
 * This is Panel Component
 */
@Component({
    selector: '[wmPanel]',
    templateUrl: './panel.component.html',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => PanelComponent)}
    ]
})
/**
 *
 */
export class PanelComponent extends BaseComponent implements OnInit {
    iconurl: string;
    iconclass: string;
    actions: string;
    title: string;
    subheading: string;
    collapsible: boolean;
    expanded: boolean;
    show: boolean;
    helpClass: string;
    enablefullscreen: boolean;
    fullscreen: boolean;
    height: string;
    $lazyload: Function = _.noop;
    hideFooter;
    collapseicon;
    expandicon;

    @ViewChild('panelHeading') private $panelHeader: ElementRef;
    @ViewChild('panelContent') private $panelContent: ElementRef;

    /**
     * Method: togglePanel
     * @param $event
     */
    togglePanel($event) {
        if (this.collapsible) {
            if (this.expanded) {
                invokeEventHandler(this, 'collapse', {$event});
            } else {
                invokeEventHandler(this, 'expand', {$event});
            }
            this.expanded = !this.expanded;
            this.$lazyload();
        }
    }

    /**
     * returns the tcon class when expand/collapse operations are performed
     * @returns {any}
     */
    get toggleIconClass() {
        if (this.expanded) {
            return this.expandicon || DEFAULT_TOGGLE_ICON.expand
        }
        return this.collapseicon || DEFAULT_TOGGLE_ICON.collapse;
    }

    /**
     * Method: toggleFullScreen
     * @param $event
     */
    toggleFullScreen($event) {
        if (this.enablefullscreen) {
            if (this.fullscreen) {
                invokeEventHandler(this, 'exitfullscreen', {$event});
                toggleClass(this.$element, 'fullscreen', false);
            } else {
                invokeEventHandler(this, 'fullscreen', {$event});
                toggleClass(this.$element, 'fullscreen', true);
            }

            this.fullscreen = !this.fullscreen;
        }
        // Eval content height on toggle of fullscreen
        this._toggleFullScreen();
    }

    /**
     * Method: toggleHelp
     */
    toggleHelp() {
        this.helpClass = this.helpClass ? null : 'show-help';
        toggleClass(this.$element, 'show-help', !!this.helpClass);
    }

    /**
     * Method: closePanel
     * @param $event
     */
    closePanel($event) {
        this.show = false;
        invokeEventHandler(this, 'close', {$event});
    }

    /**
     * method: _toggleFullScreen
     * @private
     */
    private _toggleFullScreen() {
        const headerHeight = this.$panelHeader.nativeElement.offsetHeight,
            $footer = <HTMLElement>this.$element.querySelector('.panel-footer'),
            $content = this.$panelContent.nativeElement.children[0],
            vwHeight = $(window).height();

        let inlineHeight;

        if (this.fullscreen) {
            inlineHeight = (!this.hideFooter && $footer) ? vwHeight - ($footer.offsetHeight + headerHeight) : (vwHeight - headerHeight);
        } else {
            inlineHeight = this.height || '';
        }

        setCSS($content, 'height', inlineHeight);
    }

    /**
     * method: showHeader
     * @returns {string | boolean}
     */
    get showHeader() {
        return this.iconurl || this.iconclass || this.collapsible || this.actions || this.title || this.subheading || this.enablefullscreen;
    }

    /**
     * method: onPropertyChange
     * @param key
     * @param nv
     * @param ov
     */
    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'iconurl':
                this.iconurl = getImageUrl(nv);
                break;
            case 'expanded':
                this.expanded = nv;
                break;
            case 'content':
                if (this.expanded) {
                    setTimeout(() => {
                        this.$lazyload();
                    }, 80);
                }
                break;
        }
    }

    /**
     * Constructor
     * @param {Injector} inj
     * @param {ElementRef} elRef
     * @param {ChangeDetectorRef} cdr
     */
    constructor(inj: Injector, elRef: ElementRef, private cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this, APPLY_STYLES_TYPE.SHELL);
    }

    /**
     * ngOnInit
     */
    ngOnInit() {
        styler(this.$panelContent.nativeElement.children[0], this, APPLY_STYLES_TYPE.INNER_SHELL);
        this.hideFooter = !this.$element.querySelector('[wmPanelFooter]');
        super.ngOnInit();
    }
}
