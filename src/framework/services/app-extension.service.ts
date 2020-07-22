import { Injectable } from '@angular/core';

import { AppExtensionProvider } from '@wm/runtime/base';

declare const  WM_CUSTOM_FORMATTERS;
@Injectable({
    providedIn: 'root'
})
export class AppExtensionProviderService extends AppExtensionProvider {

    public loadFormatterConfigScript(callback:Function):void {
        try{
            callback(WM_CUSTOM_FORMATTERS);

    }catch(e){
        console.warn('Error while loading the formatters.js file');
    }

    }
}
