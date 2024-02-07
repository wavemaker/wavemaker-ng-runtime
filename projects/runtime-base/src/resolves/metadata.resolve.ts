import { Injectable } from '@angular/core';


import { AppManagerService } from '../services/app.manager.service';

let metadataResolved = false;

@Injectable({
    providedIn: 'root'
})
export class MetadataResolve  {
    constructor(private appManager: AppManagerService) {}

    resolve() {
        return metadataResolved || this.appManager.loadMetadata().then(() => metadataResolved = true);
    }
}
