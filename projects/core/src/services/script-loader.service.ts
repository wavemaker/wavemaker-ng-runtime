import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { _WM_APP_PROJECT } from '../utils/utils';

interface Scripts {
    name: string;
    src: string;
}

export const ScriptStore: Scripts[] = [];

declare var document: any;

@Injectable({providedIn: 'root'})
export class ScriptLoaderService {

    private scripts: any = {};

    constructor(private http: HttpClient) {
        ScriptStore.forEach((script: any) => {
            this.scripts[script.name] = {
                loaded: false,
                src: script.src
            };
        });
    }

    load(...scripts: string[]): Promise<any> {
        if (scripts && scripts.length) {
            return Promise.all(scripts.map( s => {
                return this.loadScript(s);
            }));
        }
        return Promise.resolve();
    }

    private loadScript(name: string) {
        return new Promise((resolve, reject) => {
            if (this.scripts[name] && this.scripts[name].loaded) {
                resolve({ script: name, loaded: true });
                return;
            } else if (!this.scripts[name]) {
                this.scripts[name] = {
                    loaded: false,
                    src: name
                };
            }
            //load script
            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = false;
            const src = this.scripts[name].src;
            if (src.startsWith("http")) {
                script.src = src;
            } else {
                script.src = (_WM_APP_PROJECT.cdnUrl || _WM_APP_PROJECT.ngDest) + src;
            }
            if (script.readyState) {  //IE
                script.onreadystatechange = () => {
                    if (script.readyState === "loaded" || script.readyState === "complete") {
                        script.onreadystatechange = null;
                        this.scripts[name].loaded = true;
                        resolve({script: name, loaded: true });
                    }
                };
            } else {  //Others
                script.onload = () => {
                    this.scripts[name].loaded = true;
                    resolve({script: name, loaded: true });
                };
            }
            script.onerror = (error: any) => resolve({script: name, loaded: false, status: 'Loaded'});
            document.getElementsByTagName('head')[0].appendChild(script);
        });
    }

}
