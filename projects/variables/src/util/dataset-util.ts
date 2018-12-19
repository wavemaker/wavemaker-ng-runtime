declare const _;

export default class DatasetUtil {

    static isValidDataset(dataSet, isList?) {
        if (!dataSet) {
            return false;
        }

        // check array type dataset for list type variable
        if (isList && !_.isArray(dataSet)) {
            return false;
        }

        // change the dataSet
        return dataSet;
    }

    static getValue(dataSet, key, index, isList?) {
        index = index || 0;

        // return the value against the specified key
        return isList ? dataSet[index][key] : dataSet[key];
    }

    static setValue(dataSet, key, value, isList?) {
        // check param sanity
        if (key && !isList) {
            dataSet[key] = value;
        }

        // return the new dataSet
        return dataSet;
    }

    static getItem(dataSet, index, isList?) {
        // return the object against the specified index
        return isList ? dataSet[index] : dataSet;
    }

    static setItem(dataSet, i, value, isList?) {
        let index;

        // check param sanity
        if (_.isUndefined(i) || !isList) {
            return dataSet;
        }

        if (_.isObject(i)) {
            index = _.findIndex(dataSet, i);
        } else {
            index = i;
        }

        if (index > -1) {
            // set the value against the specified index
            dataSet[index] = value;
        }

        // return the new dataSet
        return dataSet;
    }

    static addItem(dataSet, value, index, isList?) {
        // check param sanity
        if (_.isUndefined(value) || !isList) {
            return dataSet;
        }

        // check for index sanity
        index = index !== undefined ? index : dataSet.length;

        // set the value against the specified index
        dataSet.splice(index, 0, value);

        // return the new dataSet
        return dataSet;
    }

    /**
     *
     * @param dataSet
     * @param i, can be index value of the object/element in array
     *      or
     * the whole object which needs to be removed
     * @param exactMatch
     * @returns {any}
     */
    static removeItem(dataSet, i, exactMatch) {
        let index;
        // check for index sanity
        i = i !== undefined ? i : dataSet.length - 1;

        if (_.isObject(i)) {
            index = _.findIndex(dataSet, i);
            // When exactMatch property is set to true delete only when every property values are same*/
            if (index > -1 && (!exactMatch || (exactMatch && _.isEqual(dataSet[index], i)))) {
                dataSet.splice(index, 1);
            }
        } else {
            dataSet.splice(i, 1);
        }
        // return the new dataSet
        return dataSet;
    }

    static getValidDataset(isList?) {
        return isList ? [] : {};
    }

    static getCount(dataSet, isList?) {
        return isList ? dataSet.length : Object.keys(dataSet).length;
    }
}
