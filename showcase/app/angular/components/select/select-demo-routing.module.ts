import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SelectDemoComponent } from './select-demo.component';

const routes: Routes = [{path: '', component: SelectDemoComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SelectDemoRoutingModule { }
