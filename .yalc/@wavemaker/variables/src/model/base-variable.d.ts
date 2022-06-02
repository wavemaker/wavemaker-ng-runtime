import { EventNotifier } from "../types/event-notifier";
export declare enum VariableEvents {
    BEFORE_INVOKE = "beforeInvoke",
    AFTER_INVOKE = "afterInvoke"
}
export declare abstract class BaseVariable implements EventNotifier {
    protected _id: string;
    name: string;
    owner: string;
    category: string;
    isList: boolean;
    dataSet: any;
    dataBinding: any;
    _context: any;
    isMuted: boolean;
    params: any;
    paramProvider: any;
    private eventNotifier;
    notify(event: string, args: any[]): void;
    subscribe(event: string, fn: Function): () => void;
    execute(operation: any, options: any): any;
    invokeOnParamChange(obj?: any, newVal?: any, oldVal?: any): Promise<this>;
    getData(): any;
    setData(dataSet: any): any;
    getValue(key: string, index: number): any;
    setValue(key: string, value: any): any;
    getItem(index: number): any;
    /**
     *
     * @param index, a number in ideal case
     *        it can be the object to be replaced by the passed value
     * @param value
     * @returns {any}
     */
    setItem(index: any, value: any, options?: any): any;
    /**
     * This method is to get target node options like path, parentIndex and isList
     * @param options: provided options
     * @returns {object}
     * Example: if we have parent dataset as object and we are performing operations on inner list then we have to set isList as true.
     * So finding the target node type and updating the isList option.
     */
    private getChildDetails;
    addItem(value: any, options?: any): any;
    removeItem(index: any, options?: any): any;
    clearData(): any;
    getCount(): any;
    /**
     * Return the prefab name if the variable is form a prefab
     * @returns {string}
     */
    getPrefabName(): any;
    mute(): void;
    unmute(): void;
    destroy(): void;
}
