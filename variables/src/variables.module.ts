import { NgModule } from '@angular/core';
import { CommonModule, Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { VariablesService } from './service/variables.service';
import { HttpClientModule } from '@angular/common/http';
import { MetadataService } from './service/metadata-service/metadata.service';
import { HttpServiceModule } from '@wm/http';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    imports: [
        CommonModule,
        ToastrModule.forRoot(),
        HttpClientModule,
        HttpServiceModule,
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

export * from './service/variables.service';
export * from './service/metadata-service/metadata.service';
