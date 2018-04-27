import { NgModule, Component } from '@angular/core';


import { WmMobileComponentsModule } from '@wm/mobile/components';
import { VariablesModule } from '@wm/mobile/variables';


@Component({
    selector : 'mobile-app',
    template : '<p>TITLE</p>'
})
export class MobileAppComponent {

}

@NgModule({
    declarations: [MobileAppComponent],
    imports: [
        VariablesModule,
        WmMobileComponentsModule
    ],
    providers: [],
    bootstrap: [MobileAppComponent]
})
export class MobileAppModule {
}
