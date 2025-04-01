import { APP_INITIALIZER, LOCALE_ID, ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ɵSharedStylesHost } from '@angular/platform-browser';
import { ɵDomRendererFactory2 } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import {
    _WM_APP_PROJECT,
    $parseExpr,
    AbstractI18nService,
    AbstractNavigationService,
    AbstractSpinnerService,
    AbstractToasterService,
    App,
    AppDefaults,
    DynamicComponentRefProvider,
    isObject,
    isIphone,
    isIpod,
    isIpad,
    Viewport,
    hasCordova
} from '@wm/core';
import { WmComponentsModule } from '@wm/components/base';
import { DialogBodyDirective, DialogFooterDirective, DialogHeaderComponent } from '@wm/components/dialogs';
import { ConfirmDialogComponent } from '@wm/components/dialogs/confirm-dialog';
import { DialogComponent } from '@wm/components/dialogs/design-dialog';
import { PrefabDirective, PrefabContainerDirective } from '@wm/components/prefab';
import { HttpServiceImpl } from '@wm/http';
import { VariablesService, MetadataService } from '@wm/variables';
import { OAuthService } from '@wm/oAuth';

import { AccessrolesDirective } from './directives/accessroles.directive';
import { AppSpinnerComponent } from './components/app-spinner.component';
import { CustomToasterComponent } from './components/custom-toaster.component';
import { EmptyPageComponent } from './components/empty-component/empty-page.component';
import { AppRef } from './services/app.service';
import { ToasterServiceImpl } from './services/toaster.service';
import { I18nServiceImpl } from './services/i18n.service';
import { SpinnerServiceImpl } from './services/spinner.service';
import { NavigationServiceImpl } from './services/navigation.service';
import { PipeService } from "./services/pipe.service";
import { AppDefaultsService } from './services/app-defaults.service';
import { AppManagerService } from './services/app.manager.service';
import { PrefabManagerService } from './services/prefab-manager.service';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { PageNotFoundGuard } from './guards/page-not-found.guard';
import { AppJSResolve } from './resolves/app-js.resolve';
import { AppExtensionJSResolve } from './resolves/app-extension.resolve';
import { I18nResolve } from './resolves/i18n.resolve';
import { AppComponent } from './components/app-component/app.component';
import { HttpCallInterceptor } from './services/http-interceptor.services';
import { PrefabPreviewComponent } from './components/prefab-preview.component';
import { DynamicComponentRefProviderService } from './services/dynamic-component-ref-provider.service';
import { CanDeactivatePageGuard } from './guards/can-deactivate-page.guard';
import { MAX_CACHE_AGE, MAX_CACHE_SIZE } from './util/wm-route-reuse-strategy';

