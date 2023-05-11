import { appManager } from './../../util/variable/variables.utils';
// declare const _: any;
import _ from 'lodash';
var BaseVariableManager = /** @class */ (function () {
    function BaseVariableManager() {
    }
    BaseVariableManager.prototype.initBinding = function (variable, bindSource, bindTarget) {
        // processBinding(variable, variable._context, bindSource, bindTarget);
        // ToDo - variable seperation
    };
    BaseVariableManager.prototype.notifyInflight = function (variable, status, data, options) {
        // ToDo - variable seperation
        appManager && appManager.notify('toggle-variable-state', {
            variable: variable,
            active: status,
            data: data,
            options: options
        });
    };
    /**
     * This method sets the variable parameter requestTrackId to X-WM-Request-Track-Id which is received in the response headers.
     * @param response
     */
    BaseVariableManager.prototype.setRequestTrackId = function (response, variable) {
        var _a;
        var requestTrackId = (_a = response === null || response === void 0 ? void 0 : response.headers) === null || _a === void 0 ? void 0 : _a.get('x-wm-request-track-id');
        if (requestTrackId) {
            variable._requestTrackId = requestTrackId;
        }
    };
    /**
     * This method makes the final angular http call that returns an observable.
     * We attach this observable to variable to cancel a network call
     * @param requestParams
     * @param variable
     * @param dbOperation
     */
    // ToDo - variable seperation
    BaseVariableManager.prototype.httpCall = function (requestParams, variable, params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            variable._observable = variable.httpService.sendCallAsObservable(requestParams, params).subscribe(function (response) {
                if (response && response.type) {
                    _this.setRequestTrackId(response, variable);
                    resolve(response);
                }
            }, function (err) {
                _this.setRequestTrackId(err, variable);
                if (variable.httpService.isPlatformSessionTimeout(err)) {
                    // send the notification manually to hide any context spinners on page.
                    // [TODO]: any spinners on widget listening on this variable will also go off. Need to see an approach to sovle that.
                    _this.notifyInflight(variable, false, err);
                    err._401Subscriber.asObservable().subscribe(function (response) { return resolve(response); }, function (e) { return reject(e); });
                }
                else {
                    reject(err);
                }
            });
        });
    };
    /**
     * This method prepares the options parameter for variable callbacks.
     * @param xhrObj, The xhrObj to be passed
     * @param moreOptions, any other info to be passed in the options param
     */
    BaseVariableManager.prototype.prepareCallbackOptions = function (xhrObj, moreOptions) {
        var options = {};
        options['xhrObj'] = xhrObj;
        if (moreOptions) {
            _.extend(options, moreOptions);
        }
        return options;
    };
    return BaseVariableManager;
}());
export { BaseVariableManager };
//# sourceMappingURL=base-variable.manager.js.map