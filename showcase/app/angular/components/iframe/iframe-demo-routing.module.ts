import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {IframeDemoComponent} from './iframe-demo.component';

const routes: Routes = [{path: '', component: IframeDemoComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IframeDemoRoutingModule { }
