import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListDemoComponent } from './list-demo.component';

const routes: Routes = [{path: '', component: ListDemoComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListDemoRoutingModule { }
