import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CurrencyDemoRoutingModule } from './currency-demo-routing.module';
import { CurrencyDemoComponent } from './currency-demo.component';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
    imports: [
        CommonModule,
        CurrencyDemoRoutingModule,
        WmComponentsModule,
        FormsModule
    ],
    declarations: [CurrencyDemoComponent]
})
export class CurrencyDemoModule { }
