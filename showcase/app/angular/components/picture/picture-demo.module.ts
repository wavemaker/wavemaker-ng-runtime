import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PictureDemoRoutingModule } from './picture-demo-routing.module';
import { PictureDemoComponent } from './picture-demo.component';
import { WmComponentsModule } from '@components/components.module';

@NgModule({
  imports: [
    CommonModule,
    PictureDemoRoutingModule,
    FormsModule,
    WmComponentsModule
  ],
  declarations: [PictureDemoComponent]
})
export class PictureDemoModule { }
