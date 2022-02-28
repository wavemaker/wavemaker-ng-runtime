declare const _;

export class VariablePaginationMapperUtils {
    static setPaginationQueryParams(variable, operationInfo) {
        const paginationInfo = operationInfo.paginationInfo;
                operationInfo.parameters.forEach(element => {
                    if (element.name === paginationInfo.reqInput.page.split('.')[1]) {
                        element.sampleValue = variable.resPaginationInfo['page'];
                    } else if (element.name === paginationInfo.reqInput.size.split('.')[1]) {
                        element.sampleValue = variable.resPaginationInfo['size'];
                    }
                });
    }

    static setVariablePagination(paginationInfo, variable, response, options) {
        // if (paginationInfo && paginationInfo.type === 'offset' && !_.isEmpty(response)) {
        if (paginationInfo && !_.isEmpty(response)) {
            if (!variable.resPaginationInfo) {
                variable.resPaginationInfo = {
                    empty: false
                };
            }
            variable.resPaginationInfo['size'] = response.size;
            variable.resPaginationInfo['page'] =  response.page || 0;
            variable.resPaginationInfo['totalElements'] = response.totalElements;
            variable.resPaginationInfo['numberOfElements'] = variable.resPaginationInfo['size'];
            variable.resPaginationInfo['number'] =  options['page'] ? options['page'] - 1 : 0;
            variable.resPaginationInfo['first'] = variable.resPaginationInfo['page'] <= 1 ? true : false;
            variable.resPaginationInfo['totalPages'] =  variable.resPaginationInfo['totalElements'] / variable.resPaginationInfo['size'];
            if (variable.resPaginationInfo['totalElements'] % variable.resPaginationInfo['size'] === 0) {
                variable.resPaginationInfo['totalPages'] = parseInt(variable.resPaginationInfo['totalPages']);
            } else {
                variable.resPaginationInfo['totalPages'] = parseInt(variable.resPaginationInfo['totalPages']) + 1;
            }
            variable.resPaginationInfo['last'] = _.startsWith(response.hasMoreItems, 'bind:') ? this.checkForMoreItems(response, paginationInfo.resOutput.hasMoreItems) : response.hasMoreItems === '' ? !(variable.resPaginationInfo['page'] < variable.resPaginationInfo['totalPages']) : !response.hasMoreItems;
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