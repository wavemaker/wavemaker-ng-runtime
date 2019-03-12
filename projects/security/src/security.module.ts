import { ModuleWithProviders, NgModule } from '@angular/core';

import { SecurityService } from './security.service';

@NgModule({})
export class SecurityModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SecurityModule,
            providers: [SecurityService]
        };
    }
}
