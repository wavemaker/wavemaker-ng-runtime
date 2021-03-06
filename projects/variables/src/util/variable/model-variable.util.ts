declare const _;

export const setData = (variable: any, dataSet: any) => {
    /* check dataset sanity */
    if (!dataSet) {
        return variable.dataSet;
    }
    /* check array type dataset for list type variable */
    if (variable.isList && !_.isArray(dataSet)) {
        return variable.dataSet;
    }

    /*change the dataSet*/
    variable.dataSet = dataSet;

    /* return the value since it is not an async call */
    return variable.dataSet;
};

export const getValue = (variable, key, index) => {
    index = index || 0;

    /* return the value against the specified key */
    return variable.isList ? variable.dataSet[index][key] : variable.dataSet[key];
};

export const setValue = (variable, key, value) => {
    /* check param sanity */
    if (!key || variable.isList) {
        return variable.dataSet;
    }

    /* set the value against the specified key */
    variable.dataSet[key] = value;

    /* return the new dataSet */
    return variable.dataSet;
};

export const getItem = (variable, index) => {
    /* return the object against the specified index */
    return variable.isList ? variable.dataSet[index] : variable.dataSet;
};

export const setItem = (variable, i, value) => {
    let index;
    /* check param sanity */
    if (_.isUndefined(i) || _.isUndefined(value) || !variable.isList) {
        return variable.dataSet;
    }
    if (_.isObject(i)) {
        index = _.findIndex(variable.dataSet, i);
    } else {
        index = i;
    }
    if (index > -1) {
        /* set the value against the specified index */
        variable.dataSet[index] = value;
    }

    /* return the new dataSet */
    return variable.dataSet;
};

export const addItem = (variable, value, index) => {
    /* check param sanity */
    if (!value || !variable.isList) {
        return variable.dataSet;
    }

    /* check for index sanity */
    index = index !== undefined ? index : variable.dataSet.length;

    /* set the value against the specified index */
    variable.dataSet.splice(index, 0, value);

    /* return the new dataSet */
    return variable.dataSet;
};

/*'index' can be index value of the element in array or an object with property values which need to be removed*/
export const removeItem = (variable, i, exactMatch) => {
    let index;
    /* check for index sanity */
    i = i !== undefined ? i : variable.dataSet.length - 1;

    if (_.isObject(i)) {
        index = _.findIndex(variable.dataSet, i);
        /*When exactMatch property is set to true delete only when every property values are same*/
        if (index > -1 && (!exactMatch || (exactMatch && _.isEqual(variable.dataSet[index], i)))) {
            variable.dataSet.splice(index, 1);
        }
    } else {
        /* set the value against the specified index */
        variable.dataSet.splice(i, 1);
    }
    /* return the new dataSet */
    return variable.dataSet;
};

export const clearData = (variable) => {
    /* empty the variable dataset */
    variable.dataSet = variable.isList ? [] : {};

    /* return the variable dataSet*/
    return variable.dataSet;
};

export const getCount = (variable) => {
    /* return the length of dataSet */
    return variable.isList ? variable.dataSet.length : 1;
};
