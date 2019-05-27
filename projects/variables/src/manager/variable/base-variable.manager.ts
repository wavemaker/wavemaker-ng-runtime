import { httpService, processBinding } from '../../util/variable/variables.utils';
import { appManager} from './../../util/variable/variables.utils';
import { AdvancedOptions } from '../../advanced-options';

declare const _;

export abstract class BaseVariableManager {

    initBinding(variable, bindSource?, bindTarget?) {
        processBinding(variable, variable._context, bindSource, bindTarget);
    }

    notifyInflight(variable, status: boolean, data?: any) {
        appManager.notify('toggle-variable-state', {
            variable: variable,
            active: status,
            data: data
        });
    }

    /**
     * This method makes the final angular http call that returns an observable.
     * We attach this observable to variable to cancel a network call
     * @param requestParams
     * @param variable
     * @param dbOperation
     */
    httpCall(requestParams, variable, params?: any) {
        return new Promise((resolve, reject) => {
            variable._observable = httpService.sendCallAsObservable(requestParams, params).subscribe((response: any) => {
                if (response && response.type) {
                    resolve(response);
                }
            }, (err: any) => {
                if (httpService.isPlatformSessionTimeout(err)) {
                    // send the notification manually to hide any context spinners on page.
                    // [TODO]: any spinners on widget listening on this variable will also go off. Need to see an approach to sovle that.
                    this.notifyInflight(variable, false, err);
                    err._401Subscriber.asObservable().subscribe(
                        response => resolve(response),
                        err => reject(err));
                } else {
                    reject(err);
                }
            });
        });
    }

    /**
     * This method prepares the options parameter for variable callbacks.
     * @param xhrObj, The xhrObj to be passed
     * @param moreOptions, any other info to be passed in the options param
     */
    prepareCallbackOptions(xhrObj: any, moreOptions? : any): AdvancedOptions {
        let options: AdvancedOptions = {};
        options['xhrObj'] = xhrObj;
        if (moreOptions) {
            _.extend(options, moreOptions);
        }
        return options;
    }
}
