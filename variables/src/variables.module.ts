import { NgModule } from '@angular/core';
import { CommonModule, Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ToastrModule } from 'ngx-toastr';

import { HttpServiceModule } from '@wm/http';
import { SecurityModule } from '@wm/security';
import { OAuthModule } from '@wm/oAuth';

import { VariablesService } from './service/variables.service';
import { MetadataService } from './service/metadata-service/metadata.service';

@NgModule({
    imports: [
        CommonModule,
        ToastrModule.forRoot({
            maxOpened: 1,
            autoDismiss: true
        }),
        HttpClientModule,
        HttpServiceModule,
        OAuthModule,
        SecurityModule,
        BrowserAnimationsModule
    ],
    declarations: [],
    providers: [
        VariablesService,
        MetadataService,
        Location,
        {provide: LocationStrategy, useClass: PathLocationStrategy}
    ]
})
export class VariablesModule {}
