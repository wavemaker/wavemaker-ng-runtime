import { ModuleWithProviders, NgModule } from '@angular/core';

import { StatePersistence } from './state-persistence.service';

@NgModule({})
export class StatePersistenceModule {
    static forRoot(): ModuleWithProviders<StatePersistenceModule> {
        return {
            ngModule: StatePersistenceModule,
            providers: [StatePersistence]
        };
    }
}
