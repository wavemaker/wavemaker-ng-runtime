import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';

import {
    _WM_APP_PROJECT,
    AbstractI18nService,
    AbstractNavigationService,
    AbstractSpinnerService,
    AbstractToasterService,
    App,
    AppDefaults,
    CoreModule
} from '@wm/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';

import { BsDropdownModule, CarouselModule, ModalModule, PopoverModule, TooltipModule } from 'ngx-bootstrap';

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
import { AppJSResolve } from './resolves/app-js.resolve';
import { I18nResolve } from './resolves/i18n.resolve';
import { AppComponent } from './components/app-component/app.component';

export function InitializeApp(I18nService) {
    return () => {
        _WM_APP_PROJECT.id = location.href.split('/')[3];
        _WM_APP_PROJECT.cdnUrl = document.querySelector('[name="cdnUrl"]') && document.querySelector('[name="cdnUrl"]').getAttribute('content');
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
    AppComponent
];

export const modalModule = ModalModule.forRoot();
export const carouselModule = CarouselModule.forRoot();
export const bsDropDownModule = BsDropdownModule.forRoot();
export const popoverModule = PopoverModule.forRoot();
export const tooltipModule = TooltipModule.forRoot();

@NgModule({
    declarations: definitions,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ReactiveFormsModule,

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
    providers: [
        {provide: App, useClass: AppRef},
        {provide: AbstractToasterService, useClass: ToasterServiceImpl},
        {provide: AbstractI18nService, useClass: I18nServiceImpl},
        {provide: AbstractSpinnerService, useClass: SpinnerServiceImpl},
        {provide: AbstractNavigationService, useClass: NavigationServiceImpl},
        {provide: AppDefaults, useClass: AppDefaultsService},
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
        DecimalPipe,
        DatePipe,
        AppManagerService,
        PrefabManagerService,
        AuthGuard,
        RoleGuard,
        AppJSResolve,
        I18nResolve
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
        HttpServiceModule,
    ]
})
export class RuntimeBaseModule {
}
