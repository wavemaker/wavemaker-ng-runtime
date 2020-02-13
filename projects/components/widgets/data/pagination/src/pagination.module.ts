import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PaginationModule as ngxPaginationModule } from 'ngx-bootstrap/pagination';

import { WmComponentsModule } from '@wm/components/base';

import { PaginationComponent } from './pagination.component';

const components = [
    PaginationComponent
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ngxPaginationModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class PaginationModule {
}
