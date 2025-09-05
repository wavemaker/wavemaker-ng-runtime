import { PrefabPreviewComponent, CanDeactivatePageGuard, EmptyPageComponent } from '@wm/runtime/base';

import { PageWrapperComponent } from './components/page-wrapper.component';
import {Routes} from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: EmptyPageComponent
    },
    {
        path: 'prefab-preview',
        pathMatch: 'full',
        component: PrefabPreviewComponent
    },
    {
        path: ':pageName',
        pathMatch: 'full',
        component: PageWrapperComponent,
        canDeactivate: [CanDeactivatePageGuard]
    }
];
