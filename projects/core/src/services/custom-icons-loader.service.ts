import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getFontConfig, loadStyleSheets } from "../utils/utils";

@Injectable({providedIn: 'root'})
export class CustomIconsLoaderService {
    private http = inject(HttpClient);
    load() {
        let fontConfig = getFontConfig();
        const cssPaths = [], regex = /"csspath":\s*"([^"]+)"/g;
        let match;
        while ((match = regex.exec(fontConfig)) !== null) {
            cssPaths.push(match[1]);
        }
        loadStyleSheets(cssPaths);
    }
}

