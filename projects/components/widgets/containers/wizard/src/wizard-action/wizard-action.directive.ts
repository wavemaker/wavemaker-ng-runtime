import {Directive, Inject, Injector, Optional} from '@angular/core';
import { BaseComponent, IWidgetConfig, provideAsWidgetRef } from '@wm/components/base';
import {registerProps} from "./wizard-action.props";

const WIDGET_INFO: IWidgetConfig = {
    widgetType: 'wm-wizardaction',
    hostClass: 'app-wizard-actions panel-footer '
};

@Directive({
    selector: 'div[wmWizardAction]',
    providers: [
        provideAsWidgetRef(WizardActionDirective)
    ],
    exportAs: 'wmWizardAction',
})
export class WizardActionDirective extends BaseComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_INFO, explicitContext);
    }
}

