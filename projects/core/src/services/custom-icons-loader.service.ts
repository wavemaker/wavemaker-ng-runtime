import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getFontConfig, loadStyleSheets } from "../utils/utils";

@Injectable({providedIn: 'root'})
export class CustomIconsLoaderService {
    // private http = inject(HttpClient);
    load() {
            const { default: fontConfig } = getFontConfig();
        const cssPaths = (fontConfig?.fonts ?? [])
                .filter(font => !!font.csspath)
                .map(font => font.csspath);

        loadStyleSheets(cssPaths);
    }
}

