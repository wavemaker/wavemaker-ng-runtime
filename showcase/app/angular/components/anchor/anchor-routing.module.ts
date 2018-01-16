import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AnchorDemoComponent } from './anchor-demo.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {path: '', component: AnchorDemoComponent}
        ])
    ],
    exports: [RouterModule]
})
export class AnchorDemoRoutingModule { }
