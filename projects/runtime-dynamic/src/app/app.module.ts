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
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule as ngxPopoverModule } from 'ngx-bootstrap/popover';

import { NgCircleProgressModule } from 'ng-circle-progress';
import { ToastNoAnimationModule } from 'ngx-toastr';
import { CarouselModule as ngxCarouselModule, } from 'ngx-bootstrap/carousel';

import { App, getWmProjectProperties, PartialRefProvider, CustomWidgetRefProvider } from '@wm/core';
// Basic widgets

import { BasicModule } from '@wm/components/basic';
import { ProgressModule } from '@wm/components/basic/progress';
import { RichTextEditorComponent } from '@wm/components/basic/rich-text-editor';
import { SearchModule } from '@wm/components/basic/search';
import { TreeComponent } from '@wm/components/basic/tree';

// input
import { InputModule } from '@wm/components/input';
import { CalendarModule } from '@wm/components/input/calendar';
import { ChipsModule } from '@wm/components/input/chips';
import { ColorPickerComponent } from '@wm/components/input/color-picker';
import { EpochModule } from '@wm/components/input/epoch';
import { FileUploadComponent } from '@wm/components/input/file-upload';
import { RatingComponent } from '@wm/components/input/rating';
import { SliderComponent } from '@wm/components/input/slider';

import { MobileRuntimeDynamicModule, MOBILE_COMPONENT_MODULES_FOR_ROOT } from '@wm/mobile/runtime/dynamic';

// Data
import { CardModule } from '@wm/components/data/card';
import { FormModule } from '@wm/components/data/form';
import { ListModule } from '@wm/components/data/list';
import { LiveTableComponent } from '@wm/components/data/live-table';
import { PaginationModule } from '@wm/components/data/pagination';
import { TableModule } from '@wm/components/data/table';

// Chart
import { ChartComponent } from '@wm/components/chart';

// Containers
import { AccordionModule } from '@wm/components/containers/accordion';
import { LinearLayoutModule } from '@wm/components/containers/linear-layout';
import { LayoutGridModule } from '@wm/components/containers/layout-grid';
import { PanelModule } from '@wm/components/containers/panel';
import { TabsModule } from '@wm/components/containers/tabs';
import { TileModule } from '@wm/components/containers/tile';
import { WizardModule } from '@wm/components/containers/wizard';

// Dialogs
import { AlertDialogComponent } from '@wm/components/dialogs/alert-dialog';
import { IframeDialogComponent } from '@wm/components/dialogs/iframe-dialog';
import { LoginDialogModule } from '@wm/components/dialogs/login-dialog';
import { PartialDialogComponent } from '@wm/components/dialogs/partial-dialog';

// Navigation
import { BreadcrumbComponent } from '@wm/components/navigation/breadcrumb';
import { MenuModule } from '@wm/components/navigation/menu';
import { NavbarComponent } from '@wm/components/navigation/navbar';
import { PopoverComponent } from '@wm/components/navigation/popover';

// Advanced
import { CarouselModule } from '@wm/components/advanced/carousel';
import { LoginComponent } from '@wm/components/advanced/login';
import { MarqueeModule } from '@wm/components/advanced/marquee';
import { CustomModule } from '@wm/components/advanced/custom';

import { PageModule } from '@wm/components/page';
import { FooterModule } from '@wm/components/page/footer';
import { HeaderComponent } from '@wm/components/page/header';
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
    CustomwidgetConfigProvider,
    REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS,
    AppExtensionProvider
} from '@wm/runtime/base';

import { routes } from './app.routes';
import { PageWrapperComponent } from './components/page-wrapper.component';
import { AppJSProviderService } from './services/app-js-provider.service';
import { AppVariablesProviderService } from './services/app-variables-provider.service';
import { AppExtensionProviderService } from './services/app-extension.service';
import { ComponentRefProviderService } from './services/component-ref-provider.service';
import { CustomwidgetConfigProviderService } from './services/customwidget-config-provider.service';
import { PrefabConfigProviderService } from './services/prefab-config-provider.service';
import { AppResourceManagerService } from './services/app-resource-manager.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CurrencyComponent } from '@wm/components/input/currency';


