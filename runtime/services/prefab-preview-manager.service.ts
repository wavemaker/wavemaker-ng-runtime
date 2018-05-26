import { Injectable } from '@angular/core';

import { PrefabManagerService } from './prefab-manager.service';
import { RenderUtilsService } from './render-utils.service';
import { AppResourceManagerService } from './app-resource-manager.service';

@Injectable()
export class PrefabPreviewManagerService extends PrefabManagerService {

    constructor(
        protected resourceMngr: AppResourceManagerService,
        protected renderUtils: RenderUtilsService
    ) {
        super(resourceMngr, renderUtils);
    }

    protected getPrefabBaseUrl(prefabName: string) {
        return '.';
    }
}