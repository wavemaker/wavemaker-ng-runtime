import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ButtongroupDemoComponent } from './buttongroup-demo.component';

const routes: Routes = [{path: '', component: ButtongroupDemoComponent}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ButtongroupDemoRoutingModule { }
