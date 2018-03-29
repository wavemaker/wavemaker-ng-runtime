import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { MetadataService } from '@wm/variables';

@Injectable()
export class MetadataResolve implements Resolve<any> {

    constructor(private metadataService: MetadataService) {}

    resolve() {
        return this.metadataService.isLoaded() || this.metadataService.load();
    }
}