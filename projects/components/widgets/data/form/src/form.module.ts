import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';
import { InputModule } from '@wm/components/input';
import { DesignDialogModule } from '@wm/components/dialogs/design-dialog';

import { FormComponent } from './form.component';
import { FormWidgetDirective } from './form-widget.directive';
import { FormActionDirective } from './form-action/form-action.directive';
import { FormFieldDirective } from './form-field/form-field.directive';
import { LiveActionsDirective } from './live-actions/live-actions.directive';
import { DependsonDirective } from './live-actions/dependson.directive';
import { LiveFilterDirective } from './live-filter/live-filter.directive';
import { LiveFormDirective } from './live-form/live-form.directive';
import { AnchorComponent } from '@wm/components/basic';

const components = [
    FormComponent,
    FormWidgetDirective,
    FormActionDirective,
    FormFieldDirective,
    LiveActionsDirective,
    DependsonDirective,
    LiveFilterDirective,
    LiveFormDirective
];

@NgModule({
    imports: [
        AnchorComponent,
        CommonModule,
        DesignDialogModule,
        InputModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components]
})
export class FormModule {
}
