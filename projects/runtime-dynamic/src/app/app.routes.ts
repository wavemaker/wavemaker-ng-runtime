import { AppJSResolve, MetadataResolve } from '@wm/runtime/base';
import { SecurityConfigResolve, PrefabPreviewComponent } from '@wm/runtime/base';

import { EmptyPageComponent } from './components/empty-page.component';
import { PageWrapperComponent } from './components/page-wrapper.component';

const appDependenciesResolve = {
    securityConfig: SecurityConfigResolve,
    metadata: MetadataResolve,
    appJS: AppJSResolve
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
        component: PageWrapperComponent
    }
];