//angular overrides
import { WMDomSharedStylesHost } from "./overrides/wm_shared_styles_host";
import { WMDomRendererFactory2 } from "./overrides/wm_dom_renderer";
import {
    PageDirective,
    LayoutDirective,
    ContentComponent,
    PageContentComponent,
    SpaPageDirective,
    RouterOutletDirective
} from "@wm/components/page";
import { FooterDirective } from "@wm/components/page/footer";
import { HeaderComponent } from "@wm/components/page/header";
import { LeftPanelDirective } from "@wm/components/page/left-panel";
import { RightPanelDirective } from "@wm/components/page/right-panel";
import { TopNavDirective } from "@wm/components/page/top-nav";
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
} from "@wm/components/basic";
import { ProgressBarComponent, ProgressCircleComponent } from "@wm/components/basic/progress";
import { RichTextEditorComponent } from "@wm/components/basic/rich-text-editor";
import { SearchComponent, ScrollableDirective } from "@wm/components/basic/search";
import { TreeComponent } from "@wm/components/basic/tree";
import { CalendarComponent } from "@wm/components/input/calendar";
import { ChipsComponent } from "@wm/components/input/chips";
import { ColorPickerComponent } from "@wm/components/input/color-picker";
import { CurrencyComponent } from "@wm/components/input/currency";
import {
    DateComponent,
    DatetimeComponent,
    TimeComponent,
    DateTimePickerComponent,
    TimePickerComponent,
    PickerComponent,
    PickerGroupComponent
} from "@wm/components/input/epoch";
import { FileUploadComponent } from "@wm/components/input/file-upload";
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
} from "@wm/components/input";
import { RatingComponent } from "@wm/components/input/rating";
import { SliderComponent } from "@wm/components/input/slider";
import {
    CardComponent,
    CardActionsDirective,
    CardContentComponent,
    CardFooterDirective
} from "@wm/components/data/card";
import {
    FormComponent,
    FormWidgetDirective,
    FormActionDirective,
    FormFieldDirective,
    LiveActionsDirective,
    DependsonDirective,
    LiveFilterDirective,
    LiveFormDirective
} from "@wm/components/data/form";
import { ListComponent, ListItemDirective } from "@wm/components/data/list";
import { LiveTableComponent } from "@wm/components/data/live-table";
import { PaginationComponent } from "@wm/components/data/pagination";
import {
    TableComponent,
    TableCUDDirective,
    TableFilterSortDirective,
    TableActionDirective,
    TableColumnDirective,
    TableColumnGroupDirective,
    TableRowDirective,
    TableRowActionDirective
} from "@wm/components/data/table";
import { ChartComponent } from "@wm/components/chart";
import { AccordionPaneComponent, AccordionDirective } from "@wm/components/containers/accordion";
import { LinearLayoutDirective, LinearLayoutItemDirective } from "@wm/components/containers/linear-layout";
import { LayoutgridDirective, LayoutGridRowDirective, LayoutGridColumnDirective } from "@wm/components/containers/layout-grid";
import { PanelComponent } from "@wm/components/containers/panel";
import { TabPaneComponent, TabsComponent } from "@wm/components/containers/tabs";
import { TileDirective } from "@wm/components/containers/tile";
import { WizardActionDirective, WizardStepDirective, WizardComponent } from "@wm/components/containers/wizard";
import { AlertDialogComponent } from "@wm/components/dialogs/alert-dialog";
import { IframeDialogComponent } from "@wm/components/dialogs/iframe-dialog";
import { LoginDialogDirective } from "@wm/components/dialogs/login-dialog";
import { PartialDialogComponent } from "@wm/components/dialogs/partial-dialog";
import { BreadcrumbComponent } from "@wm/components/navigation/breadcrumb";
import { MenuComponent, MenuDropdownComponent, MenuDropdownItemComponent, NavigationControlDirective, NavComponent, NavItemDirective } from "@wm/components/navigation/menu";
import { NavbarComponent } from "@wm/components/navigation/navbar";
import { PopoverComponent } from "@wm/components/navigation/popover";
import { CarouselDirective, CarouselTemplateDirective } from "@wm/components/advanced/carousel";
import { LoginComponent } from "@wm/components/advanced/login";
import { MarqueeDirective } from "@wm/components/advanced/marquee";
import { CustomWidgetDirective, CustomWidgetContainerDirective } from "@wm/components/advanced/custom";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { TimepickerModule as ngxTimepickerModule } from "ngx-bootstrap/timepicker";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { PaginationModule as ngxPaginationModule } from "ngx-bootstrap/pagination";
import { TypeaheadModule } from "ngx-bootstrap/typeahead";
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { CarouselModule as ngxCarouselModule } from "ngx-bootstrap/carousel";
import { PopoverModule as ngxPopoverModule } from "ngx-bootstrap/popover";
import { NgCircleProgressModule } from "ng-circle-progress";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { SecurityService } from '@wm/security';
import { PrefabDirective as PrefabLoader } from './directives/prefab.directive';

declare const _WM_APP_PROPERTIES;

const initializeProjectDetails = () => {
    let cdnUrl = document.querySelector('[name="deployUrl"]') && document.querySelector('[name="deployUrl"]').getAttribute('content');
    _WM_APP_PROJECT.isPreview = cdnUrl ? false : true;
    const apiUrl = document.querySelector('[name="apiUrl"]') && document.querySelector('[name="apiUrl"]').getAttribute('content');
    //for preview
    if (!cdnUrl) {
        cdnUrl = document.querySelector('[name="cdnUrl"]') && document.querySelector('[name="cdnUrl"]').getAttribute('content');
    }
    _WM_APP_PROJECT.id = hasCordova() ? _WM_APP_PROPERTIES.displayName : location.href.split('/')[3];
    // Integration with third party apps like in SSPA/WebComponents, this meta tag with cdnUrl will not be there then default it to ng-bundle/
    _WM_APP_PROJECT.apiUrl = apiUrl || './';
    _WM_APP_PROJECT.cdnUrl = cdnUrl || 'ng-bundle/';
    _WM_APP_PROJECT.ngDest = 'ng-bundle/';
    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        __webpack_require__.p = __webpack_public_path__ = cdnUrl;
    } catch (e) {
        //for app preview there is no webpack. Don't do anything.
    }
};

enum OS {
    IOS = 'ios',
    ANDROID = 'android'
}

export function getSettingProvider(key: string, defaultValue: unknown) {
    return {
        provide: key,
        useValue: defaultValue
    };
}

export function InitializeApp(I18nService, AppJSResolve) {
    return async () => {
        initializeProjectDetails();
        await AppJSResolve.resolve();
        return I18nService.loadDefaultLocale();
    };
}

