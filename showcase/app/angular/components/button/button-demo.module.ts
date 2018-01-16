import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ButtonDemoRoutingModule} from './button-routing.module';
import {ButtonDemoComponent} from './button-demo.component';
import {WmComponentsModule} from '@components/components.module';

@NgModule({
    imports: [
        CommonModule,
        ButtonDemoRoutingModule,
        WmComponentsModule,
        FormsModule
    ],
    declarations: [ButtonDemoComponent]
})
export class ButtonDemoModule {
}
