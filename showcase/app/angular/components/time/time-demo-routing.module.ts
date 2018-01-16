import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TimeDemoComponent } from './time-demo.component';

const routes: Routes = [{path: '', component: TimeDemoComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimeDemoRoutingModule { }
