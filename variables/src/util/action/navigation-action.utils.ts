import { appManager, routerService } from '../variable/variables.utils';

declare const _;

const parentSelector = 'body:first >app-root:last';
let pageStackObject,
    pageAddedToStack,
    nextTransitionToApply;

/**
 * pageStackObject, is a stack that contains the list of pages that have been navigated to
 * getCurrentPage, returns the current page
 * push, adds a page to the stack
 * pop, pops the last page from the stack
 * getLastPage, returns the last added page in stack
 * isEqual, checks if two pages are same
 * isLastVisitedPage, checks if the given page is last visited page
 * getPagesCount, returns the number of pages in stack
 */
pageStackObject = ( function () {
    const stack = [];
    let currentPage;
    return {
        'getCurrentPage': () => {
            return currentPage;
        },
        'push': (pageInfo) => {
            if (currentPage) {
                stack.push(currentPage);
            }
            currentPage = pageInfo;
        },
        'pop': () => {
            currentPage = stack.pop();
        },
        'getLastPage': () => {
            return stack.length > 0 ? stack[stack.length - 1] : undefined;
        },
        'isEqual': (page1, page2) => {
            return page1 && page2 && page1.name === page2.name && _.isEqual(page1.urlParams, page2.urlParams);
        },
        'isLastVisitedPage': (page) => {
            return this.isEqual(page, this.getLastPage());
        },
        'getPagesCount': () => {
            return stack.length;
        }
    };
}());

/*
 * shows all the parent container view elements for a given view element
 */
function showAncestors(element, variable) {
    const ancestorSearchQuery = '[wm-navigable-element="true"]';
    const activePage = getActivePage();

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
function showAncestorDialog(viewName) {
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

/**
 * checks if the pagecontainer has the pageName.
 */
function isPartialWithNameExists(name) {
    return $('[page-container][content="' + name + '"]').length;
}

/* If page name is equal to active pageName, this function returns the element in the page.
 The element in the partial page is not selected.*/
function getViewElementInActivePage($el) {
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
 * Navigates to particular page
 * @param pageName
 * @param options
 */
const goToPage = function (pageName, options) {
    nextTransitionToApply = options.transition || '';
    pageStackObject.push({
        name : pageName,
        urlParams : options.urlParams,
        transition : nextTransitionToApply
    });
    pageAddedToStack = true;
    routerService.navigate([`/${pageName}`], { queryParams: options.urlParams});
};

/*
 * navigates the user to a view element with given name
 * if the element not found in the compiled markup, the same is searched in the available dialogs in the page
 */
function goToElementView(viewElement, viewName, pageName, variable) {
    let $el, parentDialog;
    const activePage = getActivePage();

    if (viewElement.length) {
        if (pageName === activePage.activePageName) {
            viewElement = getViewElementInActivePage(viewElement);
        }

        $el = activePage.Widgets[viewName];
        switch ($el.widgetType) {
            case 'wm-accordionpane':
                showAncestors(viewElement, variable);
                $el.expand();
                break;
            case 'wm-tabpane':
                showAncestors(viewElement, variable);
                $el.select();
                break;
            case 'wm-segment-content':
                showAncestors(viewElement, variable);
                $el.navigate();
                break;
            case 'wm-panel':
                /* flip the active flag */
                $el.expanded = true;
                break;
        }
    } else {
        parentDialog = showAncestorDialog(viewName);
        setTimeout(() => {
            if (parentDialog) {
                goToElementView($('[name="' + viewName + '"]'), viewName, pageName, variable);
            }
        });
    }
}

const getActivePage = () => {
    return appManager.getActivePage();
};

/** Todo[Shubham] Need to handle gotoElement in other pages{TBD}
 * Navigates to particular view
 * @param viewName
 * @param options
 * @param variable
 */
const goToView = function (viewName, options, variable) {
    options = options || {};
    const pageName = options.pageName;
    const transition = options.transition || '';
    const $event = options.$event;
    const activePage = getActivePage();

    // checking if the element is present in the same page if yes highlight the element
    // else goto the page in which the element exists and highlight the element
    if (!pageName || pageName === activePage.activePageName || isPartialWithNameExists(pageName)) {
        goToElementView($(parentSelector).find('[name="' + viewName + '"]'), viewName, pageName, variable);
    } else {
        goToPage(pageName, {
            viewName    : viewName,
            $event      : $event,
            transition  : transition,
            urlParams   : options.urlParams
        });
        // subscribe to an event named pageReady which notifies this subscriber
        // when all widgets in page are loaded i.e when page is ready
        const pageReadySubscriber = appManager.subscribe('pageReady', (page) => {
            goToElementView($(parentSelector).find('[name="' + viewName + '"]'), viewName, pageName, variable);
            pageReadySubscriber();
        });
    }
};

/**
 * Handles variable navigation operations
 * @param variable
 * @param options
 */
export const navigate = (variable, options) => {

    let viewName;
    const pageName = variable.dataBinding.pageName || variable.pageName,
        operation = variable.operation,
        urlParams = variable.dataSet;

    options = options || {};

    /* if operation is goToPage, navigate to the pageName */
    switch (operation) {
        case 'goToPreviousPage':
            // TODO: implement stack approach for mobile
            window.history.back();
            break;
        case 'gotoPage':
            goToPage(pageName, {
                transition: variable.pageTransitions,
                $event: options.$event,
                urlParams: urlParams
            });
            break;
        case 'gotoView':
            viewName = (variable.dataBinding && variable.dataBinding.viewName) || variable.viewName;
            break;
        case 'gotoTab':
            viewName = (variable.dataBinding && variable.dataBinding.tabName) || variable.tabName;
            break;
        case 'gotoAccordion':
            viewName = (variable.dataBinding && variable.dataBinding.accordionName) || variable.accordionName;
            break;
        case 'gotoSegment':
            viewName = (variable.dataBinding && variable.dataBinding.segmentName) || variable.segmentName;
            break;
    }

    /* if view name found, call routine to navigate to it */
    if (viewName) {
        goToView(viewName, {
            pageName: pageName,
            transition: variable.pageTransitions,
            $event: options.$event,
            urlParams: urlParams
        }, variable);
    }
};