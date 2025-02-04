import {APP_INITIALIZER, LOCALE_ID, ModuleWithProviders, NgModule} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ɵSharedStylesHost } from '@angular/platform-browser';
import {ɵDomRendererFactory2} from "@angular/platform-browser";
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
    CoreModule,
    DynamicComponentRefProvider,
    isObject,
    isIphone,
    isIpod,
    isIpad,
    Viewport,
    hasCordova
} from '@wm/core';
import { WmComponentsModule } from '@wm/components/base';
import { DialogModule } from '@wm/components/dialogs';
import { ConfirmDialogModule } from '@wm/components/dialogs/confirm-dialog';
import { DesignDialogModule } from '@wm/components/dialogs/design-dialog';
import { PrefabModule } from '@wm/components/prefab';
import { MobileRuntimeModule } from '@wm/mobile/runtime';
import { SecurityModule } from '@wm/security';
import { HttpServiceModule } from '@wm/http';
import { VariablesModule } from '@wm/variables';
import { OAuthModule } from '@wm/oAuth';

import { AccessrolesDirective } from './directives/accessroles.directive';
import { AppSpinnerComponent } from './components/app-spinner.component';
import { CustomToasterComponent } from './components/custom-toaster.component';
import { EmptyPageComponent } from './components/empty-component/empty-page.component';
import { PrefabDirective } from './directives/prefab.directive';
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
import {PageModule} from "@wm/components/page";
import {FooterModule} from "@wm/components/page/footer";
import {HeaderModule} from "@wm/components/page/header";
import {LeftPanelModule} from "@wm/components/page/left-panel";
import {RightPanelModule} from "@wm/components/page/right-panel";
import {TopNavModule} from "@wm/components/page/top-nav";
import {BasicModule} from "@wm/components/basic";
import {ProgressModule} from "@wm/components/basic/progress";
import {RichTextEditorModule} from "@wm/components/basic/rich-text-editor";
import {SearchModule} from "@wm/components/basic/search";
import {TreeModule} from "@wm/components/basic/tree";
import {CalendarModule} from "@wm/components/input/calendar";
import {ChipsModule} from "@wm/components/input/chips";
import {ColorPickerComponent} from "@wm/components/input/color-picker";
import {EpochModule} from "@wm/components/input/epoch";
import {FileUploadModule} from "@wm/components/input/file-upload";
import {InputModule} from "@wm/components/input";
import {RatingModule} from "@wm/components/input/rating";
import {SliderModule} from "@wm/components/input/slider";
import {CardModule} from "@wm/components/data/card";
import {FormModule} from "@wm/components/data/form";
import {ListModule} from "@wm/components/data/list";
import {LiveTableModule} from "@wm/components/data/live-table";
import {PaginationModule} from "@wm/components/data/pagination";
import {TableModule} from "@wm/components/data/table";
import {ChartModule} from "@wm/components/chart";
import {AccordionModule} from "@wm/components/containers/accordion";
import {LinearLayoutModule} from "@wm/components/containers/linear-layout";
import {LayoutGridModule} from "@wm/components/containers/layout-grid";
import {PanelModule} from "@wm/components/containers/panel";
import {TabsModule} from "@wm/components/containers/tabs";
import {TileModule} from "@wm/components/containers/tile";
import {WizardModule} from "@wm/components/containers/wizard";
import {AlertDialogModule} from "@wm/components/dialogs/alert-dialog";
import {IframeDialogModule} from "@wm/components/dialogs/iframe-dialog";
import {LoginDialogModule} from "@wm/components/dialogs/login-dialog";
import {PartialDialogModule} from "@wm/components/dialogs/partial-dialog";
import {BreadcrumbModule} from "@wm/components/navigation/breadcrumb";
import {MenuModule} from "@wm/components/navigation/menu";
import {NavbarModule} from "@wm/components/navigation/navbar";
import {PopoverModule} from "@wm/components/navigation/popover";
import {CarouselModule} from "@wm/components/advanced/carousel";
import {LoginModule} from "@wm/components/advanced/login";
import {MarqueeModule} from "@wm/components/advanced/marquee";
import {CustomModule} from "@wm/components/advanced/custom";
import {BsDatepickerModule} from "ngx-bootstrap/datepicker";
import {TimepickerModule as ngxTimepickerModule} from "ngx-bootstrap/timepicker";
import {BsDropdownModule} from "ngx-bootstrap/dropdown";
import {PaginationModule as ngxPaginationModule} from "ngx-bootstrap/pagination";
import {TypeaheadModule} from "ngx-bootstrap/typeahead";
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {CarouselModule as ngxCarouselModule} from "ngx-bootstrap/carousel";
import {PopoverModule as ngxPopoverModule} from "ngx-bootstrap/popover";
import {NgCircleProgressModule} from "ng-circle-progress";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import { CurrencyComponent } from '@wm/components/input/currency';

declare const _WM_APP_PROPERTIES;

