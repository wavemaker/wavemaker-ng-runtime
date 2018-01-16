import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchDemoRoutingModule } from './search-demo-routing.module';
import { SearchDemoComponent } from './search-demo.component';
import { FormsModule } from '@angular/forms';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
    imports: [
        CommonModule,
        SearchDemoRoutingModule,
        WmComponentsModule,
        FormsModule
    ],
    declarations: [SearchDemoComponent]
})
export class SearchDemoModule { }
