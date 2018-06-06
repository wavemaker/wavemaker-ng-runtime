import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';

import { $parseExpr, App } from '@wm/core';
import { HttpServiceModule } from '@wm/http';
import { MobileAppModule } from '@wm/mobile/runtime';
import { OAuthModule } from '@wm/oAuth';
import { VariablesModule } from '@wm/variables';
import { WmComponentsModule } from '@wm/components';
import { WmMobileComponentsModule } from '@wm/mobile/components';

import { AppComponent } from './app.component';
import { AppJSResolve } from './resolves/app-js.resolve';
import { AppManagerService } from './services/app.manager.service';
import { AppRef } from './services/app.service';
import { AppResourceManagerService } from './services/app-resource-manager.service';
import { CommonPageComponent } from './components/common-page.component';
import { I18nResolve } from './resolves/i18n.resolve';
import { I18nService } from './services/i18n.service';
import { MetadataResolve } from './resolves/metadata.resolve';
import { EmptyPageComponent, PageWrapperComponent } from './components/page-wrapper.component';
import { PipeProvider } from './services/pipe-provider.service';
import { PrefabManagerService } from './services/prefab-manager.service';
import { PrefabPreviewManagerService } from './services/prefab-preview-manager.service';
import { RenderUtilsService } from './services/render-utils.service';
import { SecurityConfigResolve } from './resolves/security-config.resolve';


declare const $;
declare const _WM_APP_PROPERTIES;

const appDependenciesResolve = {
    securityConfig: SecurityConfigResolve,
    metadata: MetadataResolve,
    appJS: AppJSResolve,
    i18n: I18nResolve
};

const routes = [
    {
        path: '',
        pathMatch: 'full',
        resolve: appDependenciesResolve,
        component: EmptyPageComponent
    },
    {
        path: ':pageName',
        pathMatch: 'full',
        resolve: appDependenciesResolve,
        component: PageWrapperComponent
    }
];

@NgModule({
    declarations: [
        AppComponent,
        PageWrapperComponent,
        CommonPageComponent,
        EmptyPageComponent
    ],
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        WmComponentsModule,
        VariablesModule,
        OAuthModule,
        RouterModule,
        HttpClientModule,
        HttpServiceModule,
        RouterModule.forRoot(routes, {useHash: true}),
        HttpClientXsrfModule.withOptions({
            cookieName: 'wm_xsrf_token',
            headerName: _WM_APP_PROPERTIES.xsrf_header_name
        }),
        WmMobileComponentsModule,
        MobileAppModule
    ],
    providers: [
        {provide: App, useClass: AppRef},
        PipeProvider,
        RenderUtilsService,
        MetadataResolve,
        AppJSResolve,
        I18nService,
        I18nResolve,
        AppManagerService,
        AppResourceManagerService,
        PrefabManagerService,
        PrefabPreviewManagerService,
        SecurityConfigResolve,
        DecimalPipe,
        DatePipe
    ],
    bootstrap: [AppComponent, CommonPageComponent]
})
export class AppModule {
    constructor () {
        $.fn.swipeAnimation.expressionEvaluator = $parseExpr;
    }
}
