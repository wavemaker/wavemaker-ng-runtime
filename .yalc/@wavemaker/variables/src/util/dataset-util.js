var DatasetUtil = /** @class */ (function () {
    function DatasetUtil() {
    }
    DatasetUtil.isValidDataset = function (dataSet, isList) {
        if (!dataSet) {
            return false;
        }
        // check array type dataset for list type variable
        if (isList && !_.isArray(dataSet)) {
            return false;
        }
        // change the dataSet
        return dataSet;
    };
    DatasetUtil.getValue = function (dataSet, key, index, isList) {
        index = index || 0;
        // return the value against the specified key
        return isList ? dataSet[index][key] : dataSet[key];
    };
    DatasetUtil.setValue = function (dataSet, key, value, isList) {
        // check param sanity
        if (key && !isList) {
            dataSet[key] = value;
        }
        // return the new dataSet
        return dataSet;
    };
    DatasetUtil.getItem = function (dataSet, index, isList) {
        // return the object against the specified index
        return isList ? dataSet[index] : dataSet;
    };
    /**
     * This method is used to find target node
     * @param dataSet: provided dataSet
     * @param options: provided options
     * @returns {any} targetnode
     */
    DatasetUtil.getTargetNode = function (dataSet, options) {
        dataSet = options.parentIndex !== undefined ? dataSet[options.parentIndex] : dataSet;
        return _.get(dataSet, options.path);
    };
    DatasetUtil.setItem = function (dataSet, i, value, options) {
        var index;
        // check param sanity
        if (_.isUndefined(i) || !options.isList) {
            return dataSet;
        }
        if (_.isObject(i)) {
            index = _.findIndex(dataSet, i);
        }
        else {
            index = i;
        }
        if (options.path) {
            var innerArray = DatasetUtil.getTargetNode(dataSet, options);
            var innerElemindex = _.findIndex(innerArray, i);
            if (innerElemindex > -1) {
                innerArray[innerElemindex] = value;
            }
        }
        else {
            if (index > -1) {
                // set the value against the specified index
                dataSet[index] = value;
            }
        }
        // return the new dataSet
        return dataSet;
    };
    DatasetUtil.addItem = function (dataSet, value, index, options) {
        // check param sanity
        if (_.isUndefined(value) || !options.isList) {
            return dataSet;
        }
        // set the value against the specified index
        if (options.path) {
            var innerArray = DatasetUtil.getTargetNode(dataSet, options);
            if (innerArray) {
                // check for index sanity
                index = index !== undefined ? index : innerArray.length;
                innerArray.splice(index, 0, value);
            }
            else {
                options.parentIndex !== undefined ? _.set(dataSet[options.parentIndex], options.path, [value]) : _.set(dataSet, options.path, [value]);
            }
        }
        else {
            // check for index sanity
            index = index !== undefined ? index : dataSet.length;
            dataSet.splice(index, 0, value);
        }
        // return the new dataSet
        return dataSet;
    };
    /**
     *
     * @param dataSet
     * @param i, can be index value of the object/element in array
     *      or
     * the whole object which needs to be removed
     * @param exactMatch
     * @returns {any}
     */
    DatasetUtil.removeItem = function (dataSet, i, options) {
        var index, exactMatch;
        // check for index sanity
        i = i !== undefined ? i : dataSet.length - 1;
        if (_.isBoolean(options)) {
            exactMatch = options;
        }
        if (_.isObject(options)) {
            exactMatch = options.exactMatch;
        }
        if (_.isObject(i)) {
            if (options.path) {
                var innerArray = DatasetUtil.getTargetNode(dataSet, options);
                var innerElemindex = _.findIndex(innerArray, i);
                if (innerElemindex > -1 && (!exactMatch || (exactMatch && _.isEqual(innerArray[innerElemindex], i)))) {
                    innerArray.splice(innerElemindex, 1);
                }
            }
            else {
                index = _.findIndex(dataSet, i);
                // When exactMatch property is set to true delete only when every property values are same*/
                if (index > -1 && (!exactMatch || (exactMatch && _.isEqual(dataSet[index], i)))) {
                    dataSet.splice(index, 1);
                }
            }
        }
        else {
            dataSet.splice(i, 1);
        }
        // return the new dataSet
        return dataSet;
    };
    DatasetUtil.getValidDataset = function (isList) {
        return isList ? [] : {};
    };
    DatasetUtil.getCount = function (dataSet, isList) {
        return isList ? dataSet.length : Object.keys(dataSet).length;
    };
    return DatasetUtil;
}());
export default DatasetUtil;
//# sourceMappingURL=dataset-util.js.map