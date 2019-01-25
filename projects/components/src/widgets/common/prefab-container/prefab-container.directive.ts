import { Directive, Injector } from '@angular/core';

import { StylableComponent } from '../base/stylable.component';
import { IWidgetConfig } from '../../framework/types';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { styler } from '../../framework/styler';
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
export class PrefabContainerDirective extends StylableComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }
}
