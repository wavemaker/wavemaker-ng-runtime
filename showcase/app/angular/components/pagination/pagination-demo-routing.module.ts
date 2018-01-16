import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaginationDemoComponent } from './pagination-demo.component';

const routes: Routes = [{path: '', component: PaginationDemoComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaginationDemoRoutingModule { }
