import { Injectable } from '@angular/core';
import {  ScriptLoaderService } from '@wm/core';



@Injectable()
export class LazyLoadScriptsResolve {

    constructor(private scriptLoaderService: ScriptLoaderService) {}

    async resolve() {
    }
}
