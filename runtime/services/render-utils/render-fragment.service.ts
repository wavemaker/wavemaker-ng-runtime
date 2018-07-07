import { Injectable, Injector, ViewContainerRef } from '@angular/core';

import { transpile } from '@wm/transpiler';
import { AbstractI18nService, App, getValidJSON, noop } from '@wm/core';

import { RenderViewService } from './render-view.service';
import { AppResourceManagerService } from '../app-resource-manager.service';
import { AppManagerService } from '../app.manager.service';
import { VariablesService } from '@wm/variables';

interface IPageMinJSON {
    markup: string;
    script: string;
    styles: string;
    variables: string;
}

declare const window: any;

const fragmentCache = new Map<string, any>();

window.resourceCache = fragmentCache;

const scriptCache = new Map<string, Function>();

const _decodeURIComponent = str => decodeURIComponent(str.replace(/\+/g, ' '));

const monitorFragments = (instance: any, afterViewInitPromise: Promise<void>) => {

    let resolveFn;
    const promise = new Promise(res => resolveFn = res);

    let fragments = 0;
    let isParseFinished = false;

    const isReady = () => {
        if (isParseFinished && !fragments) {
            instance._registerFragment = noop;
            instance._resolveFragment = noop;
            setTimeout(() => resolveFn(), 100);
        }
    };

    instance._registerFragment = () => fragments++;
    instance._resolveFragment = () => {
        fragments--;
        isReady();
    };
    afterViewInitPromise.then(() => {
        setTimeout(() => {
            isParseFinished = true;
            isReady();
        }, 100);
    });

    return promise;
};

const execScript = (
    script: string,
    identifier: string,
    ctx: string,
    instance: any,
    app: any
) => {
    let fn = scriptCache.get(identifier);
    if (!fn) {
        fn = new Function(ctx, 'App', script);
        scriptCache.set(identifier, fn);
    }
    try {
        fn(instance, app);
    } catch (e) {
        console.warn(`error executing script of ${identifier}`);
    }
};

export const getFragmentUrl = pageName => `./pages/${pageName}/page.min.json`;

export const commonPageWidgets = {};

@Injectable()
export class RenderFragmentService {
    constructor(
        private resouceMngr: AppResourceManagerService,
        private appManager: AppManagerService,
        private app: App,
        private renderResource: RenderViewService,
        private i18nService: AbstractI18nService
    ) {}

    public defineI18nProps(instance) {
        instance.appLocale = this.i18nService.getAppLocale();
    }

    public registerVariablesAndActions(inj: Injector, identifier: string, variables: any, instance: any, extendWithAppVariableContext: boolean) {
        const variablesService = inj.get(VariablesService);

        // get variables and actions instances for the page
        const variableCollection = variablesService.register(identifier, variables, instance);

        // create namespace for Variables nad Actions on page/partial, which inherits the Variables and Actions from App instance
        if (extendWithAppVariableContext) {
            instance.Variables = Object.create(this.app.Variables);
            instance.Actions = Object.create(this.app.Actions);
        }

        // assign all the page variables to the pageInstance
        Object.entries(variableCollection.Variables).forEach(([name, variable]) => instance.Variables[name] = variable);
        Object.entries(variableCollection.Actions).forEach(([name, action]) => instance.Actions[name] = action);

        return variableCollection;
    }

    private loadResourcesOfFragment(url): Promise<IPageMinJSON> {

        const resource = fragmentCache.get(url);

        if (resource) {
            return Promise.resolve(resource);
        }

        return this.resouceMngr.get(url, true)
            .then(({markup, script, styles, variables}: IPageMinJSON) => {
                const response = {
                    markup: transpile(_decodeURIComponent(markup)),
                    script: _decodeURIComponent(script),
                    styles: _decodeURIComponent(styles),
                    variables: _decodeURIComponent(variables)
                };
                fragmentCache.set(url, response);

                return response;
            }, e => {
                const details = e.details;
                if (details.status === 404) {
                    this.appManager.notifyApp(
                        this.app.appLocale.MESSAGE_PAGE_NOT_FOUND || 'The page you are trying to reach is not available',
                        'error'
                    );
                }
            });
    }

    public async render(
        fragmentName: string,
        url: string,
        context: string,
        selector: string,
        componentInitFn: Function,
        vcRef: ViewContainerRef,
        $target: HTMLElement,
        extendWithAppVariableContext: boolean
    ): Promise<any> {
        const {markup, script, styles, variables} = await this.loadResourcesOfFragment(url);

        let viewInitPromiseResolveFn;
        const viewInitPromise: Promise<void> = new Promise(res => viewInitPromiseResolveFn = res);

        let onReadyPromiseResolveFn;
        const onReadyPromise: Promise<any> = new Promise(res => onReadyPromiseResolveFn = res);

        const initFn = (instance, inj) => {
            execScript(script, selector, context, instance, this.app);

            this.defineI18nProps(instance);
            const variableCollection = this.registerVariablesAndActions(inj, fragmentName, getValidJSON(variables) || {}, instance, extendWithAppVariableContext);
            componentInitFn(instance);

            monitorFragments(instance, viewInitPromise).then(() => onReadyPromiseResolveFn({instance, variableCollection}));
        };

        this.renderResource.render(selector, markup, styles, undefined, initFn, vcRef, $target)
            .then(() => viewInitPromiseResolveFn());

        return onReadyPromise;
    }
}