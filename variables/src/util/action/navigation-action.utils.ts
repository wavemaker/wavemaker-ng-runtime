import { routerService } from '../variable/variables.utils';
import { appManager } from '@wm/variables';
import { DialogService } from '@wm/components';
import { encodeUrlParams } from '@wm/core';

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
pageStackObject = ( function() {
    const stack = [];
    let currentPage;
    return {
        'getCurrentPage' : () => {
            return currentPage;
        },
        'push' : (pageInfo) => {
            if (currentPage) {
                stack.push(currentPage);
            }
            currentPage = pageInfo;
        },
        'pop' : () => {
            currentPage = stack.pop();
        },
        'getLastPage' : () => {
            return stack.length > 0 ? stack[stack.length - 1] : undefined;
        },
        'isEqual' : (page1, page2) => {
            return page1 && page2 && page1.name === page2.name && _.isEqual(page1.urlParams, page2.urlParams);
        },
        'isLastVisitedPage' : (page) => {
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

    element
        .parents(ancestorSearchQuery)
        .toArray()
        .reverse()
        .forEach((parent) => {
            const $is = variable._context.Widgets[parent];
            switch ($is._widgettype) {
                case 'wm-accordionpane':
                    $is.expand();
                    break;
                case 'wm-tabpane':
                    $is.select();
                    break;
                case 'wm-segment-content':
                    $is.navigate();
                    break;
                case 'wm-panel':
                    /* flip the active flag */
                    $is.expanded = true;
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
                // DialogService.closeAllDialogs();
                // DialogService.showDialog(dialogId);
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

    // prevent the default behavior, if the navigation is from an anchor click event
    if ($(window.event.target as HTMLElement).closest('a').length) {
        window.event.preventDefault();
    }

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
    let $is, parentDialog;

    if (viewElement.length) {
        if (pageName === appManager.$app.activePageName) {
            viewElement = getViewElementInActivePage(viewElement);
        }

        $is = variable._context.Widgets[viewName];
        switch ($is.widgetType) {
            case 'wm-accordionpane':
                showAncestors(viewElement, variable);
                $is.expand();
                break;
            case 'wm-tabpane':
                showAncestors(viewElement, variable);
                $is.select();
                break;
            case 'wm-segment-content':
                showAncestors(viewElement, variable);
                $is.navigate();
                break;
            case 'wm-panel':
                /* flip the active flag */
                $is.expanded = true;
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

/** Todo[Shubham] Need to handle gotoElement in other pages{TBD}
 * Navigates to particular view
 * @param viewName
 * @param options
 * @param variable
 */
const goToView = function (viewName, options, variable) {
    options = options || {};
    const pageName = options.pageName,
        transition = options.transition || '',
        $event = options.$event;

    // checking if the element is present in the same page if yes highlight the element
    // else goto the page in which the element exists and highlight the element
    if (!pageName || pageName === appManager.$app.activePageName || isPartialWithNameExists(pageName)) {
        goToElementView($(parentSelector).find('[name="' + viewName + '"]'), viewName, pageName, variable);
    } else {
        goToPage(pageName, {
            viewName    : viewName,
            $event      : $event,
            transition  : transition,
            urlParams   : options.urlParams
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
        operation           = variable.operation,
        urlParams           = variable.dataSet;

    options = options || {};

    /* if operation is goToPage, navigate to the pageName */
    switch (operation) {
        case 'goToPreviousPage':
            // Todo[shubham] NavigationService.goToPrevious();
            break;
        case 'gotoPage':
            goToPage(pageName , { transition  : variable.pageTransitions,
                $event      : options.$event,
                urlParams   : urlParams});
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
            pageName    : pageName,
            transition  : variable.pageTransitions,
            $event      : options.$event,
            urlParams   : urlParams
        }, variable);
    }
};