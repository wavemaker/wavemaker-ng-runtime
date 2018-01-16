import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DatetimeDemoComponent} from './datetime-demo.component';

const routes: Routes = [{path: '', component: DatetimeDemoComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DatetimeDemoRoutingModule { }
