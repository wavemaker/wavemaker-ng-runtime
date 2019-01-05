import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AbstractHttpService } from '@wm/core';

import { HttpServiceImpl } from './http.service';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule
    ],
    declarations: [],
    providers: [
        {provide: AbstractHttpService, useClass: HttpServiceImpl}
    ]
})
export class HttpServiceModule {
}

export * from './http.service';
