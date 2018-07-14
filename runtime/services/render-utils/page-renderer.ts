import { Injectable, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { App, isMobileApp, muteWatchers, noop, unMuteWatchers } from '@wm/core';

import { commonPageWidgets, getFragmentUrl, FragmentRenderer } from './fragment-renderer';
import { AppManagerService } from '../app.manager.service';

@Injectable()
export class PageRenderer {

    constructor(
        private renderFragment: FragmentRenderer,
        private app: App,
        private route: ActivatedRoute,
        private appManager: AppManagerService
    ) {}

    private registerWidgets(pageName: string, instance: any) {

        if (pageName === 'Common') {
            instance.Widgets = commonPageWidgets;
        } else {
            // All active pages should have reference to Common page widgets, e.g. Common login dialog
            instance.Widgets = Object.create(commonPageWidgets);
        }
    }

    private registerPageParams(instance: any) {
        const subscription = this.route.queryParams.subscribe(params => instance.pageParams = params);
        instance.registerDestroyListener(() => {
            subscription.unsubscribe();
        });
    }

    private componentInitFn(pageName: string, instance: any) {
        this.registerWidgets(pageName, instance);

        instance.App = this.app;
        instance.App.Widgets = Object.create(instance.Widgets);

        this.app.lastActivePageName = this.app.activePageName;
        this.app.activePageName = pageName;
        this.app.activePage = instance;
        instance.activePageName = pageName; // Todo: remove this

        this.registerPageParams(instance);
    }

    private invokeVariables(pageName: string, variableCollection: any) {
        // Trigger app variables only once. Triggering here, as app variables may be watching over page widgets
        if (!this.appManager.isAppVariablesFired() && pageName !== 'Common') {
            variableCollection.callback(this.app.Variables);
            variableCollection.callback(this.app.Actions);
            this.appManager.isAppVariablesFired(true);
        }
        variableCollection.callback(variableCollection.Variables)
            .catch(noop)
            .then(() => this.appManager.notify('pageStartupdateVariablesLoaded', {pageName: pageName}));
        variableCollection.callback(variableCollection.Actions);
    }

    private invokeOnReady(pageName: string, instance: any) {
        (instance.onReady || noop)();
        (this.app.onPageReady || noop)(pageName, instance);
        this.appManager.notify('pageReady', {'name' : pageName, instance});
    }

    private postReady(pageName: string, instance: any, variableCollection: any) {
        // TODO: have to make sure, the widgets are ready with default values, before firing onReady call
        unMuteWatchers();

        this.invokeVariables(pageName, variableCollection);
        if (isMobileApp()) {
            const removeSubscription = this.appManager.subscribe('pageContentReady', () => {
                this.invokeOnReady(pageName, instance);
                removeSubscription();
            });
        } else {
            this.invokeOnReady(pageName, instance);
        }
    }

    public async render(pageName: string, vcRef: ViewContainerRef, $target: HTMLElement) {
        const context = pageName === 'Common' ? 'Partial' : 'Page';

        muteWatchers();
        return this.renderFragment.render(
            pageName,
            getFragmentUrl(pageName),
            context,
            `app-page-${pageName}`,
            (instance: any) => {
                this.componentInitFn(pageName, instance);
            },
            vcRef,
            $target,
            true
        ).then(({instance, variableCollection}) => {
            this.postReady(pageName, instance, variableCollection);
        });
    }
}