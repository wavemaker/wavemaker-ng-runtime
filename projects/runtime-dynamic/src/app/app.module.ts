import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ToastrModule } from 'ngx-toastr';

import { getWmProjectProperties } from '@wm/core';

import {
    AppComponent,
    AppJSProvider,
    AppVariablesProvider,
    ComponentRefProvider,
    PrefabConfigProvider,
    WM_MODULES_FOR_ROOT
} from '@wm/runtime/base';

import { routes } from './app.routes';
import { PageWrapperComponent } from './components/page-wrapper.component';
import { AppJSProviderService } from './services/app-js-provider.service';
import { AppVariablesProviderService } from './services/app-variables-provider.service';
import { ComponentRefProviderService } from './services/component-ref-provider.service';
import { PrefabConfigProviderService } from './services/prefab-config-provider.service';
import { AppResourceManagerService } from './services/app-resource-manager.service';

export const routerModule = RouterModule.forRoot(routes, {useHash: true, scrollPositionRestoration: 'top'});
export const toastrModule = ToastrModule.forRoot({maxOpened: 1, autoDismiss: true });
export const httpClientXsrfModule = HttpClientXsrfModule.withOptions({
    cookieName: 'wm_xsrf_token',
    headerName: getWmProjectProperties().xsrf_header_name
});

@NgModule({
    declarations: [
        PageWrapperComponent
    ],
    imports: [
        BrowserModule,
        CommonModule,
        RouterModule,
        HttpClientModule,
        BrowserAnimationsModule,

        routerModule,
        toastrModule,
        httpClientXsrfModule,

        WM_MODULES_FOR_ROOT
    ],
    providers: [
        AppResourceManagerService,
        {provide: AppJSProvider, useClass: AppJSProviderService},
        {provide: AppVariablesProvider, useClass: AppVariablesProviderService},
        {provide: ComponentRefProvider, useClass: ComponentRefProviderService},
        {provide: PrefabConfigProvider, useClass: PrefabConfigProviderService}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {

}
