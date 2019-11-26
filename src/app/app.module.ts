import { NgModule, ModuleWithProviders } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
    BsDatepickerModule,
    BsDropdownModule,
    CarouselModule as ngxCarouselModule,
    DatepickerModule as ngxDatepickerModule,
    PaginationModule as ngxPaginationModule,
    PopoverModule as ngxPopoverModule,
    ProgressbarModule,
    TimepickerModule as ngxTimepickerModule,
    TypeaheadModule
} from 'ngx-bootstrap';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { ToastrModule } from 'ngx-toastr';

import {
    AppComponent,
    AppJSProvider,
    AppVariablesProvider,
    ComponentRefProvider,
    PartialRefProvider,
    PrefabConfigProvider,
    WM_MODULES_FOR_ROOT
} from '@wm/runtime/base';

import { routes } from './app.routes';
import { AppJSProviderService } from '../framework/services/app-js-provider.service';
import { AppVariablesProviderService } from '../framework/services/app-variables-provider.service';
import { ComponentRefProviderService } from '../framework/services/component-ref-provider.service';
import { PartialRefProviderService } from '../framework/services/partial-ref-provider.service';
import { PrefabConfigProviderService } from '../framework/services/prefab-config-provider.service';
import { AppCodeGenModule, xsrfHeaderName } from './app-codegen.module';
import { LazyLoadScriptsResolve } from './lazy-load-scripts.resolve';

export const routerModule = RouterModule.forRoot(routes, {useHash: true, scrollPositionRestoration: 'top'});
export const toastrModule = ToastrModule.forRoot({maxOpened: 1, autoDismiss: true });
export const httpClientXsrfModule = HttpClientXsrfModule.withOptions({
    cookieName: 'wm_xsrf_token',
    headerName: xsrfHeaderName
});

export const bsDatePickerModule: ModuleWithProviders = BsDatepickerModule.forRoot();
export const datepickerModule: ModuleWithProviders = ngxDatepickerModule.forRoot();
export const timepickerModule: ModuleWithProviders = ngxTimepickerModule.forRoot();
export const bsDropdownModule: ModuleWithProviders = BsDropdownModule.forRoot();
export const paginationModule: ModuleWithProviders = ngxPaginationModule.forRoot();
export const typeaheadModule: ModuleWithProviders = TypeaheadModule.forRoot();
export const progressbarModule: ModuleWithProviders = ProgressbarModule.forRoot();
export const carouselModule: ModuleWithProviders = ngxCarouselModule.forRoot();
export const popoverModule: ModuleWithProviders = ngxPopoverModule.forRoot();
export const ngCircleProgressModule: ModuleWithProviders = NgCircleProgressModule.forRoot({});

@NgModule({
    declarations: [],
    imports: [
        BrowserModule,
        CommonModule,
        RouterModule,
        HttpClientModule,
        BrowserAnimationsModule,

        bsDatePickerModule,
        datepickerModule,
        timepickerModule,
        bsDropdownModule,
        paginationModule,
        typeaheadModule,
        progressbarModule,
        carouselModule,
        popoverModule,
        ngCircleProgressModule,

        routerModule,
        toastrModule,
        httpClientXsrfModule,

        WM_MODULES_FOR_ROOT,
        AppCodeGenModule
    ],
    providers: [
        {provide: AppJSProvider, useClass: AppJSProviderService},
        {provide: AppVariablesProvider, useClass: AppVariablesProviderService},
        {provide: ComponentRefProvider, useClass: ComponentRefProviderService},
        {provide: PartialRefProvider, useClass: ComponentRefProviderService},
        {provide: PrefabConfigProvider, useClass: PrefabConfigProviderService},
        LazyLoadScriptsResolve
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
