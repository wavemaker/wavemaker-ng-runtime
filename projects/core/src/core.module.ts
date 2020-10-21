import { ModuleWithProviders, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    declarations: [],
    imports: [
        HttpClientModule
    ],
    providers: [],
    bootstrap: []
})
export class CoreModule {

    static forRoot(): ModuleWithProviders<CoreModule> {
        return {
            ngModule: CoreModule,
            providers: [
            ]
        };
    }
}
