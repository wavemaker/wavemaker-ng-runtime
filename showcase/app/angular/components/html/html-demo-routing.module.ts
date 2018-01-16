import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HtmlDemoComponent } from './html-demo.component';

const routes: Routes = [{path: '', component: HtmlDemoComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HtmlDemoRoutingModule { }
