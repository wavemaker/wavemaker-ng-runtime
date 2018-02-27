import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProgressBarDemoComponent } from './progress-bar-demo.component';

const routes: Routes = [{path: '', component: ProgressBarDemoComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProgressBarRoutingModule { }
