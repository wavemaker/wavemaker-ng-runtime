import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';

import { $parseExpr } from '@wm/core';
import { WmComponentsModule } from '@wm/components';
import { VariablesModule } from '@wm/variables';

import { AppComponent } from './app.component';
import { PipeProvider } from './services/pipe-provider.service';
import { RenderUtilsService } from './services/render-utils.service';
import { PageWrapperComponent } from './components/page-wrapper.component';

import { AppLocale } from '@wm/core';
import { HttpServiceModule } from '@wm/http';
import { OAuthModule } from '@wm/oAuth';

import { MetadataResolve } from './resolves/metadata.resolve';
import { AppJSResolve } from './resolves/app-js.resolve';
import { SecurityConfigResolve } from './resolves/security-config.resolve';
import { App } from './services/app.service';
import { AppManagerService } from './services/app.manager.service';
import { AppResourceManagerService } from './services/app-resource-manager.service';
import { PrefabManagerService } from './services/prefab-manager.service';
import { I18nService } from './services/i18n.service';
import { I18nResolve } from './resolves/i18n.resolve';
import { AppVariablesResolve } from './resolves/app-variables.resolve';

import { WmMobileComponentsModule } from '@wm/mobile/components';
import { MobileAppModule } from '@wm/mobile/runtime';

declare const $;
declare const _WM_APP_PROPERTIES;

const resolve = {
    securityConfig: SecurityConfigResolve,
    metadata: MetadataResolve,
    appVariables: AppVariablesResolve,
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
        PipeProvider,
        RenderUtilsService,
        MetadataResolve,
        App,
        AppJSResolve,
        AppVariablesResolve,
        I18nService,
        I18nResolve,
        AppManagerService,
        AppResourceManagerService,
        PrefabManagerService,
        SecurityConfigResolve,
        DecimalPipe,
        DatePipe,
        {provide: AppLocale, useValue: {}} // Todo - vinay update the value
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor () {
        $.fn.swipeAnimation.expressionEvaluator = $parseExpr;
    }
}
