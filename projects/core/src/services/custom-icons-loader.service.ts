import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStyleSheets } from "../utils/utils";

@Injectable({providedIn: 'root'})
export class CustomIconsLoaderService {
    private http = inject(HttpClient);
    load() {
        this.http.get('./font.config.js', {responseType: 'text'}).subscribe((fontConfig: any) => {
            const cssPaths = [],
                regex = /"csspath":\s*"([^"]+)"/g;
            let match;
            while ((match = regex.exec(fontConfig)) !== null) {
                cssPaths.push(match[1]);
            }
            loadStyleSheets(cssPaths);
        }, (error) => {});
    }
}

