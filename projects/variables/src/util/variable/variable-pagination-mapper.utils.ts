declare const _;

export class VariablePaginationMapperUtils {
    static setPaginationQueryParams(variable, operationInfo) {
        const paginationInfo = operationInfo.paginationInfo;
                operationInfo.parameters.forEach(element => {
                    if (element.name === paginationInfo.reqInput.page.split('.')[0]) {
                        element.sampleValue = variable.resPaginationInfo['page'];
                    } else if (element.name === paginationInfo.reqInput.size.split('.')[0]) {
                        element.sampleValue = variable.resPaginationInfo['size'];
                    }
                });
    }

    static setVariablePagination(paginationInfo, variable, response, options) {
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
            variable.resPaginationInfo['totalPages'] =  variable.resPaginationInfo['totalElements'] / variable.resPaginationInfo['size'];
            if (variable.resPaginationInfo['totalElements'] % variable.resPaginationInfo['size'] === 0) {
                variable.resPaginationInfo['totalPages'] = parseInt(variable.resPaginationInfo['totalPages']);
            } else {
                variable.resPaginationInfo['totalPages'] = parseInt(variable.resPaginationInfo['totalPages']) + 1;
            }
            if (response.next) {
                variable.resPaginationInfo['next'] = response.next;
                variable.resPaginationInfo['prev'] = response.prev;
                variable.resPaginationInfo['last'] = response.next ? false : true;
                variable.resPaginationInfo['first'] = response.prev ? false : true;
            } else {
                variable.resPaginationInfo['first'] = variable.resPaginationInfo['page'] <= 1 ? true : false;
                variable.resPaginationInfo['last'] = response.hasMoreItems === '' ? !(variable.resPaginationInfo['page'] < variable.resPaginationInfo['totalPages']) : !response.hasMoreItems;
            }
        }
    }
}