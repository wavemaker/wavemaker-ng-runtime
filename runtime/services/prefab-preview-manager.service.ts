import { Injectable } from '@angular/core';

import { PrefabManagerService } from './prefab-manager.service';
import { AppResourceManagerService } from './app-resource-manager.service';

@Injectable()
export class PrefabPreviewManagerService extends PrefabManagerService {

    constructor(
        protected resourceMngr: AppResourceManagerService
    ) {
        super(resourceMngr);
    }

    protected getPrefabBaseUrl(prefabName: string) {
        return '.';
    }
}