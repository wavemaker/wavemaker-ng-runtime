import { ChangeDetectorRef, Component, ElementRef, Injector } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './page-content.props';
import { switchClass } from '@wm/utils';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';

registerProps();

const DEFAULT_CLS = 'app-page-content app-content-column';
const WIDGET_CONFIG = {widgetType: 'wm-page-content', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmPageContent]',
    templateUrl: './page-content.component.html'
})
export class PageContentComponent extends BaseComponent {

    onPropertyChange(key, nv, ov) {
        if (key === 'columnwidth') {
            switchClass(this.$element, `col-md-${nv} col-sm-${nv}`, `col-md-${ov} col-sm-${ov}`);
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
