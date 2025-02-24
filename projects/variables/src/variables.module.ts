import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule, HashLocationStrategy, Location, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { ToastrModule } from 'ngx-toastr';

import { HttpServiceImpl } from '@wm/http';
import { SecurityModule } from '@wm/security';
import { OAuthModule } from '@wm/oAuth';

import { VariablesService } from './service/variables.service';
import { MetadataService } from './service/metadata-service/metadata.service';

export const toastrModule: ModuleWithProviders<ToastrModule> = ToastrModule.forRoot({ maxOpened: 1, autoDismiss: true });

@NgModule({
    imports: [
        CommonModule,
        toastrModule,
        HttpClientModule,
        OAuthModule,
        SecurityModule
    ],
    declarations: []
})
export class VariablesModule {

    static forRoot(): ModuleWithProviders<VariablesModule> {
        return {
            ngModule: VariablesModule,
            providers: [
                VariablesService,
                MetadataService,
                Location,
                HttpServiceImpl,
                { provide: LocationStrategy, useClass: HashLocationStrategy }
            ]
        };
    }
}
