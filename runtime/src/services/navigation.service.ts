import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

import { App, NavigationOptions, AbstractNavigationService } from '@wm/core';
import { CONSTANTS } from '@wm/variables';


declare const _;

const parentSelector = 'body:first >app-root:last';

@Injectable()
export class NavigationServiceImpl implements AbstractNavigationService {
    private history = new History();
    private transition: string;
    private isPageAddedToHistory = false;

    constructor(private app: App, private router: Router) {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                const url = event.url;
                const urlParams = {};
                let pageName;
                if (!this.isPageAddedToHistory) {
                    this.isPageAddedToHistory = false;
                    if (url.indexOf('?') > 0) {
                        url.substr(url.indexOf('?') + 1)
                            .split('&')
                            .forEach(s => {
                                const splits = s.split('=');
                                urlParams[splits[0]] = splits[1];
                            });
                        pageName = url.substr(0, url.indexOf('?'));
                    } else {
                        pageName = url;
                    }
                    if (pageName[0] === '/') {
                        pageName = pageName.substr(1);
                    }
                    if (pageName) {
                        /*
                         * Commenting this code, one client project has Home_Page configured as Login Page.
                         * So redirection to Home_Page post login is failing
                         // if login page is being loaded and user is logged in, cancel that.
                            if ($rs.isApplicationType) {
                                stopLoginPagePostLogin($p);
                            }
                         */
                        delete urlParams['name'];

                        this.history.push(new PageInfo(pageName, urlParams, this.transition));
                    }
                }
            }
        });
    }

    public getPageTransition() {
        if (_.isEmpty(this.transition) || _.isEqual('none', this.transition)) {
            return null;
        }
        return this.transition;
    }

    /**
     * Navigates to particular page
     * @param pageName
     * @param options
     */
    public goToPage(pageName: string, options: NavigationOptions) {
        this.transition = options.transition || '';
        this.history.push( new PageInfo(pageName, options.urlParams, this.transition));
        this.isPageAddedToHistory = true;
        if (CONSTANTS.isWaveLens) {
            const location = window['location'];
            let strQueryParams = _.map(options.urlParams || [], (value, key) => key + '=' + value);
            if (strQueryParams.length > 0) {
                strQueryParams = '?' + strQueryParams;
            }
            location.href = location.origin
                + location.pathname
                + '#/' + pageName
                + (strQueryParams.length > 0 ? '?' + strQueryParams.join('&') : '');
            return;
        }
        return this.router.navigate([`/${pageName}`], { queryParams: options.urlParams});
    }

    /**
     * Navigates to last visited page.
     */
    public goToPrevious() {
        if (this.history.getPagesCount()) {
            this.transition = this.history.getCurrentPage().transition;
            if (!_.isEmpty(this.transition)) {
                this.transition += '-exit';
            }
            this.history.pop();
            this.isPageAddedToHistory = true;
            window.history.back();
        }
    }

    /** Todo[Shubham] Need to handle gotoElement in other pages{TBD}
     * Navigates to particular view
     * @param viewName
     * @param options
     * @param variable
     */
    public goToView(viewName: string, options: NavigationOptions, variable: any) {
        options = options || {};
        const pageName = options.pageName;
        const transition = options.transition || '';
        const $event = options.$event;
        const activePage = this.app.activePage;

        // checking if the element is present in the same page if yes highlight the element
        // else goto the page in which the element exists and highlight the element
        if (!pageName || pageName === activePage.activePageName || this.isPartialWithNameExists(pageName)) {
            this.goToElementView($(parentSelector).find('[name="' + viewName + '"]'), viewName, pageName, variable);
        } else {
            this.goToPage(pageName, {
                viewName    : viewName,
                $event      : $event,
                transition  : transition,
                urlParams   : options.urlParams
            });
            // subscribe to an event named pageReady which notifies this subscriber
            // when all widgets in page are loaded i.e when page is ready
            const pageReadySubscriber = this.app.subscribe('pageReady', (page) => {
                this.goToElementView($(parentSelector).find('[name="' + viewName + '"]'), viewName, pageName, variable);
                pageReadySubscriber();
            });
        }
    }

    /*
     * navigates the user to a view element with given name
     * if the element not found in the compiled markup, the same is searched in the available dialogs in the page
     */
    private goToElementView(viewElement, viewName: string, pageName: string, variable: any) {
        let $el, parentDialog;
        const activePage = this.app.activePage;

        if (viewElement.length) {
            if (pageName === activePage.activePageName) {
                viewElement = this.getViewElementInActivePage(viewElement);
            }

            $el = activePage.Widgets[viewName];
            switch ($el.widgetType) {
                case 'wm-accordionpane':
                    this.showAncestors(viewElement, variable);
                    $el.expand();
                    break;
                case 'wm-tabpane':
                    this.showAncestors(viewElement, variable);
                    $el.select();
                    break;
                case 'wm-segment-content':
                    this.showAncestors(viewElement, variable);
                    $el.navigate();
                    break;
                case 'wm-panel':
                    /* flip the active flag */
                    $el.expanded = true;
                    break;
            }
        } else {
            parentDialog = this.showAncestorDialog(viewName);
            setTimeout(() => {
                if (parentDialog) {
                    this.goToElementView($('[name="' + viewName + '"]'), viewName, pageName, variable);
                }
            });
        }
    }

    /* If page name is equal to active pageName, this function returns the element in the page.
     The element in the partial page is not selected.*/
    private getViewElementInActivePage($el) {
        let selector;
        if ($el.length > 1) {
            selector = _.filter($el, (childSelector) => {
                if (_.isEmpty($(childSelector).closest('[data-role = "partial"]'))) {
                    return childSelector;
                }
            });
            if (selector) {
                $el = $(selector);
            }
        }
        return $el;
    }

    /**
     * checks if the pagecontainer has the pageName.
     */
    private isPartialWithNameExists(name: string) {
        return $('[page-container][content="' + name + '"]').length;
    }

    /*
     * shows all the parent container view elements for a given view element
     */
    private showAncestors(element, variable) {
        const ancestorSearchQuery = '[wm-navigable-element="true"]';
        const activePage = this.app.activePage;

        element
            .parents(ancestorSearchQuery)
            .toArray()
            .reverse()
            .forEach((parent) => {
                const $el = activePage.Widgets[parent.getAttribute('name')];
                switch ($el.widgetType) {
                    case 'wm-accordionpane':
                        $el.expand();
                        break;
                    case 'wm-tabpane':
                        $el.select();
                        break;
                    case 'wm-segment-content':
                        $el.navigate();
                        break;
                    case 'wm-panel':
                        /* flip the active flag */
                        $el.expanded = true;
                        break;
                }
            });
    }



    /* Todo[shubham]
     * searches for a given view element inside the available dialogs in current page
     * if found, the dialog is displayed, the dialog id is returned.
     */
    private showAncestorDialog(viewName: string) {
        let dialogId;
        $('app-root [dialogtype]')
            .each(function () {
                const dialog = $(this);
                if ($(dialog.html()).find('[name="' + viewName + '"]').length) {
                    dialogId = dialog.attr('name');
                    return false;
                }
            });
        return dialogId;
    }
}

class PageInfo {

    constructor(public name, public urlParams?, public transition?) {
        this.transition = _.isEmpty(this.transition) ? null : this.transition;
    }

    public isEqual(page1: PageInfo) {
        return page1 && page1.name === this.name && _.isEqual(page1.urlParams, this.urlParams);
    }
}

class History {
    private stack: Array<PageInfo> = [];
    private currentPage: PageInfo;

    public getCurrentPage() {
        return this.currentPage;
    }

    public getPagesCount() {
        return this.stack.length;
    }

    public isLastVisitedPage(page: PageInfo) {
        return this.getLastPage().isEqual(page);
    }

    public push(pageInfo: PageInfo) {
        if (this.currentPage) {
            this.stack.push(this.currentPage);
        }
        this.currentPage = pageInfo;
    }

    public pop() {
        this.currentPage = this.stack.pop();
        return this.currentPage;
    }

    public getLastPage() {
        return this.stack.length > 0 ? this.stack[this.stack.length - 1] : undefined;
    }
}