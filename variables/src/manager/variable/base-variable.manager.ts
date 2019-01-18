import { httpService, processBinding } from '../../util/variable/variables.utils';
import { appManager} from './../../util/variable/variables.utils';

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
    httpCall(requestParams, variable) {
        return new Promise((resolve, reject) => {
            variable._observable = httpService.sendCallAsObservable(requestParams).subscribe((response: any) => {
                if (response && response.type) {
                    resolve(response);
                }
            }, (err: any) => {
                if (httpService.isPlatformSessionTimeout(err)) {
                    err._401Subscriber.asObservable().subscribe(
                        response => resolve(response),
                        err => reject(err));
                } else {
                    reject(err);
                }
            });
        });
    }
}