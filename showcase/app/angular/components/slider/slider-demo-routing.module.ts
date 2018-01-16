import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SliderDemoComponent } from './slider-demo.component';

const routes: Routes = [{path: '', component: SliderDemoComponent}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SliderDemoRoutingModule { }
