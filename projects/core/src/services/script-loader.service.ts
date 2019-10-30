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
    private pathMappings;

    constructor(private http: HttpClient) {
        ScriptStore.forEach((script: any) => {
            this.scripts[script.name] = {
                loaded: false,
                src: script.src
            };
        });
    }

    load(...scripts: string[]) {
        if (scripts && scripts.length) {
            return Promise.resolve()
                .then(() => this.pathMappings || this.loadPathMappings())
                .then(() => this.loadScript(scripts[0]))
                .then(() => {
                    scripts.shift();
                    return this.load(...scripts);
                });
        }
        return Promise.resolve();
    }

    private loadPathMappings() {
        const path = (_WM_APP_PROJECT.cdnUrl || _WM_APP_PROJECT.ngDest) + 'path_mapping.json';
        return this.http.get(path).toPromise().then((data) => {
            this.pathMappings = data;
        }, () => {
            this.pathMappings = {};
        })
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
            let src = this.scripts[name].src;
            src = this.pathMappings[src] || src;
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