export const routerModule = RouterModule.forRoot(routes, { useHash: true, scrollPositionRestoration: 'top' });
export const toastrModule = ToastNoAnimationModule.forRoot({ maxOpened: 1, autoDismiss: true });

// In angular 15, xsrf headerName should not be null. Angular 15 is not using default header value like it used to send in calls
// for angular 12 if the headerName is null . The user has to take care of not sending null values. Then ng 15 uses default value for headerName
const xsrfHeaderName = getWmProjectProperties().xsrf_header_name;
const xsrfOptions = {
    cookieName: 'wm_xsrf_token'
}
if (xsrfHeaderName) {
    xsrfOptions['headerName'] = xsrfHeaderName;
}
export const httpClientXsrfModule = HttpClientXsrfModule.withOptions(xsrfOptions);

export const modalModule: ModuleWithProviders<ModalModule> = ModalModule.forRoot();
export const bsDatePickerModule: ModuleWithProviders<BsDatepickerModule> = BsDatepickerModule.forRoot();
export const timepickerModule: ModuleWithProviders<ngxTimepickerModule> = ngxTimepickerModule.forRoot();
export const bsDropdownModule: ModuleWithProviders<BsDropdownModule> = BsDropdownModule.forRoot();
export const paginationModule: ModuleWithProviders<ngxPaginationModule> = ngxPaginationModule.forRoot();
export const typeaheadModule: ModuleWithProviders<TypeaheadModule> = TypeaheadModule.forRoot();
export const progressbarModule: ModuleWithProviders<ProgressbarModule> = ProgressbarModule.forRoot();
export const carouselModule: ModuleWithProviders<ngxCarouselModule> = ngxCarouselModule.forRoot();
export const popoverModule: ModuleWithProviders<ngxPopoverModule> = ngxPopoverModule.forRoot();
export const ngCircleProgressModule: ModuleWithProviders<NgCircleProgressModule> = NgCircleProgressModule.forRoot({});
export const tooltipModule: ModuleWithProviders<TooltipModule> = TooltipModule.forRoot();

const componentsModule = [
    // NGX Bootstrap
    BsDatepickerModule,
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
    RichTextEditorComponent,
    SearchModule,
    TreeComponent,

    // Input
    CalendarModule,
    ChipsModule,
    EpochModule,
    FileUploadComponent,
    InputModule,
    RatingComponent,
    SliderComponent,

    // Data
    CardModule,
    FormModule,
    ListModule,
    LiveTableComponent,
    PaginationModule,
    TableModule,

    // chart
    ChartComponent,

    // container modules
    AccordionModule,
    LinearLayoutModule,
    LayoutGridModule,
    PanelModule,
    TabsModule,
    TileModule,
    WizardModule,

    // dialogs
    AlertDialogComponent,
    IframeDialogComponent,
    LoginDialogModule,
    PartialDialogComponent,

    // navigation
    BreadcrumbComponent,
    MenuModule,
    NavbarComponent,
    PopoverComponent,

    // Advanced
    CarouselModule,
    LoginComponent,
    MarqueeModule,
    CustomModule,

    PageModule,
    FooterModule,
    HeaderComponent,
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
        timepickerModule,
        bsDropdownModule,
        paginationModule,
        typeaheadModule,
        tooltipModule,
        progressbarModule,
        carouselModule,
        popoverModule,
        ngCircleProgressModule,
        ColorPickerComponent,
        CurrencyComponent,    
        routerModule,
        toastrModule,
        httpClientXsrfModule,
        MobileRuntimeDynamicModule,
        WM_MODULES_FOR_ROOT
    ],
    providers: [
        AppResourceManagerService,
        { provide: AppJSProvider, useClass: AppJSProviderService },
        { provide: AppVariablesProvider, useClass: AppVariablesProviderService },
        { provide: AppExtensionProvider, useClass: AppExtensionProviderService },
        { provide: ComponentRefProvider, useClass: ComponentRefProviderService },
        { provide: PartialRefProvider, useClass: ComponentRefProviderService },
        { provide: CustomWidgetRefProvider, useClass: ComponentRefProviderService },
        { provide: CustomwidgetConfigProvider, useClass: CustomwidgetConfigProviderService },
        { provide: PrefabConfigProvider, useClass: PrefabConfigProviderService },
        { provide: RouteReuseStrategy, useClass: WmRouteReuseStrategy },
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
