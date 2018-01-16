import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IframeDemoRoutingModule } from './iframe-demo-routing.module';
import { IframeDemoComponent } from './iframe-demo.component';
import { WmComponentsModule } from '@components/components.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    IframeDemoRoutingModule,
    WmComponentsModule,
    FormsModule
  ],
  declarations: [IframeDemoComponent]
})
export class IframeDemoModule { }
