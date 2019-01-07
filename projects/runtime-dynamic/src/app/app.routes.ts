import { AppJSResolve, MetadataResolve } from '@wm/runtime/base';
import { SecurityConfigResolve } from '@wm/runtime/base';

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
        path: ':pageName',
        pathMatch: 'full',
        resolve: appDependenciesResolve,
        component: PageWrapperComponent
    }
];
