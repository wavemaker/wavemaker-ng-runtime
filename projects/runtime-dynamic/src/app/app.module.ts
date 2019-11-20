import { Injector, ModuleWithProviders, NgModule } from '@angular/core';
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

import { App, getWmProjectProperties } from '@wm/core';
// Basic widgets
import { BasicModule } from '@wm/components/basic';
import { ProgressModule } from '@wm/components/basic/progress';
import { RichTextEditorModule } from '@wm/components/basic/rich-text-editor';
import { SearchModule } from '@wm/components/basic/search';
import { TreeModule } from '@wm/components/basic/tree';

// input
import { InputModule } from '@wm/components/input';
import { CalendarModule } from '@wm/components/input/calendar';
import { ChipsModule } from '@wm/components/input/chips';
import { ColorPickerModule } from '@wm/components/input/color-picker';
import { CurrencyModule } from '@wm/components/input/currency';
import { EpochModule } from '@wm/components/input/epoch';
import { FileUploadModule } from '@wm/components/input/file-upload';
import { RatingModule } from '@wm/components/input/rating';
import { SliderModule } from '@wm/components/input/slider';

import { MOBILE_COMPONENT_MODULES_FOR_ROOT } from '@wm/mobile/runtime/dynamic';

// Data
import { CardModule } from '@wm/components/data/card';
import { FormModule } from '@wm/components/data/form';
import { ListModule } from '@wm/components/data/list';
import { LiveTableModule } from '@wm/components/data/live-table';
import { PaginationModule } from '@wm/components/data/pagination';
import { TableModule } from '@wm/components/data/table';

//Chart
import { ChartModule } from '@wm/components/chart';

//Containers
import { AccordionModule } from '@wm/components/containers/accordion';
import { LayoutGridModule } from '@wm/components/containers/layout-grid';
import { PanelModule } from '@wm/components/containers/panel';
import { TabsModule } from '@wm/components/containers/tabs';
import { TileModule } from '@wm/components/containers/tile';
import { WizardModule } from '@wm/components/containers/wizard';

//Dialogs
import { AlertDialogModule } from '@wm/components/dialogs/alert-dialog';
import { ConfirmDialogModule } from '@wm/components/dialogs/confirm-dialog';
import { DesignDialogModule } from '@wm/components/dialogs/design-dialog';
import { IframeDialogModule } from '@wm/components/dialogs/iframe-dialog';
import { LoginDialogModule } from '@wm/components/dialogs/login-dialog';
import { PartialDialogModule } from '@wm/components/dialogs/partial-dialog';

// Navigation
import { BreadcrumbModule } from '@wm/components/navigation/breadcrumb';
import { MenuModule } from '@wm/components/navigation/menu';
import { NavModule } from '@wm/components/navigation/nav';
import { NavbarModule } from '@wm/components/navigation/navbar';
import { PopoverModule } from '@wm/components/navigation/popover';

// Advanced
import { CarouselModule } from '@wm/components/advanced/carousel';
import { LoginModule } from '@wm/components/advanced/login';
import { MarqueeModule } from '@wm/components/advanced/marquee';

import { PageModule } from '@wm/components/page';
import { FooterModule } from '@wm/components/page/footer';
import { HeaderModule } from '@wm/components/page/header';
import { LeftPanelModule } from '@wm/components/page/left-panel';
import { RightPanelModule } from '@wm/components/page/right-panel';
import { TopNavModule } from '@wm/components/page/top-nav';

import { PrefabModule } from '@wm/components/prefab';

import {
    AppComponent,
    AppJSProvider,
    AppVariablesProvider,
    ComponentRefProvider,
    PrefabConfigProvider,
    WM_MODULES_FOR_ROOT,
    PartialRefProvider,
    REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS
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

const componentsModule = [
    // NGX Bootstrap
    BsDatepickerModule,
    ngxDatepickerModule,
    ngxTimepickerModule,
    BsDropdownModule,
    ngxPaginationModule,
    TypeaheadModule,
    ProgressbarModule,
    ngxCarouselModule,
    ngxPopoverModule,
    NgCircleProgressModule,

    // Basic widgets
    BasicModule,
    ProgressModule,
    RichTextEditorModule,
    SearchModule,
    TreeModule,

    // Input
    CalendarModule,
    ChipsModule,
    ColorPickerModule,
    CurrencyModule,
    EpochModule,
    FileUploadModule,
    InputModule,
    RatingModule,
    SliderModule,

    // Data
    CardModule,
    FormModule,
    ListModule,
    LiveTableModule,
    PaginationModule,
    TableModule,

    // chart
    ChartModule,

    // container modules
    AccordionModule,
    LayoutGridModule,
    PanelModule,
    TabsModule,
    TileModule,
    WizardModule,

    // dialogs
    AlertDialogModule,
    ConfirmDialogModule,
    DesignDialogModule,
    IframeDialogModule,
    LoginDialogModule,
    PartialDialogModule,

    // navigation
    BreadcrumbModule,
    MenuModule,
    NavModule,
    NavbarModule,
    PopoverModule,

    //Advanced
    CarouselModule,
    LoginModule,
    MarqueeModule,

    PageModule,
    FooterModule,
    HeaderModule,
    LeftPanelModule,
    RightPanelModule,
    TopNavModule,

    PrefabModule
];

REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS.push(...componentsModule);
REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS.push(...MOBILE_COMPONENT_MODULES_FOR_ROOT);

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

        WM_MODULES_FOR_ROOT
    ],
    providers: [
        AppResourceManagerService,
        {provide: AppJSProvider, useClass: AppJSProviderService},
        {provide: AppVariablesProvider, useClass: AppVariablesProviderService},
        {provide: ComponentRefProvider, useClass: ComponentRefProviderService},
        {provide: PartialRefProvider, useClass: ComponentRefProviderService},
        {provide: PrefabConfigProvider, useClass: PrefabConfigProviderService}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor(private app: App, private inj: Injector, private componentRefProvider: ComponentRefProvider) {
        if (window['cordova']) {
            // clear the cached urls on logout, to load the Login Page and not the Main Page as app reload(window.location.reload) is not invoked in mobile
            this.app.subscribe('userLoggedOut', this.componentRefProvider.clearComponentFactoryRefCache.bind(this.componentRefProvider));
        }
    }
}
