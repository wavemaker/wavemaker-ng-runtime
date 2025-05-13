import { MetadataResolve, AppExtensionJSResolve } from '@wm/runtime/base';
import { SecurityConfigResolve, PrefabPreviewComponent, CanDeactivatePageGuard, EmptyPageComponent } from '@wm/runtime/base';

import { PageWrapperComponent } from './components/page-wrapper.component';
import {Routes} from '@angular/router';

const appDependenciesResolve = {
    securityConfig: SecurityConfigResolve,
    metadata: MetadataResolve,
    appMetaConfig: AppExtensionJSResolve
};

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        resolve: appDependenciesResolve,
        component: EmptyPageComponent
    },
    {
        path: 'prefab-preview',
        pathMatch: 'full',
        resolve: appDependenciesResolve,
        component: PrefabPreviewComponent
    },
    {
        path: 'page/:pageName',
        pathMatch: 'full',
        resolve: appDependenciesResolve,
        component: PageWrapperComponent,
        canDeactivate: [CanDeactivatePageGuard]
    }
];
