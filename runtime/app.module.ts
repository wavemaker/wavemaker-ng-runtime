import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { PipeProvider } from './services/pipe-provider.service';
import { WmComponentsModule } from '@components/components.module';
import { RenderUtilsService } from './services/render-utils.service';
import { PageWrapperComponent } from './components/page-wrapper.component';
import { HttpClientModule } from '@angular/common/http';

import { VariablesModule } from '@variables/variables.module';
import { VariablesService } from '@variables/services/variables.service';

import { MetadataResolve } from './resolves/metadata.resolve';
import { AppJSResolve } from './resolves/app-js.resolve';
import { App } from './services/app.service';
import { AppResourceManagerService } from './services/app-resource-manager.service';
import { PrefabManagerService } from './services/prefab-manager.service';
import { i18nService } from './services/i18n.service';
import { i18nResolve } from './resolves/i18n.resolve';

const routes = [
    {
        path: ':pageName',
        component: PageWrapperComponent,
        pathMatch: 'full',
        resolve: {
            metadata: MetadataResolve,
            appJS: AppJSResolve,
            i18n: i18nResolve
        }
    }
];

@NgModule({
    declarations: [
        AppComponent,
        PageWrapperComponent
    ],
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        WmComponentsModule,
        VariablesModule,
        RouterModule,
        HttpClientModule,
        RouterModule.forRoot(routes, {useHash: true})
    ],
    providers: [
        PipeProvider,
        RenderUtilsService,
        VariablesService,
        MetadataResolve,
        App,
        AppJSResolve,
        i18nService,
        i18nResolve,
        AppResourceManagerService,
        PrefabManagerService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}