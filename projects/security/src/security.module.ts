import { ModuleWithProviders, NgModule } from '@angular/core';

import { SecurityService } from './security.service';

@NgModule({})
export class SecurityModule {
    static forRoot(): ModuleWithProviders<SecurityModule> {
        return {
            ngModule: SecurityModule,
            providers: [SecurityService]
        };
    }
}
