import { ChangeDetectorRef, Directive, ElementRef, HostBinding, Injector } from '@angular/core';
import { addClass, appendNode, insertBefore, removeNode, setAttr, setCSS, setProperty, switchClass } from '@utils/dom';
import { initWidget } from '../..//utils/init-widget';
import { BaseComponent } from '../base/base.component';
import { styler } from '@utils/styler';
import { debounce, encodeUrl } from '@utils/utils';
import { registerProps } from './anchor.props';

registerProps();

const WIDGET_TYPE = 'wm-anchor';
const DEFAULT_CLS = 'app-anchor';

const $captionTemplate = document.createElement('span');
$captionTemplate.classList.add('anchor-caption');

const getCaptionNode = () => {
    return $captionTemplate.cloneNode();
};

const $iconTemplate = document.createElement('i');
$iconTemplate.classList.add('app-icon');

const getIconNode = () => {
    return $iconTemplate.cloneNode();
};

const $badgeTemplate = document.createElement('span');
$badgeTemplate.classList.add('badge');
$badgeTemplate.classList.add('pull-right');

const getBadgeNode = () => {
    return $badgeTemplate.cloneNode();
};

@Directive({
    'selector': '[wmAnchor]'
})
export class AnchorDirective extends BaseComponent {
    $caption;
    $badge;
    $icon;
    encodeurl;

    @HostBinding('attr.tabindex') tabindex: number;
    @HostBinding('attr.accesskey') shortcutkey: string;
    @HostBinding('target') target: string;
    @HostBinding('attr.icon-position') iconposition: string;

    onPropertyChange(key, nv, ov?) {
        let _prop;
        switch (key) {
            case 'caption':
                if (!this.$caption) {
                    this.$caption = getCaptionNode();
                    appendNode(this.$caption, this.$element);
                }

                setProperty(this.$caption, 'textContent', ' ' + nv);
                break;
            case 'badgevalue':
                if (!this.$badge) {
                    this.$badge = getBadgeNode();
                    appendNode(this.$badge, this.$element);
                }
                setProperty(this.$badge, 'textContent', nv);
                break;
            case 'iconmargin':
                _prop = 'margin';
            case 'iconheight':
                _prop = 'height';
            case 'iconwidth':
                _prop = 'width';
                if (this.$icon) {
                    setCSS(this.$icon, _prop, nv);
                }
                break;
            case 'iconclass':
                if (this.$icon) {
                    if (nv) {
                        switchClass(this.$icon, nv, ov);
                    } else {
                        removeNode(this.$icon);
                        this.$icon = undefined;
                    }
                } else {
                    if (nv) {
                        this.$icon = getIconNode();
                        if (this.$caption) {
                            insertBefore(this.$icon, this.$caption);
                        }
                        addClass(this.$icon, nv);
                    }
                }
                break;
            case 'hyperlink':
                if (this.encodeurl) {
                    nv = encodeUrl(nv);
                }
                /* if hyperlink starts with 'www.' append '//' in the beginning */
                if (nv.startsWith(nv, 'www.')) {
                    nv = `//${nv}`;
                }
                setAttr(this.$element, 'href', nv);
                break;
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(elRef.nativeElement, elRef.nativeElement, cdr);

        setAttr(this.$element, 'href', 'javascript:void(0)');
        addClass(this.$element, DEFAULT_CLS);

        initWidget(this, WIDGET_TYPE, (<any>inj).elDef, (<any>inj).view);
        styler(this.$element, this);
    }
}
