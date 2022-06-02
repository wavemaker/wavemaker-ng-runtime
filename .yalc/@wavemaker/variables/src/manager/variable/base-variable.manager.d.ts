import { AdvancedOptions } from '../../advanced-options';
export declare abstract class BaseVariableManager {
    initBinding(variable: any, bindSource?: any, bindTarget?: any): void;
    notifyInflight(variable: any, status: boolean, data?: any, options?: any): void;
    /**
     * This method sets the variable parameter requestTrackId to X-WM-Request-Track-Id which is received in the response headers.
     * @param response
     */
    setRequestTrackId(response: any, variable: any): void;
    /**
     * This method makes the final angular http call that returns an observable.
     * We attach this observable to variable to cancel a network call
     * @param requestParams
     * @param variable
     * @param dbOperation
     */
    httpCall(requestParams: any, variable: any, params?: any): Promise<unknown>;
    /**
     * This method prepares the options parameter for variable callbacks.
     * @param xhrObj, The xhrObj to be passed
     * @param moreOptions, any other info to be passed in the options param
     */
    prepareCallbackOptions(xhrObj: any, moreOptions?: any): AdvancedOptions;
}
