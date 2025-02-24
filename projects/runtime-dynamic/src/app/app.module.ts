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

import { App, getWmProjectProperties, PartialRefProvider, CustomWidgetRefProvider, AbstractHttpService } from '@wm/core';
// Basic widgets

import {
    AnchorComponent,
    AudioComponent,
    HtmlDirective,
    IconComponent,
    IframeComponent,
    LabelDirective,
    PictureDirective,
    SpinnerComponent,
    VideoComponent
} from '@wm/components/basic';
import { ProgressBarComponent, ProgressCircleComponent } from '@wm/components/basic/progress';
import { RichTextEditorComponent } from '@wm/components/basic/rich-text-editor';
import { SearchComponent, ScrollableDirective } from '@wm/components/basic/search';
import { TreeComponent } from '@wm/components/basic/tree';

// input
import {
    ButtonComponent,
    ButtonGroupDirective,
    CaptionPositionDirective,
    CheckboxComponent,
    CheckboxsetComponent,
    CompositeDirective,
    NumberComponent,
    RadiosetComponent,
    SelectComponent,
    SwitchComponent,
    InputCalendarComponent,
    InputColorComponent,
    InputEmailComponent,
    InputNumberComponent,
    InputTextComponent,
    TextareaComponent
} from '@wm/components/input';
import { CalendarComponent } from '@wm/components/input/calendar';
import { ChipsComponent } from '@wm/components/input/chips';
import { ColorPickerComponent } from '@wm/components/input/color-picker';
import { CurrencyComponent } from '@wm/components/input/currency';
import {
    DateComponent,
    DatetimeComponent,
    TimeComponent,
    DateTimePickerComponent,
    TimePickerComponent,
    PickerComponent,
    PickerGroupComponent
} from '@wm/components/input/epoch';
import { FileUploadComponent } from '@wm/components/input/file-upload';
import { RatingComponent } from '@wm/components/input/rating';
import { SliderComponent } from '@wm/components/input/slider';

import { MobileRuntimeDynamicModule, MOBILE_COMPONENT_MODULES_FOR_ROOT } from '@wm/mobile/runtime/dynamic';

// Data
import {
    CardComponent,
    CardActionsDirective,
    CardContentComponent,
    CardFooterDirective
} from '@wm/components/data/card';
import {
    FormComponent,
    FormWidgetDirective,
    FormActionDirective,
    FormFieldDirective,
    LiveActionsDirective,
    DependsonDirective,
    LiveFilterDirective,
    LiveFormDirective
} from '@wm/components/data/form';
import { ListComponent, ListItemDirective } from '@wm/components/data/list';
import { LiveTableComponent } from '@wm/components/data/live-table';
import { PaginationComponent } from '@wm/components/data/pagination';
import {
    TableComponent,
    TableCUDDirective,
    TableFilterSortDirective,
    TableActionDirective,
    TableColumnDirective,
    TableColumnGroupDirective,
    TableRowDirective,
    TableRowActionDirective
} from '@wm/components/data/table';

// Chart
import { ChartComponent } from '@wm/components/chart';

// Containers
import { AccordionPaneComponent, AccordionDirective } from '@wm/components/containers/accordion';
import { LinearLayoutDirective, LinearLayoutItemDirective } from '@wm/components/containers/linear-layout';
import { LayoutgridDirective, LayoutGridRowDirective, LayoutGridColumnDirective } from '@wm/components/containers/layout-grid';
import { PanelComponent } from '@wm/components/containers/panel';
import { TabPaneComponent, TabsComponent } from '@wm/components/containers/tabs';
import { TileDirective } from '@wm/components/containers/tile';
import { WizardActionDirective, WizardStepDirective, WizardComponent } from '@wm/components/containers/wizard';

// Dialogs
import { AlertDialogComponent } from '@wm/components/dialogs/alert-dialog';
import { IframeDialogComponent } from '@wm/components/dialogs/iframe-dialog';
import { LoginDialogDirective } from '@wm/components/dialogs/login-dialog';
import { PartialDialogComponent } from '@wm/components/dialogs/partial-dialog';

// Navigation
import { BreadcrumbComponent } from '@wm/components/navigation/breadcrumb';
import { MenuComponent, MenuDropdownComponent, MenuDropdownItemComponent, NavigationControlDirective, NavComponent, NavItemDirective } from '@wm/components/navigation/menu';
import { NavbarComponent } from '@wm/components/navigation/navbar';
import { PopoverComponent } from '@wm/components/navigation/popover';

