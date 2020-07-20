import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AbstractHttpService } from '@wm/core';

import { HttpServiceImpl } from './http.service';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule
    ],
    declarations: []
})
export class HttpServiceModule {

    static forRoot(): ModuleWithProviders<CommonModule> {
        return {
            ngModule: CommonModule,
            providers: [
                {provide: AbstractHttpService, useClass: HttpServiceImpl}
            ]
        };
    }
}

export * from './http.service';
export * from './wm-http-request';
export * from './wm-http-response';