const initializeProjectDetails = () => {
    let cdnUrl = document.querySelector('[name="deployUrl"]') && document.querySelector('[name="deployUrl"]').getAttribute('content');
    _WM_APP_PROJECT.isPreview = cdnUrl ? false : true;
    let apiUrl = document.querySelector('[name="apiUrl"]') && document.querySelector('[name="apiUrl"]').getAttribute('content');
    //for preview
    if(!cdnUrl) {
        cdnUrl = document.querySelector('[name="cdnUrl"]') && document.querySelector('[name="cdnUrl"]').getAttribute('content');
    }
    _WM_APP_PROJECT.id = hasCordova() ? _WM_APP_PROPERTIES.displayName : location.href.split('/')[3];
    // Integration with third party apps like in SSPA/WebComponents, this meta tag with cdnUrl will not be there then default it to ng-bundle/
    _WM_APP_PROJECT.apiUrl = apiUrl || './';
    _WM_APP_PROJECT.cdnUrl = cdnUrl || 'ng-bundle/';
    _WM_APP_PROJECT.ngDest = 'ng-bundle/';
    try {
        //@ts-ignore
        __webpack_require__.p = __webpack_public_path__ = cdnUrl;
    } catch(e) {
        //for app preview there is no webpack. Don't do anything.
    }
};

enum OS {
    IOS = 'ios',
    ANDROID = 'android'
}

export function getSettingProvider(key: string, defaultValue: any) {
    return {
        provide: key,
        useValue: defaultValue
    };
};

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
    PrefabDirective,
    AppComponent,
    PrefabPreviewComponent,
    EmptyPageComponent
];

export const REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS = [
    ConfirmDialogModule,
    DesignDialogModule,
    DialogModule,

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
    RichTextEditorModule,
    SearchModule,
    TreeModule,

    // Input
    CalendarModule,
    ChipsModule,
    ColorPickerComponent,
    EpochModule,
    FileUploadModule,
    InputModule,
    RatingModule,
    SliderModule,
    CurrencyComponent,
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
    CustomModule,

    PageModule,
    FooterModule,
    HeaderModule,
    LeftPanelModule,
    RightPanelModule,
    TopNavModule,
    PrefabModule
];

// setting parseExpr as exprEvaluator for swipeAnimation
($.fn as any).swipeAnimation.expressionEvaluator = $parseExpr;

@NgModule({
    declarations: [ ...definitions ],
    imports: [
        CommonModule,
        RouterModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,

        ToastrModule,
        WmComponentsModule,
        MobileRuntimeModule,
        CoreModule,
        SecurityModule,
        OAuthModule,
        VariablesModule,
        HttpServiceModule,
        ...REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS
    ],
    exports: [
        FormsModule,
        ReactiveFormsModule,

        ...definitions,

        CommonModule,
        RouterModule,
        HttpClientModule,

        ToastrModule,
        WmComponentsModule,
        MobileRuntimeModule,
        CoreModule,
        SecurityModule,
        OAuthModule,
        VariablesModule,
        HttpServiceModule,
        ...REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS
    ],
    providers: [
        {provide: ɵSharedStylesHost, useClass: WMDomSharedStylesHost},
        {provide: ɵDomRendererFactory2, useClass: WMDomRendererFactory2}
    ]
})
export class RuntimeBaseModule {

    // this polyfill is to add support for CustomEvent in IE11
    static addCustomEventPolyfill() {
            if ( typeof window['CustomEvent'] === 'function' ) {
                return false;
            }
            // Adding type as any to avoid error TS2322
            const CustomEvent: any = (event, params) => {
                params = params || { bubbles: false, cancelable: false, detail: null };
                const evt = document.createEvent( 'CustomEvent' );
                evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
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
                {provide: App, useClass: AppRef},
                {provide: AbstractToasterService, useClass: ToasterServiceImpl},
                {provide: AbstractI18nService, useClass: I18nServiceImpl},
                {provide: AbstractSpinnerService, useClass: SpinnerServiceImpl},
                {provide: AbstractNavigationService, useClass: NavigationServiceImpl},
                {provide: AppDefaults, useClass: AppDefaultsService},
                {provide: DynamicComponentRefProvider, useClass: DynamicComponentRefProviderService},
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
                getSettingProvider(MAX_CACHE_SIZE, 10),
                getSettingProvider(MAX_CACHE_AGE, 30 * 60)
            ]
        };
    }

    constructor(mobileRuntimeModule: MobileRuntimeModule,
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
            const msgContent = {key: 'on-load'};
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
                resolve({'os': OS.IOS});
            } else {
                resolve({'os': OS.ANDROID});
            }
        });
    }
}

export const WM_MODULES_FOR_ROOT = [
    WmComponentsModule.forRoot(),
    MobileRuntimeModule.forRoot(),
    CoreModule.forRoot(),
    SecurityModule.forRoot(),
    OAuthModule.forRoot(),
    VariablesModule.forRoot(),
    HttpServiceModule.forRoot(),
    RuntimeBaseModule.forRoot()
];
