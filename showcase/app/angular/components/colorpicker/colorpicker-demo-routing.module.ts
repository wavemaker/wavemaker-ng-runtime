import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ColorpickerDemoComponent } from './colorpicker-demo.component';

const routes: Routes = [{path: '', component: ColorpickerDemoComponent}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ColorpickerDemoRoutingModule { }
