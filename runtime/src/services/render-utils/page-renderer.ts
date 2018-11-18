import { Injectable, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { AbstractNavigationService, addClass, App, isMobileApp, muteWatchers, noop, removeClass, unMuteWatchers } from '@wm/core';

import { commonPageWidgets, FragmentRenderer, getFragmentUrl } from './fragment-renderer';
import { AppManagerService } from '../app.manager.service';

@Injectable()
export class PageRenderer {

    constructor(
        private renderFragment: FragmentRenderer,
        private app: App,
        private route: ActivatedRoute,
        private appManager: AppManagerService,
        private navigationService: AbstractNavigationService,
        private router: Router
    ) {
        this.router.events.subscribe(e => {
            if (e instanceof NavigationEnd) {
                addClass(document.querySelector('app-page-outlet'), 'page-load-in-progress');
            }
        });
    }

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

    private invokeVariables(pageName: string, variableCollection: any, instance: any) {
        // Trigger app variables only once. Triggering here, as app variables may be watching over page widgets
        if (!this.appManager.isAppVariablesFired() && pageName !== 'Common') {
            variableCollection.callback(this.app.Variables);
            variableCollection.callback(this.app.Actions);
            this.appManager.isAppVariablesFired(true);
        }
        variableCollection.callback(variableCollection.Variables)
            .catch(noop)
            .then(() => {
                this.appManager.notify('page-start-up-variables-loaded', {pageName: pageName});
                instance.compilePageContent = true;
            });
        variableCollection.callback(variableCollection.Actions);
    }

    private invokeOnReady(pageName: string, instance: any) {
        setTimeout(() => removeClass(document.querySelector('app-page-outlet'), 'page-load-in-progress'));
        (instance.onReady || noop)();
        (this.app.onPageReady || noop)(pageName, instance);
        this.appManager.notify('pageReady', {'name' : pageName, instance});
    }

    private postReady(pageName: string, instance: any, variableCollection: any) {
        // TODO: have to make sure, the widgets are ready with default values, before firing onReady call
        unMuteWatchers();

        this.invokeVariables(pageName, variableCollection, instance);
        if (isMobileApp()) {
            instance.onPageContentReady = () => {
                this.invokeOnReady(pageName, instance);
                instance.onPageContentReady = noop;
                setTimeout(() => instance.showPageContent = true);
            };
        } else {
            this.invokeOnReady(pageName, instance);
        }
    }

    public async render(pageName: string, vcRef: ViewContainerRef, $target: HTMLElement, clearVCRef?) {
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
            true,
            clearVCRef
        ).then(({instance, variableCollection}) => {
            return this.runPageTransition($target)
                .then(() => this.postReady(pageName, instance, variableCollection));
        });
    }

    private runPageTransition($target: HTMLElement): Promise<void> {
        return new Promise(resolve => {
            let transition = this.navigationService.getPageTransition();
            if (transition) {
                const onTransitionEnd = () => {
                    if (resolve) {
                        $target.removeEventListener('animationend', onTransitionEnd);
                        removeClass($target, transition);
                        resolve();
                        resolve = null;
                    }
                };
                transition = 'page-transition page-transition-' + transition;
                addClass($target, transition);
                $target.addEventListener('animationend', onTransitionEnd);
                // Wait for a maximum of 1 second for transition to end.
                setTimeout(onTransitionEnd, 1000);
            } else {
                resolve();
            }
        });
    }
}