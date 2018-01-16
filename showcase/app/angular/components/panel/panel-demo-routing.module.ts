import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PanelDemoComponent } from './panel-demo.component';

const routes: Routes = [{path: '', component: PanelDemoComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PanelDemoRoutingModule { }
