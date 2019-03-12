import { ModuleWithProviders, NgModule } from '@angular/core';

@NgModule({})
export class MobileRuntimeModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: MobileRuntimeModule,
            providers: []
        };
    }
}
