import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TextDemoComponent } from './text-demo.component';

const routes: Routes = [{path: '', component: TextDemoComponent}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TextDemoRoutingModule { }
