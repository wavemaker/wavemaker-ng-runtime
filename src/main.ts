import { ApplicationRef, enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { environment } from './environments/environment';
import initWmProjectProperties from './app/wm-project-properties';
import { WMAppProperties } from './app/wmProperties';
import * as fontConfig from './font.config';
import { appConfig } from './app/app.config';
import { AppComponent } from '@wm/runtime/base';
import { BootstrapWrapperComponent } from './app/bootstrap-wrapper.component';

// Format Accept-Language header
const formatAcceptHeader = (languages: string[]): string => {
  const result: string[] = [];
  const addedLanguages = new Set<string>(); // To track already added languages
  let qValue = 1.0;

  languages.forEach((lang: string) => {
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
};

// Initialize WMAppProperties
WMAppProperties['preferredLanguage'] = formatAcceptHeader((navigator as any).languages);
WMAppProperties['fontConfig'] = fontConfig;
(window as any)._WM_APP_PROPERTIES = WMAppProperties;
initWmProjectProperties();

if (environment.production) {
  enableProdMode();
}

document.addEventListener('DOMContentLoaded', () => {
  new Promise<Event | void>(resolve => {
    if (window['cordova']) {
      document.addEventListener('deviceready', resolve);
    } else {
      resolve();
    }
  }).then(() => bootstrapApplication(AppComponent, appConfig))
    .then((appRef: ApplicationRef) => {
      appRef.bootstrap(BootstrapWrapperComponent);
      window.addEventListener('unload', () => {
        appRef.components.map(c => c?.destroy());
      });
    })
    .catch(err => console.error('Error bootstrapping app:', err));
});