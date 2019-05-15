import { navigationService } from '../variable/variables.utils';

/**
 * Handles variable navigation operations
 * @param variable
 * @param options
 */
export const navigate = (variable, options) => {
    variable.dataSet = (options && options.data) || variable.dataSet;
    let viewName;
    const pageName = variable.dataBinding.pageName || variable.pageName;
    const operation = variable.operation;
    const urlParams = variable.dataSet;
    const prefabName = variable && variable._context && variable._context.prefabName;

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
        if (pageName && navigationService.isPartialWithNameExists(pageName)) {
            if (options.containerName) {
                navigationService.setPath(pageName, options.containerName, viewName);
            } else {
                navigationService.setPath(pageName, $('body:first >app-root:last').find('[content=  ' + pageName + ' ]').attr('name'), viewName);
            }
        } else if (prefabName && navigationService.isPrefabWithNameExists(prefabName)) {
            navigationService.setPath(prefabName, viewName);
        } else if (pageName) {
            navigationService.setPath(viewName);
        }
        navigationService.goToView(viewName, Object.assign(options, {
            pageName: pageName,
            transition: variable.pageTransitions,
            $event: options.$event,
            urlParams: urlParams
        }), variable);
    }
};
