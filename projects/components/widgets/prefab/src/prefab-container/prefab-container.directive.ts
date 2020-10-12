import { Directive, Injector, OnDestroy } from '@angular/core';

import { IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './prefab-container.props';

const DEFAULT_CLS = 'app-prefab-container full-height';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-prefab-container',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmPrefabContainer]',
    providers: [
        provideAsWidgetRef(PrefabContainerDirective)
    ]
})
export class PrefabContainerDirective extends StylableComponent  implements OnDestroy {
    static initializeProps = registerProps();

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    public ngOnAttach() {
        this.invokeEventCallback('attach', { widget: this });
    }

    public ngOnDetach() {
        this.invokeEventCallback('detach', { widget: this });
    }

    public ngOnDestroy() {
        this.invokeEventCallback('destroy', { widget: this });
    }
}
