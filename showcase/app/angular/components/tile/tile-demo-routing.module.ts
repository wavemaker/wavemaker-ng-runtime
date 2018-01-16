import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TileDemoComponent } from './tile-demo.component';

const routes: Routes = [{path: '', component: TileDemoComponent}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TileDemoRoutingModule { }
