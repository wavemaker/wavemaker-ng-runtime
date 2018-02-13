import { NgModule } from '@angular/core';
import { CommonModule, Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { VariablesService } from './services/variables.service';
import { HttpClientModule } from '@angular/common/http';
// import {ExternalServicesService} from '../services/externalservices.service';
import { MetadataService } from './services/metadata-service/metadata.service';
import { ServiceVariableService } from './services/service-variable/service-variable.service';
// import {HttpServiceModule} from '@http-service/http-service.module';
import { HttpServiceModule } from '../http-service/http-service.module';
import { NavigationVariableService } from './services/navigation-variable/navigation-variable.service';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        HttpServiceModule
    ],
    declarations: [],
    providers: [
        VariablesService,
        // ExternalServicesService,
        MetadataService,
        Location,
        ServiceVariableService,
        NavigationVariableService,
        {provide: LocationStrategy, useClass: PathLocationStrategy}
    ]
})
export class VariablesModule {}

export * from './services/variables.service';
export * from './services/metadata-service/metadata.service';
