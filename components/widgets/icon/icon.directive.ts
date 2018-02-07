import { Directive, Injector, ElementRef, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './icon.props';
import { addClass, appendNode, setProperty, insertBefore, switchClass } from '@utils/dom';
import { styler } from '../../utils/styler';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-icon', hasTemplate: false};
const DEFAULT_CLS = 'app-icon-wrapper';

const $iconTemplate = document.createElement('i');
$iconTemplate.classList.add('app-icon');
const getIconNode = () => $iconTemplate.cloneNode();

const $labelTemplate = document.createElement('label');
$labelTemplate.classList.add('app-label');
const getLabelNode = () => $labelTemplate.cloneNode();

@Directive({
    selector: '[wmIcon]'
})
export class IconDirective extends BaseComponent {
    $caption;
    $icon;

    onPropertyChange(key, nv, ov?) {
        switch(key) {
            case 'caption':
                if (!this.$caption) {
                    this.$caption = getLabelNode();
                    appendNode(this.$caption, this.$element);
                }
                setProperty(this.$caption, 'textContent', ' ' + nv);
                break;
            case 'iconclass':
                if (!this.$icon) {
                    this.$icon = getIconNode();
                    if (this.$caption) {
                        insertBefore(this.$icon, this.$caption);
                    } else {
                        appendNode(this.$icon, this.$element);
                    }
                }
                switchClass(this.$icon, nv, ov);
                break;
        }
    }
    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        addClass(this.$element, DEFAULT_CLS);
        styler(this.$element, this);
    }
}