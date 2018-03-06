import { NgModule } from '@angular/core';
import { CommonModule, Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { VariablesService } from './services/variables.service';
import { HttpClientModule } from '@angular/common/http';
import { MetadataService } from './services/metadata-service/metadata.service';
import { HttpServiceModule } from '../http-service/http-service.module';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        HttpServiceModule
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

export * from './services/variables.service';
export * from './services/metadata-service/metadata.service';
