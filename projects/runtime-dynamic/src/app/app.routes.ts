import { AppJSResolve, MetadataResolve, AppExtensionJSResolve } from '@wm/runtime/base';
import { SecurityConfigResolve, PrefabPreviewComponent, CanDeactivatePageGuard, EmptyPageComponent } from '@wm/runtime/base';

import { PageWrapperComponent } from './components/page-wrapper.component';

const appDependenciesResolve = {
    securityConfig: SecurityConfigResolve,
    metadata: MetadataResolve,
    appJS: AppJSResolve,
    appMetaConfig: AppExtensionJSResolve
};

export const routes = [
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
        path: ':pageName',
        pathMatch: 'full',
        resolve: appDependenciesResolve,
        component: PageWrapperComponent,
        canDeactivate: [CanDeactivatePageGuard]
    }
];
