import { Injectable } from '@angular/core';

import { loadScripts, loadStyleSheets, stringStartsWith } from '@wm/core';
import { MetadataService } from '@wm/variables';

import { getPrefabConfig } from '../util/page-util';

declare const _;

const prefabsWithError = new Set<string>();
const inProgress = new Map<string, Promise<any>>();
const resolvedPrefabs = new Set<string>();

const getPrefabResourceUrl = (resourcePath, resourceBasePath) => {
    let _url = resourcePath;
    if (!stringStartsWith(resourcePath, 'http://|https://|//')) {
        _url = (resourceBasePath + _url).replace('//', '/');
    }
    return _url;
};

@Injectable()
export class PrefabManagerService {

    constructor(
        private $metadata: MetadataService
    ) {}

    protected getPrefabBaseUrl(prefabName: string) {
        return this.isPrefabInPreview(prefabName) ? '.' : `app/prefabs/${prefabName}`;
    }

    public isPrefabInPreview(prefabName: string) {
        return prefabName === '__self__';
    }

    public getConfig(prefabName): Promise<any> {
        return Promise.resolve(getPrefabConfig(prefabName));
    }

    public loadServiceDefs(prefabName): Promise<any> {
        return this.isPrefabInPreview(prefabName) ? Promise.resolve() : this.$metadata.load(prefabName);
    }

    protected loadStyles(prefabName, {resources: {styles}} = {resources: {styles: []}}): Promise<void> {
        const baseUrl = this.getPrefabBaseUrl(prefabName);
        const _styles = styles.map(url => {
            if (!_.endsWith(url, '/pages/Main/Main.css')) {
                return getPrefabResourceUrl(url, baseUrl);
            }
            return undefined;
        }).filter(url => !!url);

        loadStyleSheets(_styles);

        return Promise.resolve();
    }

    // TODO [Vinay] - implement onPrefabResourceLoad
    protected loadScripts(prefabName, {resources: {scripts}} = {resources: {scripts: []}}): Promise<any> {
        const baseUrl = this.getPrefabBaseUrl(prefabName);
        const _scripts = scripts.map(url => getPrefabResourceUrl(url, baseUrl));

        return loadScripts(_scripts);
    }

    private setInProgress(prefabName: string) {
        let _res;
        let _rej;
        const _promise: any = new Promise((res, rej) => {
            _res = res;
            _rej = rej;
        });

        _promise.resolve = _res;
        _promise.reject = _rej;

        inProgress.set(prefabName, _promise);
    }

    private resolveInProgress(prefabName: string) {
        if (inProgress.get(prefabName)) {
            (inProgress.get(prefabName) as any).resolve();
            inProgress.delete(prefabName);
        }
    }

    public loadDependencies(prefabName): Promise<void> {

        if (resolvedPrefabs.has(prefabName)) {
            return Promise.resolve();
        }

        if (prefabsWithError.has(prefabName)) {
            return Promise.reject('');
        }

        if (inProgress.get(prefabName)) {
            return inProgress.get(prefabName);
        }

        this.setInProgress(prefabName);

        return this.getConfig(prefabName)
            .then(config => {
                return Promise.all([
                    this.loadStyles(prefabName, config),
                    this.loadScripts(prefabName, config),
                    this.loadServiceDefs(prefabName)
                ]).then(() => {
                    this.resolveInProgress(prefabName);
                    resolvedPrefabs.add(prefabName);
                });
            });
    }
}
