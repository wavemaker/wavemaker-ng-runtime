import {APP_INITIALIZER, LOCALE_ID, ModuleWithProviders, NgModule} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

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
    Viewport
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
import { AppDefaultsService } from './services/app-defaults.service';
import { AppManagerService } from './services/app.manager.service';
import { PrefabManagerService } from './services/prefab-manager.service';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { PageNotFoundGaurd } from './guards/page-not-found.gaurd';
import { AppJSResolve } from './resolves/app-js.resolve';
import { AppExtensionJSResolve } from './resolves/app-extension.resolve';
import { I18nResolve } from './resolves/i18n.resolve';
import { AppComponent } from './components/app-component/app.component';
import { HttpCallInterceptor } from './services/http-interceptor.services';
import { PrefabPreviewComponent } from './components/prefab-preview.component';
import { DynamicComponentRefProviderService } from './services/dynamic-component-ref-provider.service';
import { CanDeactivatePageGuard } from './guards/can-deactivate-page.guard';
import { MAX_CACHE_AGE, MAX_CACHE_SIZE } from './util/wm-route-reuse-strategy';

const initializeProjectDetails = () => {
    _WM_APP_PROJECT.id = location.href.split('/')[3];
    _WM_APP_PROJECT.cdnUrl = document.querySelector('[name="cdnUrl"]') && document.querySelector('[name="cdnUrl"]').getAttribute('content');
    _WM_APP_PROJECT.ngDest = 'ng-bundle/';
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

export function InitializeApp(I18nService) {
    return () => {
        initializeProjectDetails();
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
    DialogModule
];

// setting parseExpr as exprEvaluator for swipeAnimation
($.fn as any).swipeAnimation.expressionEvaluator = $parseExpr;

@NgModule({
    declarations: definitions,
    imports: [
        CommonModule,
        RouterModule,
        HttpClientModule,

        ToastrModule,
        WmComponentsModule,
        PrefabModule,
        MobileRuntimeModule,
        CoreModule,
        SecurityModule,
        OAuthModule,
        VariablesModule,
        HttpServiceModule,
        REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS
    ],
    exports: [
        definitions,

        CommonModule,

        WmComponentsModule,
        MobileRuntimeModule,
        CoreModule,
        SecurityModule,
        OAuthModule,
        VariablesModule,
        HttpServiceModule,
        REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS
    ],
    entryComponents: [CustomToasterComponent]
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
                    deps: [AbstractI18nService],
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
                DecimalPipe,
                DatePipe,
                AppManagerService,
                PrefabManagerService,
                AuthGuard,
                RoleGuard,
                PageNotFoundGaurd,
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
