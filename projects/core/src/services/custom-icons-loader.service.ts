import { Injectable } from '@angular/core';
import { getFontConfig, loadStyleSheets } from "../utils/utils";

@Injectable({providedIn: 'root'})
export class CustomIconsLoaderService {
    load() {
        let {default: fontConfig} = getFontConfig();
        const cssPaths = (fontConfig?.fonts ?? [])
            .filter(font => !!font.csspath)
            .map(font => font.csspath);
        loadStyleSheets(cssPaths);
    }
}

