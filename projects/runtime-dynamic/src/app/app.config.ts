import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER, LOCALE_ID } from "@angular/core";
import { provideRouter, RouteReuseStrategy, withComponentInputBinding, withHashLocation } from "@angular/router";
import { provideHttpClient, withXsrfConfiguration, HTTP_INTERCEPTORS } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { routes } from "./app.routes";
import { HttpServiceImpl } from "@wm/http";
import { SecurityService } from "@wm/security";
import { VariablesService, MetadataService } from "@wm/variables";
import { OAuthService } from "@wm/oAuth";
import {
    AppJSProvider,
    AppVariablesProvider,
    ComponentRefProvider,
    PrefabConfigProvider,
    AppExtensionProvider,
    CustomwidgetConfigProvider,
    AppDefaultsService,
    AppExtensionJSResolve,
    AppJSResolve,
    AppManagerService,
    AppRef,
    I18nServiceImpl,
    NavigationServiceImpl,
    SpinnerServiceImpl,
    ToasterServiceImpl,
    DynamicComponentRefProviderService,
    HttpCallInterceptor,
    PrefabManagerService,
    CanDeactivatePageGuard,
    PageNotFoundGuard,
    I18nResolve,
    RoleGuard,
    PipeService,
    AuthGuard,
    WmRouteReuseStrategy
} from "@wm/runtime/base";
import {
    AbstractDialogService,
    AbstractHttpService,
    AbstractI18nService,
    AbstractNavigationService,
    AbstractSpinnerService,
    AbstractToasterService,
    App,
    AppDefaults,
    CustomWidgetRefProvider,
    DynamicComponentRefProvider,
    PartialRefProvider,
    _WM_APP_PROJECT, 
} from "@wm/core";
import { ModalModule } from "ngx-bootstrap/modal";
import { ToastNoAnimationModule } from "ngx-toastr";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { NgCircleProgressModule } from "ng-circle-progress";
import { DatePipe, DecimalPipe } from "@angular/common";
import { CustomwidgetConfigProviderService } from "./services/customwidget-config-provider.service";
import { AppJSProviderService } from "./services/app-js-provider.service";
import { AppVariablesProviderService } from "./services/app-variables-provider.service";
import { AppExtensionProviderService } from "./services/app-extension.service";
import { ComponentRefProviderService } from "./services/component-ref-provider.service";
import { PrefabConfigProviderService } from "./services/prefab-config-provider.service";
import { AppResourceManagerService } from "./services/app-resource-manager.service";
import { CustomPipe, DialogServiceImpl, FilterPipe, ImagePipe, SanitizePipe, ToDatePipe, TrailingZeroDecimalPipe, TrustAsPipe } from "@wm/components/base";


const wmModules = [
    importProvidersFrom(
        ModalModule.forRoot(),
        ToastNoAnimationModule.forRoot({ maxOpened: 1, autoDismiss: true }),
        BsDatepickerModule.forRoot(),
        NgCircleProgressModule.forRoot(),
    )
];
export const xsrfHeaderName = "X-WM-XSRF-TOKEN";




const initializeProjectDetails = () => {
    let cdnUrl = document.querySelector('[name="deployUrl"]') && document.querySelector('[name="deployUrl"]').getAttribute('content');
    _WM_APP_PROJECT.isPreview = cdnUrl ? false : true;
    const apiUrl = document.querySelector('[name="apiUrl"]') && document.querySelector('[name="apiUrl"]').getAttribute('content');
    //for preview
    if (!cdnUrl) {
        cdnUrl = document.querySelector('[name="cdnUrl"]') && document.querySelector('[name="cdnUrl"]').getAttribute('content');
    }
    _WM_APP_PROJECT.id = location.href.split('/')[3];
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

export const appConfig: ApplicationConfig = {
    providers: [
        // Provide Angular core services
        provideRouter(routes, withHashLocation(), withComponentInputBinding()),
        provideHttpClient(
            withXsrfConfiguration({
                cookieName: "wm_xsrf_token",
                headerName: xsrfHeaderName
            })
        ),
        provideAnimations(),
        // Provide application-specific services 
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
        { provide: App, useClass: AppRef },
        { provide: AbstractToasterService, useClass: ToasterServiceImpl },
        { provide: AbstractI18nService, useClass: I18nServiceImpl },
        { provide: AbstractSpinnerService, useClass: SpinnerServiceImpl },
        { provide: AbstractNavigationService, useClass: NavigationServiceImpl },
        { provide: AbstractDialogService, useClass: DialogServiceImpl },
        { provide: AppDefaults, useClass: AppDefaultsService },
        { provide: DynamicComponentRefProvider, useClass: DynamicComponentRefProviderService },
        { provide: AppJSProvider, useClass: AppJSProviderService },
        { provide: AppVariablesProvider, useClass: AppVariablesProviderService },
        { provide: AppExtensionProvider, useClass: AppExtensionProviderService },
        { provide: ComponentRefProvider, useClass: ComponentRefProviderService },
        { provide: PartialRefProvider, useClass: ComponentRefProviderService },
        { provide: CustomWidgetRefProvider, useClass: ComponentRefProviderService },
        { provide: CustomwidgetConfigProvider, useClass: CustomwidgetConfigProviderService },
        { provide: PrefabConfigProvider, useClass: PrefabConfigProviderService },
        { provide: RouteReuseStrategy, useClass: WmRouteReuseStrategy },
        { provide: AbstractHttpService, useClass: HttpServiceImpl },
        AppResourceManagerService,
        PipeService,
        DecimalPipe,
        SanitizePipe,
        ToDatePipe,
        FilterPipe,
        TrailingZeroDecimalPipe,
        TrustAsPipe,
        ImagePipe,
        CustomPipe,
        Location,
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
        ...wmModules,
    ]
};