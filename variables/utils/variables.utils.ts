declare const window, _;
import { $parse } from '@utils/expression-parser';

export let httpService;
export let metadataService;
export let routerService;
export const setDependency = (type: string, ref: any) => {
    switch (type) {
        case 'http':
            httpService = ref;
            break;
        case 'metadata':
            metadataService = ref;
            break;
        case 'router':
            routerService = ref;
            break;
    }
};

export const initiateCallback = (type: string, variable: any, data: any, xhrObj?: any, skipDefaultNotification?: boolean) => {
    // TODO: [Vibhu], check whether to support legacy event calling mechanism (ideally, it should have been migrated)
    const fn = $parse(variable[type]);
    fn(variable.scope, {$event: variable, $scope: data});
};

/* returns true if HTML5 File API is available else false*/
export const isFileUploadSupported = () => {
    return (window.File && window.FileReader && window.FileList && window.Blob);
};

export const getEvaluatedOrderBy = (varOrder, optionsOrder) => {
    let optionFields,
        varOrderBy;
    // If options order by is not defined, return variable order
    if (!optionsOrder || _.element.isEmptyObject(optionsOrder)) {
        return varOrder;
    }
    // If variable order by is not defined, return options order
    if (!varOrder) {
        return optionsOrder;
    }
    // If both are present, combine the options order and variable order, with options order as precedence
    varOrder     = _.split(varOrder, ',');
    optionsOrder = _.split(optionsOrder, ',');
    optionFields = _.map(optionsOrder, function (order) {
        return _.split(_.trim(order), ' ')[0];
    });
    // If a field is present in both options and variable, remove the variable orderby
    _.remove(varOrder, function (orderBy) {
        return _.includes(optionFields, _.split(_.trim(orderBy), ' ')[0]);
    });
    varOrderBy = varOrder.length ? ',' + _.join(varOrder, ',') : '';
    return _.join(optionsOrder, ',') + varOrderBy;
};
