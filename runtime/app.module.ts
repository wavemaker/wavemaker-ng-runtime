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

import { MetadataResolve } from './resolves/metadata.resolve';
import { AppJSResolve } from './resolves/app-js.resolve';
import { SecurityConfigResolve } from './resolves/security-config.resolve';
import { App } from './services/app.service';
import { AppResourceManagerService } from './services/app-resource-manager.service';
import { PrefabManagerService } from './services/prefab-manager.service';
import { I18nService } from './services/i18n.service';
import { I18nResolve } from './resolves/i18n.resolve';
import { SecurityService } from './services/security.service';
import { HttpServiceModule } from '@http-service/http-service.module';

const resolve = {
    securityConfig: SecurityConfigResolve,
    metadata: MetadataResolve,
    appJS: AppJSResolve,
    i18n: I18nResolve
};

const routes = [
    {
        path: '',
        component: PageWrapperComponent,
        pathMatch: 'full',
        resolve: resolve
    },
    {
        path: ':pageName',
        component: PageWrapperComponent,
        pathMatch: 'full',
        resolve: resolve
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
        HttpServiceModule,
        RouterModule.forRoot(routes, {useHash: true})
    ],
    providers: [
        PipeProvider,
        RenderUtilsService,
        MetadataResolve,
        App,
        AppJSResolve,
        I18nService,
        I18nResolve,
        AppResourceManagerService,
        PrefabManagerService,
        SecurityService,
        SecurityConfigResolve
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
