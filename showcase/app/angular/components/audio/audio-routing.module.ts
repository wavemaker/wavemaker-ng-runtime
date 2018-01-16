import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AudioDemoComponent } from './audio-demo.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {path: '', component: AudioDemoComponent}
        ])
    ],
    exports: [RouterModule]
})
export class AudioDemoRoutingModule {}
