import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DialogDemoComponent } from './dialog-demo.component';

const routes: Routes = [{path: '', component: DialogDemoComponent}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DialogDemoRoutingModule { }
