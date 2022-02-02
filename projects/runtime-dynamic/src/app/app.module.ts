import { Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { TimepickerModule as ngxTimepickerModule } from 'ngx-bootstrap/timepicker';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { PaginationModule as ngxPaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';


import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DatepickerModule as ngxDatepickerModule, } from 'ngx-bootstrap/datepicker';


import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule as ngxPopoverModule } from 'ngx-bootstrap/popover';

import { NgCircleProgressModule } from 'ng-circle-progress';
import { ToastNoAnimationModule } from 'ngx-toastr';
import { CarouselModule as ngxCarouselModule, } from 'ngx-bootstrap/carousel';

import { App, getWmProjectProperties, PartialRefProvider } from '@wm/core';
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

// Chart
import { ChartModule } from '@wm/components/chart';

// Containers
import { AccordionModule } from '@wm/components/containers/accordion';
import { LinearLayoutModule } from '@wm/components/containers/linear-layout';
import { LayoutGridModule } from '@wm/components/containers/layout-grid';
import { PanelModule } from '@wm/components/containers/panel';
import { TabsModule } from '@wm/components/containers/tabs';
import { TileModule } from '@wm/components/containers/tile';
import { WizardModule } from '@wm/components/containers/wizard';

// Dialogs
import { AlertDialogModule } from '@wm/components/dialogs/alert-dialog';
import { IframeDialogModule } from '@wm/components/dialogs/iframe-dialog';
import { LoginDialogModule } from '@wm/components/dialogs/login-dialog';
import { PartialDialogModule } from '@wm/components/dialogs/partial-dialog';

// Navigation
import { BreadcrumbModule } from '@wm/components/navigation/breadcrumb';
import { MenuModule } from '@wm/components/navigation/menu';
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
    WmRouteReuseStrategy,
    WM_MODULES_FOR_ROOT,
    REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS,
    AppExtensionProvider
} from '@wm/runtime/base';

import { routes } from './app.routes';
import { PageWrapperComponent } from './components/page-wrapper.component';
import { AppJSProviderService } from './services/app-js-provider.service';
import { AppVariablesProviderService } from './services/app-variables-provider.service';
import { AppExtensionProviderService } from './services/app-extension.service';
import { ComponentRefProviderService } from './services/component-ref-provider.service';
import { PrefabConfigProviderService } from './services/prefab-config-provider.service';
import { AppResourceManagerService } from './services/app-resource-manager.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export const routerModule = RouterModule.forRoot(routes, { useHash: true, scrollPositionRestoration: 'top' });
export const toastrModule = ToastNoAnimationModule.forRoot({ maxOpened: 1, autoDismiss: true });
export const httpClientXsrfModule = HttpClientXsrfModule.withOptions({
    cookieName: 'wm_xsrf_token',
    headerName: getWmProjectProperties().xsrf_header_name
});

export const modalModule: ModuleWithProviders<any> = ModalModule.forRoot();
export const bsDatePickerModule: ModuleWithProviders<any> = BsDatepickerModule.forRoot();
export const datepickerModule: ModuleWithProviders<any> = ngxDatepickerModule.forRoot();
export const timepickerModule: ModuleWithProviders<any> = ngxTimepickerModule.forRoot();
export const bsDropdownModule: ModuleWithProviders<any> = BsDropdownModule.forRoot();
export const paginationModule: ModuleWithProviders<any> = ngxPaginationModule.forRoot();
export const typeaheadModule: ModuleWithProviders<any> = TypeaheadModule.forRoot();
export const progressbarModule: ModuleWithProviders<any> = ProgressbarModule.forRoot();
export const carouselModule: ModuleWithProviders<any> = ngxCarouselModule.forRoot();
export const popoverModule: ModuleWithProviders<any> = ngxPopoverModule.forRoot();
export const ngCircleProgressModule: ModuleWithProviders<any> = NgCircleProgressModule.forRoot({});
export const tooltipModule: ModuleWithProviders<any> = TooltipModule.forRoot();

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
    TooltipModule,

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
    LinearLayoutModule,
    LayoutGridModule,
    PanelModule,
    TabsModule,
    TileModule,
    WizardModule,

    // dialogs
    AlertDialogModule,
    IframeDialogModule,
    LoginDialogModule,
    PartialDialogModule,

    // navigation
    BreadcrumbModule,
    MenuModule,
    NavbarModule,
    PopoverModule,

    // Advanced
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
REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS.push(FormsModule, ReactiveFormsModule);

@NgModule({
    declarations: [
        PageWrapperComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        RouterModule,
        HttpClientModule,

        modalModule,
        bsDatePickerModule,
        datepickerModule,
        timepickerModule,
        bsDropdownModule,
        paginationModule,
        typeaheadModule,
        tooltipModule,
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
        { provide: AppJSProvider, useClass: AppJSProviderService },
        { provide: AppVariablesProvider, useClass: AppVariablesProviderService },
        {provide: AppExtensionProvider,useClass:AppExtensionProviderService},
        { provide: ComponentRefProvider, useClass: ComponentRefProviderService },
        { provide: PartialRefProvider, useClass: ComponentRefProviderService },
        { provide: PrefabConfigProvider, useClass: PrefabConfigProviderService },
        { provide: RouteReuseStrategy, useClass: WmRouteReuseStrategy }
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
