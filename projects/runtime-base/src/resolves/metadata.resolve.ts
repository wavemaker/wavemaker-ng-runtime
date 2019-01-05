import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { AppManagerService } from '../services/app.manager.service';

let metadataResolved = false;

@Injectable({
    providedIn: 'root'
})
export class MetadataResolve implements Resolve<any> {
    constructor(private appManager: AppManagerService) {}

    resolve() {
        return metadataResolved || this.appManager.loadMetadata().then(() => metadataResolved = true);
    }
}
