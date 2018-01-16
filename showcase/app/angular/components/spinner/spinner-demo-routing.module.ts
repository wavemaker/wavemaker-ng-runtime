import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SpinnerDemoComponent} from './spinner-demo.component';

const routes: Routes = [{path: '', component: SpinnerDemoComponent}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SpinnerDemoRoutingModule { }
