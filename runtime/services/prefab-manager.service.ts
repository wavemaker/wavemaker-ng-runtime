import { Injectable } from '@angular/core';

import { stringStartsWith, loadStyleSheets, loadScripts } from '@wm/core';

import { AppResourceManagerService } from './app-resource-manager.service';
import { RenderUtilsService } from './render-utils.service';

declare const _;

const prefabConfigCache = new Map<string, any>();
const prefabsWithError = new Set<string>();
const inProgress = new Map<string, Promise<any>>();

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
        protected resourceMngr: AppResourceManagerService,
        protected renderUtils: RenderUtilsService
    ) {}

    protected getPrefabConfig(prefabName: string) {
        return prefabConfigCache.get(prefabName);
    }

    protected getPrefabBaseUrl(prefabName: string) {
        return `app/prefabs/${prefabName}`;
    }

    protected getConfigUrl(prefabName: string) {
        return `${this.getPrefabBaseUrl(prefabName)}/config.json`;
    }

    protected getPrefabMinJsonUrl(prefabName: string) {
        return `${this.getPrefabBaseUrl(prefabName)}/pages/Main/page.min.json`;
    }

    protected loadConfig(prefabName): Promise<any> {
        const config = this.getPrefabConfig(prefabName);
        if (config) {
            return Promise.resolve(config);
        }

        return this.resourceMngr.get(this.getConfigUrl(prefabName))
            .then(_config => {
                prefabConfigCache.set(prefabName, _config);
                return _config;
            });
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

    protected loadDependencies(prefabName, config): Promise<any> {
        return Promise.all([
            this.loadStyles(prefabName, config),
            this.loadScripts(prefabName, config),
            // this.loadModules(prefabName, config)
        ]).then(() => {
            if (inProgress.get(prefabName)) {
                (inProgress.get(prefabName) as any).resolve();
            }
        });
    }

    protected renderPrefab(prefabName, vcRef, elRef, componentInstance) {
        return this.renderUtils.renderPrefab(
            prefabName,
            this.getPrefabConfig(prefabName),
            this.getPrefabMinJsonUrl(prefabName),
            vcRef,
            elRef.nativeElement,
            componentInstance
        );
    }

    public init(prefabName, vcRef, elRef, componentInstance): Promise<any> {

        if (prefabsWithError.has(prefabName)) {
            return Promise.reject('');
        }

        if (inProgress.get(prefabName)) {
            return inProgress.get(prefabName).then(() => this.renderPrefab(prefabName, vcRef, elRef, componentInstance));
        }

        let _res;
        let _rej;
        const _promise: any = new Promise((res, rej) => {
            _res = res;
            _rej = rej;
        });

        _promise.resolve = _res;
        _promise.reject = _rej;

        inProgress.set(prefabName, _promise);

        return this.loadConfig(prefabName)
            .then(config => this.loadDependencies(prefabName, config))
            .then(() => this.renderPrefab(prefabName, vcRef, elRef, componentInstance));
    }
}
