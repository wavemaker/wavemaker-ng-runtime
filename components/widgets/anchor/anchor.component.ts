import { ChangeDetectorRef, Component, ElementRef, HostBinding, Injector } from '@angular/core';
import { setAttr} from '@utils/dom';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { encodeUrl } from '@utils/utils';
import { registerProps } from './anchor.props';

registerProps();

const DEFAULT_CLS = 'app-anchor';
const WIDGET_CONFIG = {widgetType: 'wm-anchor', hostClass: DEFAULT_CLS};

@Component({
    selector: 'a[wmAnchor]',
    templateUrl: './anchor.component.html'
})
export class AnchorComponent extends BaseComponent {
    encodeurl;

    @HostBinding('attr.tabindex') tabindex: number;
    @HostBinding('attr.accesskey') shortcutkey: string;
    @HostBinding('target') target: string;
    @HostBinding('attr.icon-position') iconposition: string;

    onPropertyChange(key, nv, ov?) {
        if (key === 'hyperlink') {
            if (this.encodeurl) {
                nv = encodeUrl(nv);
            }
            /* if hyperlink starts with 'www.' append '//' in the beginning */
            if (nv.startsWith(nv, 'www.')) {
                nv = `//${nv}`;
            }
            setAttr(this.$element, 'href', nv);
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        setAttr(this.$element, 'href', 'javascript:void(0)');

        styler(this.$element, this);
    }
}
