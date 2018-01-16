import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ToggleDemoComponent} from './toggle-demo.component';

const routes: Routes = [{path: '', component: ToggleDemoComponent}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ToggleDemoRoutingModule { }
