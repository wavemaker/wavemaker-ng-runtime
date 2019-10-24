import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

import { WmComponentsModule } from '@wm/components/base';

import { SearchComponent } from './search.component';

const components = [
    SearchComponent
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TypeaheadModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class SearchModule {
}
