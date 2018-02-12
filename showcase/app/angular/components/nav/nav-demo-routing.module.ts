import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavDemoComponent } from './nav-demo.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {path: '', component: NavDemoComponent}
        ])
    ],
    exports: [RouterModule]
})
export class NavDemoRoutingModule { }