export function setAngularLocale(I18nService) {
    initializeProjectDetails();
    return I18nService.deduceAppLocale();
}

const definitions = [
    AccessrolesDirective,
    AppSpinnerComponent,
    CustomToasterComponent,
    AppComponent,
    PrefabLoader,
    PrefabPreviewComponent,
    EmptyPageComponent
];

export const REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS = [
    ConfirmDialogComponent,
    DialogComponent,
    DialogBodyDirective,
    DialogFooterDirective,
    DialogHeaderComponent,

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
    ProgressBarComponent,
    ProgressCircleComponent,
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

// setting parseExpr as exprEvaluator for swipeAnimation
($.fn as any).swipeAnimation.expressionEvaluator = $parseExpr;

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        ...definitions,
        ToastrModule,
        WmComponentsModule,
        // CoreModule, 
        ...REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS
    ],
    exports: [
        FormsModule,
        ReactiveFormsModule,
        PrefabLoader,
        AccessrolesDirective,
        CommonModule,
        RouterModule,
        HttpClientModule,

        ToastrModule,
        WmComponentsModule,
        // CoreModule, 
        ...REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS
    ],
    providers: [
        { provide: ɵSharedStylesHost, useClass: WMDomSharedStylesHost },
        { provide: ɵDomRendererFactory2, useClass: WMDomRendererFactory2 },
        HttpServiceImpl,
    ]
})
export class RuntimeBaseModule {

    // this polyfill is to add support for CustomEvent in IE11
    static addCustomEventPolyfill() {
        if (typeof window['CustomEvent'] === 'function') {
            return false;
        }
        // Adding type as any to avoid error TS2322
        const CustomEvent: any = (event, params) => {
            params = params || { bubbles: false, cancelable: false, detail: null };
            const evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };

        CustomEvent.prototype = window['Event'].prototype;
        // ### ANGULAR9TODO ###
        window['CustomEvent'] = CustomEvent;
    }

    static forRoot(): ModuleWithProviders<RuntimeBaseModule> {
        return {
            ngModule: RuntimeBaseModule,
            providers: [
                { provide: App, useClass: AppRef },
                { provide: AbstractToasterService, useClass: ToasterServiceImpl },
                { provide: AbstractI18nService, useClass: I18nServiceImpl },
                { provide: AbstractSpinnerService, useClass: SpinnerServiceImpl },
                { provide: AbstractNavigationService, useClass: NavigationServiceImpl },
                { provide: AppDefaults, useClass: AppDefaultsService },
                { provide: DynamicComponentRefProvider, useClass: DynamicComponentRefProviderService },
                {
                    provide: APP_INITIALIZER,
                    useFactory: InitializeApp,
                    deps: [AbstractI18nService, AppJSResolve],
                    multi: true
                },
                {
                    provide: LOCALE_ID,
                    useFactory: setAngularLocale,
                    deps: [AbstractI18nService]
                },
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: HttpCallInterceptor,
                    multi: true
                },
                PipeService,
                DecimalPipe,
                DatePipe,
                AppManagerService,
                PrefabManagerService,
                AuthGuard,
                RoleGuard,
                PageNotFoundGuard,
                CanDeactivatePageGuard,
                AppJSResolve,
                AppExtensionJSResolve,
                I18nResolve,
                SecurityService,
                OAuthService,
                VariablesService,
                MetadataService,
                getSettingProvider(MAX_CACHE_SIZE, 10),
                getSettingProvider(MAX_CACHE_AGE, 30 * 60)
            ]
        };
    }

    constructor(
        app: App,
        viewport: Viewport) {
        RuntimeBaseModule.addCustomEventPolyfill();

        this.getDeviceDetails().then(details => {
            app.selectedViewPort = {
                os: details.os,
                category: details.selectedDeviceCategory
            };
            viewport.update(details);
            app.notify('on-viewport-details', details.os);
        });
    }


    private getDeviceDetails(): Promise<any> {
        return new Promise<any>(function (resolve, reject) {
            const msgContent = { key: 'on-load' };
            // Notify preview window that application is ready. Otherwise, identify the OS.
            if (window.top !== window) {
                window.top.postMessage(msgContent, '*');
                // This is for preview page
                window.onmessage = function (msg) {
                    const data = msg.data;
                    if (isObject(data) && data.key === 'switch-device') {
                        resolve(data.device);
                    }
                };
            } else if (isIphone() || isIpod() || isIpad()) {
                resolve({ 'os': OS.IOS });
            } else {
                resolve({ 'os': OS.ANDROID });
            }
        });
    }
}

export const WM_MODULES_FOR_ROOT = [
    WmComponentsModule.forRoot(),
    RuntimeBaseModule.forRoot()
];
