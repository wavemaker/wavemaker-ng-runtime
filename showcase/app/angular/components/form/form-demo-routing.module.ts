import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormDemoComponent } from './form-demo.component';

const routes: Routes = [{path: '', component: FormDemoComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormDemoRoutingModule { }
