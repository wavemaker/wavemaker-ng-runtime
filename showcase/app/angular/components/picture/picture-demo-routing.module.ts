import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PictureDemoComponent } from './picture-demo.component';

const routes: Routes = [{path: '', component: PictureDemoComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PictureDemoRoutingModule { }
