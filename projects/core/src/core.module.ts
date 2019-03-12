import { ModuleWithProviders, NgModule } from '@angular/core';

@NgModule({
    declarations: [],
    imports: [],
    providers: [],
    bootstrap: []
})
export class CoreModule {

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CoreModule,
            providers: [
            ]
        };
    }
}
