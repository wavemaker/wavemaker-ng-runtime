import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AudioDemoRoutingModule } from './audio-routing.module';
import { AudioDemoComponent } from './audio-demo.component';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
  imports: [
    CommonModule,
    AudioDemoRoutingModule,
    WmComponentsModule,
    FormsModule
  ],
  declarations: [AudioDemoComponent]
})
export class AudioDemoModule { }
