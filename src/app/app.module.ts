import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ToastrModule } from 'ngx-toastr';
import { TooltipModule } from 'ngx-bootstrap';

import {
    _WM_APP_PROJECT,
    AbstractDialogService,
    AbstractHttpService,
    AbstractI18nService,
    AbstractNavigationService,
    AbstractSpinnerService,
    AbstractToasterService,
    App,
    AppDefaults,
    CoreModule
} from '@wm/core';
import { DialogServiceImpl, WmComponentsModule } from '@wm/components';
import { SecurityModule } from '@wm/security';
import { OAuthModule } from '@wm/oAuth';
import { VariablesModule } from '@wm/variables';
import { HttpServiceImpl, HttpServiceModule } from '@wm/http';

import { AppComponent } from './app.component';
import { I18nServiceImpl } from '../framework/services/i18n.service';
import { AppRef } from '../framework/services/app.service';
import { ToasterServiceImpl } from '../framework/services/toaster.service';
import { SpinnerServiceImpl } from '../framework/services/spinner.service';
import { NavigationServiceImpl } from '../framework/services/navigation.service';
import { AppDefaultsService } from '../framework/services/app-defaults.service';
import { PipeProvider } from '../framework/services/pipe-provider.service';
import { MetadataResolve } from '../framework/resolves/metadata.resolve';
import { AppJSResolve } from '../framework/resolves/app-js.resolve';
import { I18nResolve } from '../framework/resolves/i18n.resolve';
import { AppManagerService } from '../framework/services/app.manager.service';
import { PrefabManagerService } from '../framework/services/prefab-manager.service';
import { CustomToasterComponent } from '../framework/components/custom-toaster.component';
import { PartialContainerDirective } from '../framework/directives/partial-container.directive';
import { getAllUserDefinedComponentRefs } from '../framework/util/page-util';
import { PrefabDirective } from '../framework/directives/prefab.directive';
import { AppVariablesResolve } from '../framework/resolves/app-variables.resolve';
import { AppSpinnerComponent } from '../framework/components/app-spinner.component';
import { AuthorizationResolve } from '../framework/resolves/authorization.resolve';

import initAppMeta from './app-meta';
import loadPrefabConfigs from './prefabs/prefab-config';
import { appRoutes } from './app-routes';

initAppMeta();
loadPrefabConfigs();

declare const _WM_APP_PROPERTIES;

export function InitializeApp(I18nService) {
    return () => {
        _WM_APP_PROJECT.id = location.href.split('/')[3];
        _WM_APP_PROJECT.cdnUrl = document.querySelector('[name="cdnUrl"]') && document.querySelector('[name="cdnUrl"]').getAttribute('content');
        return I18nService.loadDefaultLocale();
    };
}

export function setAngularLocale(I18nService) {
    return I18nService.isAngularLocaleLoaded() ? I18nService.getSelectedLocale() : I18nService.getDefaultSupportedLocale();
}


console.log(appRoutes);
console.log(...getAllUserDefinedComponentRefs());

@NgModule({
    declarations: [
        AppComponent,
        CustomToasterComponent,
        PartialContainerDirective,
        PrefabDirective,
        AppSpinnerComponent,

        getAllUserDefinedComponentRefs()
    ],
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        HttpClientModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(appRoutes, {useHash: true, scrollPositionRestoration: 'top'}),
        ToastrModule.forRoot({maxOpened: 1, autoDismiss: true }),
        TooltipModule.forRoot(),
        HttpClientXsrfModule.withOptions({
            cookieName: 'wm_xsrf_token',
            headerName: _WM_APP_PROPERTIES.xsrf_header_name
        }),


        CoreModule,
        WmComponentsModule,
        SecurityModule,
        OAuthModule,
        VariablesModule,
        HttpServiceModule
    ],
    providers: [
        {provide: App, useClass: AppRef},
        {provide: AbstractDialogService, useClass: DialogServiceImpl},
        {provide: AbstractToasterService, useClass: ToasterServiceImpl},
        {provide: AbstractI18nService, useClass: I18nServiceImpl},
        {provide: AbstractHttpService, useClass: HttpServiceImpl},
        {provide: AbstractSpinnerService, useClass: SpinnerServiceImpl},
        {provide: AbstractNavigationService, useClass: NavigationServiceImpl},
        {provide: AppDefaults, useClass: AppDefaultsService},
        {
            provide: APP_INITIALIZER,
            useFactory: InitializeApp,
            deps: [AbstractI18nService],
            multi: true
        },
        {
            provide: LOCALE_ID,
            useFactory: setAngularLocale,
            deps: [AbstractI18nService]
        },
        PipeProvider,
        MetadataResolve,
        AppJSResolve,
        AppVariablesResolve,
        AuthorizationResolve,
        I18nResolve,
        AppManagerService,
        AppResourceManagerService,
        PrefabManagerService,
        DecimalPipe,
        DatePipe
    ],
    entryComponents: getAllUserDefinedComponentRefs(),
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppModule {
}

