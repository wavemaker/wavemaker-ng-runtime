import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RadiosetDemoComponent } from './radioset-demo.component';

const routes: Routes = [{path: '', component: RadiosetDemoComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RadiosetDemoRoutingModule { }
