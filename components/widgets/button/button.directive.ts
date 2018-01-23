import { ChangeDetectorRef, Directive, ElementRef, HostBinding, Injector } from '@angular/core';
import { addClass, appendNode, insertBefore, removeNode, setCSS, setProperty, switchClass } from '@utils/dom';
import { initWidget } from '../../utils/init-widget';
import { BaseComponent } from '../base/base.component';
import { styler } from '@utils/styler';
import { registerProps } from './button.props';
import { debounce } from '@utils/utils';

registerProps();

const WIDGET_TYPE = 'wm-button';
const DEFAULT_CLS = 'btn app-button';

const $captionTemplate = document.createElement('span');
$captionTemplate.classList.add('btn-caption');

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
    'selector': '[wmButton]'
})
export class ButtonDirective extends BaseComponent {
    $caption;
    $badge;
    $icon;

    @HostBinding('type') type: string = 'button';
    @HostBinding('tabIndex') tabindex: number;
    @HostBinding('disabled') disabled: boolean;
    @HostBinding('attr.accesskey') shortcutkey: string;
    @HostBinding('attr.icon-position') iconposition: string;

    onPropertyChange(key, nv, ov?) {
        let _prop;
        switch (key) {
            case 'caption':
                if (!this.$caption) {
                    this.$caption = getCaptionNode();
                    appendNode(this.$caption, this.$element);
                }

                setProperty(this.$caption, 'textContent', nv);
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
                        } else {
                            appendNode(this.$icon, this.$element);
                        }
                        addClass(this.$icon, nv);
                    }
                }
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super();

        this.$digest = debounce(cdr.detectChanges.bind(cdr));

        this.$host = elRef.nativeElement;
        this.$element = this.$host;

        addClass(this.$element, DEFAULT_CLS);

        initWidget(this, WIDGET_TYPE, (<any>inj).elDef, (<any>inj).view);
        styler(this.$element, this);
    }
}
