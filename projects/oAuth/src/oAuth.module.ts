import { ModuleWithProviders, NgModule } from '@angular/core';

import { OAuthService } from './oAuth.service';

@NgModule({})
export class OAuthModule {

    static forRoot(): ModuleWithProviders<OAuthModule> {
        return {
            ngModule: OAuthModule,
            providers: [OAuthService]
        };
    }
}
