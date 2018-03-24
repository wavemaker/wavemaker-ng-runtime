import { AppResourceManagerService } from './app-resource-manager.service';
import { Injectable } from '@angular/core';
import { stringStartsWith, loadStyleSheets, loadScripts } from '@utils/utils';
import { RenderUtilsService } from './render-utils.service';

declare const _;

const getPrefabBaseUrl = prefabName => `app/prefabs/${prefabName}`;
const getConfigUrl = prefabName => `${getPrefabBaseUrl(prefabName)}/config.json`;
export const getPrefabMinJsonUrl = prefabName => `${getPrefabBaseUrl(prefabName)}/pages/Main/page.min.json`;

const prefabConfigCache = new Map<string, any>();
const prefabsWithError = new Set<string>();
const inProgress = new Map<string, Promise<any>>();

const getPrefabResourceUrl = (resourcePath, resourceBasePath) => {
    let _url = resourcePath;
    if (stringStartsWith(resourcePath, 'http://|https://|//')) {
        _url = (resourceBasePath + _url).replace('//', '/');
    }
    return _url;
};

@Injectable()
export class PrefabManagerService {

    loadConfig(prefabName): Promise<any> {
        const config = prefabConfigCache.get(prefabName);
        if (config) {
            return Promise.resolve(config);
        }

        return this.resourceMngr.get(getConfigUrl(prefabName))
            .then(_config => {
                prefabConfigCache.set(prefabName, _config);
                return _config;
            });
    }

    loadStyles(prefabName, {resources: {styles}} = {resources: {styles: []}}): Promise<void> {
        const baseUrl = getPrefabBaseUrl(prefabName);
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
    loadScripts(prefabName, {resources: {scripts}} = {resources: {scripts: []}}): Promise<any> {
        const baseUrl = getPrefabBaseUrl(prefabName);
        const _scripts = scripts.map(url => getPrefabResourceUrl(url, baseUrl));

        return loadScripts(_scripts);
    }

    loadDependencies(prefabName, config): Promise<any> {
        return Promise.all([
            this.loadStyles(prefabName, config),
            this.loadScripts(prefabName, config),
            // this.loadModules(prefabName, config)
        ]);
    }

    renderPrefab(prefabName, vcRef, elRef, componentInstance) {
        return this.renderUtils.renderPrefab(
            prefabName,
            vcRef,
            elRef.nativeElement,
            componentInstance
        );
    }

    init(prefabName, vcRef, elRef, componentInstance): Promise<any> {

        if (prefabsWithError.has(prefabName)) {
            return Promise.reject('');
        }

        if (inProgress.get(prefabName)) {
            const promise = inProgress.get(prefabName);
            return promise.then(() => {
                this.renderPrefab(prefabName, vcRef, elRef, componentInstance);
            });
        }
        const _promise = Object.create(null);
        new Promise((res, rej) => {
            _promise.resolve = res;
            _promise.reject = rej;
        });
        inProgress.set(prefabName, _promise);

        return this.loadConfig(prefabName)
            .then(config => this.loadDependencies(prefabName, config))
            .then(() => this.renderPrefab(prefabName, vcRef, elRef, componentInstance))
            .then(() => {
                return prefabConfigCache.get(prefabName);
            });
    }

    constructor(
        private resourceMngr: AppResourceManagerService,
        private renderUtils: RenderUtilsService
    ) {}
}
