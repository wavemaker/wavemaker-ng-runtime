import { ApplicationRef, enableProdMode, NgModuleRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import initWmProjectProperties from './app/wm-project-properties';
import { WMAppProperties } from './app/wmProperties';
import * as fontConfig from './font.config';


let formatAcceptHeader = (languages: any) => {
  let result: string[] = [];
  let addedLanguages = new Set<string>(); // To track already added languages
  let qValue = 1.0;

  languages.forEach((lang: any) => {
    if (!addedLanguages.has(lang)) {
      // Add the full language (e.g., en-US or en) if not already added
      result.push(`${lang}${qValue === 1.0 ? '' : `;q=${qValue.toFixed(1)}`}`);
      addedLanguages.add(lang);
      // Decrease qValue for the next language
      qValue = Math.max(0.1, qValue - 0.1); // Decrease qValue, minimum is 0.1
    }

    // If language has a region code (e.g., en-US), also add the base language (e.g., en)
    if (lang.includes('-')) {
      const baseLang = lang.split('-')[0];
      if (!addedLanguages.has(baseLang)) {
        result.push(`${baseLang};q=${qValue.toFixed(1)}`);
        addedLanguages.add(baseLang);

        // Decrease qValue for the next language
        qValue = Math.max(0.1, qValue - 0.1);
      }
    }
  });

  return result.join(',');
}
WMAppProperties['preferredLanguage'] = formatAcceptHeader(navigator.languages);
WMAppProperties['fontConfig'] = fontConfig;

const formattedSupportedLanguages= WMAppProperties['supportedLanguages'].replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":').replace(/=/g, ':').replace(/([a-zA-Z0-9_]+)/g, '"$1"').replace(/"null"/g, 'null').replace(/"{/g, '{').replace(/}"/g, '}');

  WMAppProperties['supportedLanguages'] = JSON.parse(formattedSupportedLanguages);

(window as any)._WM_APP_PROPERTIES  = WMAppProperties
initWmProjectProperties();

if (environment.production) {
    enableProdMode();
}

document.addEventListener('DOMContentLoaded', () => {
    new Promise<Event | void>( resolve => {
        if (window['cordova']) {
            document.addEventListener('deviceready', resolve);
        } else {
            resolve();
        }
    }).then(() => platformBrowserDynamic().bootstrapModule(AppModule))
        .then((appModuleRef: NgModuleRef<AppModule>) => {
            const applicationRef = appModuleRef.injector.get(ApplicationRef);
            window.addEventListener('unload', () => {
                applicationRef.components.map(c => c && c.destroy());
            });
            console.timeEnd('bootstrap'), err => console.log(err);
        }, err => console.log(err));
});
