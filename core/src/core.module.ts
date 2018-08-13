import { NgModule } from '@angular/core';

import { UtilsService } from './services/utils.service';
import { FieldTypeService } from './services/field-type.service';
import { FieldWidgetService } from './services/field-widget.service';

@NgModule({
    declarations: [],
    imports: [],
    providers: [UtilsService, FieldTypeService, FieldWidgetService],
    bootstrap: []
})
export class CoreModule {}