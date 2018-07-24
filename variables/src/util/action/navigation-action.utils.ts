import { navigationService } from '../variable/variables.utils';

declare const _;

/**
 * Handles variable navigation operations
 * @param variable
 * @param options
 */
export const navigate = (variable, options) => {
    variable.dataSet = (options && options.data) || variable.dataSet;
    let viewName;
    const pageName = variable.dataBinding.pageName || variable.pageName,
        operation = variable.operation,
        urlParams = variable.dataSet;

    options = options || {};

    /* if operation is goToPage, navigate to the pageName */
    switch (operation) {
        case 'goToPreviousPage':
            navigationService.goToPrevious();
            break;
        case 'gotoPage':
            navigationService.goToPage(pageName, {
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
        navigationService.goToView(viewName, {
            pageName: pageName,
            transition: variable.pageTransitions,
            $event: options.$event,
            urlParams: urlParams
        }, variable);
    }
};