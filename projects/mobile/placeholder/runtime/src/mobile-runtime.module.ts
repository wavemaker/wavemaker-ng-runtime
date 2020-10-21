import { ModuleWithProviders, NgModule } from '@angular/core';

@NgModule({})
export class MobileRuntimeModule {
    static forRoot(): ModuleWithProviders<MobileRuntimeModule> {
        return {
            ngModule: MobileRuntimeModule,
            providers: []
        };
    }
}
