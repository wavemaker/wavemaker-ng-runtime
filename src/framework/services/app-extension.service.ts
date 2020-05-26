import { Injectable } from '@angular/core';

import { AppExtensionProvider } from '@wm/runtime/base';

import { appExtensionScript } from '../../app/app.extension.service';

@Injectable({
    providedIn: 'root'
})
export class AppExtensionProviderService extends AppExtensionProvider {

    public getAppMetaConfigScripts(): Promise<any> {
        return  Promise.resolve(appExtensionScript);
    }
}
