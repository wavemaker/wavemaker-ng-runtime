import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutgridDemoComponent } from './layoutgrid-demo.component';

const routes: Routes = [
    {path: '', component: LayoutgridDemoComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutgridDemoRoutingModule { }
