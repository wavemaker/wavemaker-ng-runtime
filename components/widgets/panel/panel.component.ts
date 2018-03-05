import { Component, Output, EventEmitter, ViewChild, ElementRef, Injector, ChangeDetectorRef, forwardRef, OnInit } from '@angular/core';
import { BaseComponent } from '../../widgets/base/base.component';
import { getImageUrl } from '@utils/utils';
import { registerProps } from './panel.props';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';
import { setCSS, toggleClass } from '@utils/dom';

registerProps();

const DEFAULT_CLS = 'app-panel panel';
const WIDGET_CONFIG = {widgetType: 'wm-panel', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmPanel]',
    templateUrl: './panel.component.html',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => PanelComponent)}
    ]
})
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

    @ViewChild('panelHeading') private $panelHeader: ElementRef;
    @ViewChild('panelContent') private $panelContent: ElementRef;

    @Output() close = new EventEmitter();
    @Output() expand = new EventEmitter();
    @Output() collapse = new EventEmitter();
    @Output('fullscreen') _fullScreenEvt= new EventEmitter();
    @Output() exitfullscreen = new EventEmitter();
    // @Output() onActionsclick = new EventEmitter();


    togglePanel($event) {
        if (this.collapsible) {
            if (this.expanded) {
                this.collapse.emit({$event: $event, $context: this});
            } else {
                this.expand.emit({$event: $event, $context: this});
            }

            this.expanded = !this.expanded;
        }
    }

    toggleFullScreen($event) {
        if (this.enablefullscreen) {
            if (this.fullscreen) {
                this.exitfullscreen.emit({$event: $event, $context: this});
            } else {
                this._fullScreenEvt.emit({$event: $event, $context: this});
            }

            this.fullscreen = !this.fullscreen;
        }

        // Eval content height on toggle of fullscreen
        this._toggleFullScreen();
    }

    toggleHelp() {
        this.helpClass = this.helpClass ? null : 'show-help';
        toggleClass(this.$element, 'show-help', !!this.helpClass);
    }

    closePanel($event) {
        this.show = false;
        this.close.emit({$event: $event, $context: this});
    }

    private _toggleFullScreen() {
        const headerHeight = this.$panelHeader.nativeElement.offsetHeight,
            $footer = <HTMLElement>this.$element.querySelector('.panel-footer'),
            $content = this.$panelContent,
            vwHeight = window.screen.height;

        let inlineHeight;

        if (this.fullscreen) {
            inlineHeight = $footer ? vwHeight - ($footer.offsetHeight + headerHeight) : (vwHeight - headerHeight);
        } else {
            inlineHeight = this.height || '';
        }

        setCSS($content.nativeElement, 'height', inlineHeight);
    }

    get showHeader() {
        return this.iconurl || this.iconclass || this.collapsible || this.actions || this.title || this.subheading || this.enablefullscreen;
    }

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'iconurl':
                this.iconurl = getImageUrl(nv);
                break;
            case 'expanded':
                this.expanded = nv;
                break;
            case 'fullscreen':
                toggleClass(this.$element, 'fullscreen', nv);
        }
    }

    constructor(inj: Injector, elRef: ElementRef, private cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this, APPLY_STYLES_TYPE.SHELL);
    }

    ngOnInit() {
        super.ngOnInit();
        styler(this.$panelContent.nativeElement.children[0], this, APPLY_STYLES_TYPE.INNER_SHELL);
    }
}
