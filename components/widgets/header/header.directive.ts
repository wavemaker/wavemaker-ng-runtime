import { Directive, ElementRef, Injector, ChangeDetectorRef, forwardRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './header.props';
import { addClass } from '@utils/dom';
import { styler, APPLY_STYLES_TYPE } from '../../utils/styler';
import { html, render } from 'lit-html/lit-html';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-header', hasTemplate: false};
const DEFAULT_CLS = 'app-header clearfix';

const getHeaderMenu = () => {
    return html`<div class="app-header-menu" data-role="page-left-panel-icon"
        ><a class="app-header-action"
            ><i class="wi wi-menu"></i
        ></a
        ></div
        ><div class="app-header-container" partial-container-target></div>`;
};

@Directive({
    selector: '[wmHeader]',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => HeaderDirective)}
    ]
})
export class HeaderDirective extends BaseComponent {

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        render(getHeaderMenu(), this.$element);

        addClass(this.$element, DEFAULT_CLS);
        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