// Advanced
import { CarouselDirective, CarouselTemplateDirective } from '@wm/components/advanced/carousel';
import { LoginComponent } from '@wm/components/advanced/login';
import { MarqueeDirective } from '@wm/components/advanced/marquee';
import { CustomWidgetDirective, CustomWidgetContainerDirective } from '@wm/components/advanced/custom';

import {
    PageDirective,
    LayoutDirective,
    ContentComponent,
    PageContentComponent,
    SpaPageDirective,
    RouterOutletDirective
} from '@wm/components/page';
import { FooterDirective } from '@wm/components/page/footer';
import { HeaderComponent } from '@wm/components/page/header';
import { LeftPanelDirective } from '@wm/components/page/left-panel';
import { RightPanelDirective } from '@wm/components/page/right-panel';
import { TopNavDirective } from '@wm/components/page/top-nav';

import { PrefabDirective, PrefabContainerDirective } from '@wm/components/prefab';

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
import { HttpServiceImpl } from '@wm/http';

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
    AnchorComponent,
    AudioComponent,
    HtmlDirective,
    IconComponent,
    IframeComponent,
    LabelDirective,
    PictureDirective,
    SpinnerComponent,
    VideoComponent,
    ProgressBarComponent, ProgressCircleComponent,
    RichTextEditorComponent,
    SearchComponent, ScrollableDirective,
    TreeComponent,

    // Input
    CalendarComponent,
    ChipsComponent,
    ColorPickerComponent,
    CurrencyComponent,
    DateComponent,
    DatetimeComponent,
    TimeComponent,
    DateTimePickerComponent,
    TimePickerComponent,
    PickerComponent,
    PickerGroupComponent,
    FileUploadComponent,
    ButtonComponent,
    ButtonGroupDirective,
    CaptionPositionDirective,
    CheckboxComponent,
    CheckboxsetComponent,
    CompositeDirective,
    NumberComponent,
    RadiosetComponent,
    SelectComponent,
    SwitchComponent,
    InputCalendarComponent,
    InputColorComponent,
    InputEmailComponent,
    InputNumberComponent,
    InputTextComponent,
    TextareaComponent,
    RatingComponent,
    SliderComponent,

    // Data
    CardComponent,
    CardActionsDirective,
    CardContentComponent,
    CardFooterDirective,
    FormComponent,
    FormWidgetDirective,
    FormActionDirective,
    FormFieldDirective,
    LiveActionsDirective,
    DependsonDirective,
    LiveFilterDirective,
    LiveFormDirective,
    ListComponent, ListItemDirective,
    LiveTableComponent,
    PaginationComponent,
    TableComponent,
    TableCUDDirective,
    TableFilterSortDirective,
    TableActionDirective,
    TableColumnDirective,
    TableColumnGroupDirective,
    TableRowDirective,
    TableRowActionDirective,

    // chart
    ChartComponent,

    // container modules
    AccordionPaneComponent, AccordionDirective,
    LinearLayoutDirective, LinearLayoutItemDirective,
    LayoutgridDirective, LayoutGridRowDirective, LayoutGridColumnDirective,
    PanelComponent,
    TabPaneComponent, TabsComponent,
    TileDirective,
    WizardActionDirective, WizardStepDirective, WizardComponent,

    // dialogs
    AlertDialogComponent,
    IframeDialogComponent,
    LoginDialogDirective,
    PartialDialogComponent,

    // navigation
    BreadcrumbComponent,
    MenuComponent, MenuDropdownComponent, MenuDropdownItemComponent, NavigationControlDirective, NavComponent, NavItemDirective,
    NavbarComponent,
    PopoverComponent,

    // Advanced
    CarouselDirective, CarouselTemplateDirective,
    LoginComponent,
    MarqueeDirective,
    CustomWidgetDirective, CustomWidgetContainerDirective,

    PageDirective,
    LayoutDirective,
    ContentComponent,
    PageContentComponent,
    SpaPageDirective,
    RouterOutletDirective,
    FooterDirective,
    HeaderComponent,
    LeftPanelDirective,
    RightPanelDirective,
    TopNavDirective,

    PrefabDirective, PrefabContainerDirective
];

REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS.push(...componentsModule as any);
REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS.push(...MOBILE_COMPONENT_MODULES_FOR_ROOT as any);
REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS.push(FormsModule as any, ReactiveFormsModule as any);

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
        { provide: AbstractHttpService, useClass: HttpServiceImpl }
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
