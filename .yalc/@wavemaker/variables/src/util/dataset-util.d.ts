export default class DatasetUtil {
    static isValidDataset(dataSet: any, isList?: boolean): any;
    static getValue(dataSet: any, key: any, index: any, isList?: boolean): any;
    static setValue(dataSet: any, key: any, value: any, isList?: boolean): any;
    static getItem(dataSet: any, index: any, isList?: boolean): any;
    /**
     * This method is used to find target node
     * @param dataSet: provided dataSet
     * @param options: provided options
     * @returns {any} targetnode
     */
    private static getTargetNode;
    static setItem(dataSet: any, i: any, value: any, options?: any): any;
    static addItem(dataSet: any, value: any, index: any, options?: any): any;
    /**
     *
     * @param dataSet
     * @param i, can be index value of the object/element in array
     *      or
     * the whole object which needs to be removed
     * @param exactMatch
     * @returns {any}
     */
    static removeItem(dataSet: any, i: any, options: any): any;
    static getValidDataset(isList?: boolean): {};
    static getCount(dataSet: any, isList?: boolean): any;
}
