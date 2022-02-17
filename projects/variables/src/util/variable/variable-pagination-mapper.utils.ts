declare const _;

export class VariablePaginationMapperUtils {
    static setPaginationQueryParams(variable, operationInfo) {
        const paginationInfo = operationInfo.paginationInfo;
                operationInfo.parameters.forEach(element => {
                    if (element.name === paginationInfo.reqInput.offsetKey) {
                        element.sampleValue = variable.resPaginationInfo['offset'];
                    } else if (element.name === paginationInfo.reqInput.limitKey && variable.resPaginationInfo['size']) {
                        element.sampleValue = variable.resPaginationInfo['size'];
                    }
                });
    }

    static setVariablePagination(paginationInfo, variable, response, options) {
        // if (paginationInfo && paginationInfo.type === 'offset' && !_.isEmpty(response)) {
        if (paginationInfo && paginationInfo.type && !_.isEmpty(response)) {
            if (!variable.resPaginationInfo) {
                variable.resPaginationInfo = {
                    empty: false
                };
            }
            variable.resPaginationInfo['size'] = _.get(response, paginationInfo.resOutput[paginationInfo.reqInput.wmPagingMapObj.size]) || paginationInfo.reqInput.limit;
            variable.resPaginationInfo['offset'] =  _.get(response, paginationInfo.resOutput[paginationInfo.reqInput.wmPagingMapObj.page]) || 0;
            variable.resPaginationInfo['totalElements'] = _.get(response, paginationInfo.resOutput.totalElements);
            variable.resPaginationInfo['numberOfElements'] = variable.resPaginationInfo['size'];
            variable.resPaginationInfo['number'] =  options['page'] ? options['page'] - 1 : 0;
            variable.resPaginationInfo['last'] = _.startsWith(paginationInfo.resOutput.hasMoreItems, 'bind:') ? this.checkForMoreItems(response, paginationInfo.resOutput.hasMoreItems) : !_.get(response, paginationInfo.resOutput.hasMoreItems);
            variable.resPaginationInfo['first'] = variable.resPaginationInfo['offset'] === 0 ? true : false;
            variable.resPaginationInfo['totalPages'] =  variable.resPaginationInfo['totalElements'] / variable.resPaginationInfo['size'];
            if (variable.resPaginationInfo['totalElements'] % variable.resPaginationInfo['size'] === 0) {
                variable.resPaginationInfo['totalPages'] = parseInt(variable.resPaginationInfo['totalPages']);
            } else {
                variable.resPaginationInfo['totalPages'] = parseInt(variable.resPaginationInfo['totalPages']) + 1;
            }
        }
    }

    // resolves bind expression
    static checkForMoreItems(res, hasMoreItems) {
        var exp = hasMoreItems.split('bind:');
        var returnVal = true;
        if (exp.length) {
            var bindexp = exp[1].split('===');
            var hasItems = _.get(res, bindexp[0]);
            returnVal = !(hasItems === bindexp[1]);
        }
        return returnVal;
    }
}