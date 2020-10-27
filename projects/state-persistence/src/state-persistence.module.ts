import { ModuleWithProviders, NgModule } from '@angular/core';
import { SecurityModule } from '@wm/security';

import { StatePersistence } from './state-persistence.service';

@NgModule({
    imports: [
        SecurityModule
    ]
})
export class StatePersistenceModule {
    static forRoot(): ModuleWithProviders<StatePersistenceModule> {
        return {
            ngModule: StatePersistenceModule,
            providers: [StatePersistence]
        };
    }
}
