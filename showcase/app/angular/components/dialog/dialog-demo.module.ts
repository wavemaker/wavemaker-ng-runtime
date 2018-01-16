import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogDemoRoutingModule } from './dialog-demo-routing.module';
import { DialogDemoComponent } from './dialog-demo.component';
import { WmComponentsModule } from '@components/components.module';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        DialogDemoRoutingModule,
        WmComponentsModule,
        FormsModule
    ],
    declarations: [DialogDemoComponent]
})
export class DialogDemoModule { }
