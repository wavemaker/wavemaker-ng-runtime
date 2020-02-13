import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';
import { PaginationModule } from '@wm/components/data/pagination';

import { ListComponent } from './list.component';
import { ListItemDirective } from './list-item.directive';

const components = [
    ListComponent,
    ListItemDirective
];

@NgModule({
    imports: [
        CommonModule,
        PaginationModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class ListModule {
}
