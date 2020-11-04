import { Directive, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, styler, BaseContainerComponent } from '@wm/components/base';

import { registerProps } from './linear-layout.props';

const DEFAULT_CLS = 'app-linear-layout clearfix';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-linearlayout',
    hostClass: DEFAULT_CLS
};
const hAlignValues = {
    'left': 'flex-start',
    'right': 'flex-end',
    'center': 'center',
},
vAlignValues = {
    'top': 'flex-start',
    'bottom': 'flex-end',
    'center': 'center',
};

@Directive({
    selector: '[wmLinearLayout]',
    providers: [
        provideAsWidgetRef(LinearLayoutDirective)
    ]
})
export class LinearLayoutDirective extends BaseContainerComponent {
    static initializeProps = registerProps();

    public horizontalalign: string;
    public verticalalign: string;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    private removeClass($el, prefix) {
        $el.removeClass((i, className) => {
            return className.split(' ')
            .filter(s => s.startsWith(prefix))
            .join(' ');
        });
    }

    private changeDirection($el, v) {
        this.removeClass($el, 'app-linear-layout-direction');
        $el.addClass('app-linear-layout-direction-' + v);
        if (v === 'row' || v === 'row-reverse') {
            $el.css('justify-content', hAlignValues[this.horizontalalign]);
        } else if (v === 'column' || v === 'column-reverse') {
            $el.css('justify-content', vAlignValues[this.verticalalign]);
        }
        $el.css('flex-direction', v);
    }

    protected onStyleChange(key: string, nv: any, ov?: any) {
        if (key === 'horizontalalign') {
            this.$element.css('justify-content', hAlignValues[nv]);
        } else if (key === 'verticalalign') {
            this.$element.css('justify-content', vAlignValues[nv]);
        }
        super.onStyleChange(key, nv, ov);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        switch (key) {
            case 'direction':
                this.changeDirection(this.$element, nv);
            break;
            case 'horizontalalign':
                this.$element.css('justify-content', hAlignValues[nv]);
            break;
            case 'verticalalign':
                this.$element.css('justify-content', vAlignValues[nv]);
            break;
            case 'spacing':
                this.removeClass(this.$element, 'app-linear-layout-spacing');
                this.$element.addClass('app-linear-layout-spacing-' + nv);
            break;
        }
        super.onPropertyChange(key, nv, ov);
    }
}
