import { Injectable } from '@angular/core';
import { AppExtensionProvider } from '@wm/runtime/base';
import { appendScriptToHead } from '@wm/core';
@Injectable({
    providedIn: 'root'
})
export class AppExtensionProviderService extends AppExtensionProvider {

    // With renderer create element, added onloaded callback the append to the body
    public loadFormatterConfigScript(callback:Function):void {
       try{
        appendScriptToHead(callback);
       }catch(e){
           console.warn('Error while loading the formatters.js file');
       }
    }
}
