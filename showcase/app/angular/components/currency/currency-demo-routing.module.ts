import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CurrencyDemoComponent } from './currency-demo.component';

const routes: Routes = [{ path: '', component: CurrencyDemoComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CurrencyDemoRoutingModule { }
