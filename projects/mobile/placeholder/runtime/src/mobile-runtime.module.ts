import { ModuleWithProviders, NgModule } from '@angular/core';
import { AppExtComponent } from './components/app-ext.component';

@NgModule({
    declarations: [
        AppExtComponent
    ],
    exports: [
        AppExtComponent
    ]
})
export class MobileRuntimeModule {
    static forRoot(): ModuleWithProviders<MobileRuntimeModule> {
        return {
            ngModule: MobileRuntimeModule,
            providers: []
        };
    }
}
