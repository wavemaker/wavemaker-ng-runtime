import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

import { WmComponentsModule } from '@wm/components/base';

import { SearchComponent } from './search.component';
import { ScrollableDirective } from './scrollable.directive';

const components = [
    SearchComponent,
    ScrollableDirective
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
