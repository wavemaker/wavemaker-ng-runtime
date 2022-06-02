var IDataSource = /** @class */ (function () {
    function IDataSource() {
    }
    return IDataSource;
}());
export { IDataSource };
var Operation;
(function (Operation) {
    Operation["LIST_RECORDS"] = "listRecords";
    Operation["UPDATE_RECORD"] = "updateRecord";
    Operation["INSERT_RECORD"] = "insertRecord";
    Operation["DELETE_RECORD"] = "deleteRecord";
    Operation["INVOKE"] = "invoke";
    Operation["UPDATE"] = "update";
    Operation["NOTIFY"] = "notify";
    Operation["IS_API_AWARE"] = "isApiAware";
    Operation["SUPPORTS_CRUD"] = "supportsCRUD";
    Operation["SUPPORTS_DISTINCT_API"] = "supportsDistinctAPI";
    Operation["IS_PAGEABLE"] = "isPageable";
    Operation["IS_SORTABLE"] = "isSortable";
    Operation["GET_OPERATION_TYPE"] = "getOperationType";
    Operation["GET_RELATED_PRIMARY_KEYS"] = "getRelatedTablePrimaryKeys";
    Operation["GET_ENTITY_NAME"] = "getEntityName";
    Operation["SET_INPUT"] = "setinput";
    Operation["GET_RELATED_TABLE_DATA"] = "getRelatedTableData";
    Operation["GET_DISTINCT_DATA_BY_FIELDS"] = "getDistinctDataByFields";
    Operation["GET_AGGREGATED_DATA"] = "getAggregatedData";
    Operation["GET_MATCH_MODE"] = "getMatchMode";
    Operation["DOWNLOAD"] = "download";
    Operation["GET_NAME"] = "getName";
    Operation["GET_PROPERTIES_MAP"] = "getPropertiesMap";
    Operation["GET_PRIMARY_KEY"] = "getPrimaryKey";
    Operation["GET_BLOB_URL"] = "getBlobURL";
    Operation["SUPPORTS_SERVER_FILTER"] = "supportsServerFilter";
    Operation["GET_OPTIONS"] = "getOptions";
    Operation["SEARCH_RECORDS"] = "searchRecords";
    Operation["GET_REQUEST_PARAMS"] = "getRequestParams";
    Operation["GET_PAGING_OPTIONS"] = "getPagingOptions";
    Operation["FETCH_DISTINCT_VALUES"] = "fetchDistinctValues";
    Operation["GET_UNIQUE_IDENTIFIER"] = "getUniqueIdentifier";
    Operation["GET_CONTEXT_IDENTIFIER"] = "getContextIdentifier";
    Operation["IS_UPDATE_REQUIRED"] = "isUpdateRequired";
    Operation["ADD_ITEM"] = "addItem";
    Operation["SET_ITEM"] = "setItem";
    Operation["REMOVE_ITEM"] = "removeItem";
    Operation["IS_BOUND_TO_LOCALE"] = "isBoundToLocale";
    Operation["GET_DEFAULT_LOCALE"] = "getDefaultLocale";
    Operation["CANCEL"] = "cancel";
    Operation["SET_PAGINATION"] = "setPagination";
})(Operation || (Operation = {}));
export var DataSource = {
    Operation: Operation
};
//# sourceMappingURL=types.js.map