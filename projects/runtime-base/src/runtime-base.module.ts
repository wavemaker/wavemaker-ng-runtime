import {APP_INITIALIZER, LOCALE_ID, ModuleWithProviders, NgModule} from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { BsDropdownModule, CarouselModule, ModalModule, PopoverModule, TooltipModule } from 'ngx-bootstrap';

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
    DynamicComponentRefProvider
} from '@wm/core';
import { WmComponentsModule } from '@wm/components';
import { MobileRuntimeModule } from '@wm/mobile/runtime';
import { SecurityModule } from '@wm/security';
import { HttpServiceModule } from '@wm/http';
import { VariablesModule } from '@wm/variables';
import { OAuthModule } from '@wm/oAuth';

import { AccessrolesDirective } from './directives/accessroles.directive';
import { PartialContainerDirective } from './directives/partial-container.directive';
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
import { I18nResolve } from './resolves/i18n.resolve';
import { AppComponent } from './components/app-component/app.component';
import { HttpCallInterceptor } from './services/http-interceptor.services';
import { PrefabPreviewComponent } from './components/prefab-preview.component';
import { DynamicComponentRefProviderService } from './services/dynamic-component-ref-provider.service';

export function InitializeApp(I18nService) {
    return () => {
        _WM_APP_PROJECT.id = location.href.split('/')[3];
        _WM_APP_PROJECT.cdnUrl = document.querySelector('[name="cdnUrl"]') && document.querySelector('[name="cdnUrl"]').getAttribute('content');
        _WM_APP_PROJECT.ngDest = 'ng-bundle/';
        return I18nService.loadDefaultLocale();
    };
}

export function setAngularLocale(I18nService) {
    return I18nService.isAngularLocaleLoaded() ? I18nService.getSelectedLocale() : I18nService.getDefaultSupportedLocale();
}

const definitions = [
    AccessrolesDirective,
    PartialContainerDirective,
    AppSpinnerComponent,
    CustomToasterComponent,
    PrefabDirective,
    AppComponent,
    PrefabPreviewComponent,
    EmptyPageComponent
];

export const modalModule = ModalModule.forRoot();
export const carouselModule = CarouselModule.forRoot();
export const bsDropDownModule = BsDropdownModule.forRoot();
export const popoverModule = PopoverModule.forRoot();
export const tooltipModule = TooltipModule.forRoot();

// setting parseExpr as exprEvaluator for swipeAnimation
($.fn as any).swipeAnimation.expressionEvaluator = $parseExpr;

@NgModule({
    declarations: definitions,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ReactiveFormsModule,
        HttpClientModule,

        modalModule,
        carouselModule,
        bsDropDownModule,
        popoverModule,
        tooltipModule,

        WmComponentsModule,
        MobileRuntimeModule,
        CoreModule,
        SecurityModule,
        OAuthModule,
        VariablesModule,
        HttpServiceModule,
    ],
    exports: [
        definitions,

        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        ModalModule,
        CarouselModule,
        BsDropdownModule,
        PopoverModule,
        TooltipModule,

        WmComponentsModule,
        MobileRuntimeModule,
        CoreModule,
        SecurityModule,
        OAuthModule,
        VariablesModule,
        HttpServiceModule
    ],
    entryComponents: [CustomToasterComponent]
})
export class RuntimeBaseModule {

    static forRoot(): ModuleWithProviders {
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
                AppJSResolve,
                I18nResolve
            ]
        };
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
