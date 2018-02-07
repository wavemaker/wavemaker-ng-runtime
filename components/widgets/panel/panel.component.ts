import { Component, Output, EventEmitter, ViewChild, ElementRef, Injector, ContentChild, ChangeDetectorRef, forwardRef } from '@angular/core';
import { BaseComponent } from '../../widgets/base/base.component';
import { getImageUrl } from '@utils/utils';
import { registerProps } from '../../widgets/panel/panel.props';
import { styler } from '../../utils/styler';
import { setCSS } from '@utils/dom';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-panel', hasTemplate: true};

@Component({
    selector: 'wm-panel',
    templateUrl: './panel.component.html',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => PanelComponent)}
    ]
})
export class PanelComponent extends BaseComponent {

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

    @ViewChild('panel') private $panel: ElementRef;
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
    }

    closePanel($event) {
        this.show = false;
        this.close.emit({$event: $event, $context: this});
    }

    private _toggleFullScreen() {
        const headerHeight = this.$panelHeader.nativeElement.offsetHeight,
            $footer = this.$panel.nativeElement.querySelector('.panel-footer'),
            $content = this.$panelContent,
            vwHeight = window.screen.height;

        let inlineHeight;

        if (this.fullscreen) {
            inlineHeight = $footer.length ? vwHeight - ($footer.offsetHeight + headerHeight) : (vwHeight - headerHeight);
        } else {
            inlineHeight = this.height || '';
        }

        setCSS($content.nativeElement, 'height', inlineHeight);
    }

    get showHeader() {
        return this.iconurl || this.iconclass || this.collapsible || this.actions || this.title || this.subheading || this.enablefullscreen;
    }

    onPropertyChange(key, newVal, oldVal?) {
        switch (key) {
            case 'iconurl':
                this.iconurl = getImageUrl(newVal);
                break;
            case 'expanded':
                this.expanded = newVal;
                break;
        }
    }

    constructor(inj: Injector, elRef: ElementRef, private cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
    }

    _ngOnInit() {
        styler(this.$element, this);
    }
}
