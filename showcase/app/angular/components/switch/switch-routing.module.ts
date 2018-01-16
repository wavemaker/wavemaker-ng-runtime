import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SwitchDemoComponent } from './switch-demo.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {path: '', component: SwitchDemoComponent}
        ])
    ],
    exports: [RouterModule]
})
export class SwitchDemoRoutingModule {}
