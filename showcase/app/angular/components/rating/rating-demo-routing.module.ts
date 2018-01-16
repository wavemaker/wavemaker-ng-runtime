import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {RatingDemoComponent} from './rating-demo.component';

const routes: Routes = [{path: '', component: RatingDemoComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RatingDemoRoutingModule { }
