import { Injectable } from '@angular/core';
import {clone, get, includes, isArray, isEmpty, isObject, merge} from "lodash-es";

@Injectable({ providedIn: 'root' })
export class StatePersistence {
    private HISTORY_HANDLER = 'replace';
    private HISTORY_HANDLER_TYPES = {'push': 'pushState', 'replace': 'replaceState'};
    private WIDGET_STATE_KEY = 'ws';

    /**
     * Sets the passed value as the History handler if it exists in the History_Handler_Types object
     * @param val
     */
    public setHistoryHandler(val) {
        if (Object.keys(this.HISTORY_HANDLER_TYPES).indexOf(val) > -1) {
            this.HISTORY_HANDLER = val;
        }
    }

    /**
     * Constructs a unique key for setting state param by using the viewParent property of a widget
     * so that name conflicts are avoided when the same widget name is
     * present inside a Page, a Partial within a Page or a Prefab within a Page and so on.
     * E.g.:
     * if a page has a tabs widget with the name tabs1, a partial Partial1(inside container1) inclusion within which
     * there is a tabs with name tabs1 and a prefab MyPrefab inclusion with a tabs widget with the name tabs1,
     * getNestedPath will return tabs1, container1.Partial1.tabs1 and MyPrefab1.MyPrefab.tabs1 respectively.
     * @param viewParent
     * @param widgetName
     * @param currentOutput
     */
    public getNestedPath(viewParent: any, widgetName: string, currentOutput?: string) {
        let out = currentOutput || widgetName;
        if (viewParent && (viewParent.prefabName || viewParent.partialName)) {
            out = out.length > 0 ? out + '.' + (viewParent.prefabName || viewParent.partialName) : (viewParent.prefabName || viewParent.partialName);
            // same partial/prefab can be dropped multiple times in a page. Appending container's name for uniqueness.
            out = out + '.' + viewParent.containerWidget.name;
            return this.getNestedPath(viewParent.containerWidget.viewParent, widgetName, out);
        }
        return out?.split('.').reverse().join('.');
    }

    /**
     * Decodes and parses the state information and returns the parsed state object
     * @param mode : optional parameter if the widget/variable uses a state handling mode(url, local storage, session storage)
     * other than the project level mode
     */
    public getStateInformation(mode) {
        let parsedStateInfo, stateInfo;
        if (mode.toLowerCase() === 'url') {
            const decodedURI = decodeURIComponent(window.location.href);
            stateInfo = decodedURI.match(/(wm_state=).*?(&|$)/);
            if (stateInfo) {
                stateInfo = stateInfo[0].replace('wm_state=', '');
                parsedStateInfo = this.uriToJson(stateInfo);
                return parsedStateInfo;
            }
        } else if (mode.toLowerCase() === 'localstorage') {
            stateInfo = localStorage.getItem(window.location.pathname.replace(/\//g, '') + '_wm_state');
        } else if (mode.toLowerCase() === 'sessionstorage') {
            stateInfo = sessionStorage.getItem(window.location.pathname.replace(/\//g, '') + '_wm_state');
        }
        if (stateInfo) {
            parsedStateInfo = JSON.parse(stateInfo);
            return parsedStateInfo;
        }

        return;
    }

    /**
     * Checks if the passed widget instance has any state information available or not
     * @param widget
     * @param mode : optional parameter if the widget uses a state handling mode(url, local storage, session storage)
     * other than the project level mode
     */
    public getWidgetState(widget, mode?) {
        mode = mode || this.computeMode(widget.statehandler);
        if (!mode) {
            return;
        }
        let parsedStateInfo = this.getStateInformation(mode);
        if (parsedStateInfo && widget  && widget.getAppInstance().activePageName && (mode.toLowerCase() === 'localstorage' || mode.toLowerCase() === 'sessionstorage')) {
            parsedStateInfo = parsedStateInfo[widget.getAppInstance().activePageName];
        }
        if (get(parsedStateInfo, this.WIDGET_STATE_KEY)) {
            const stateKey = this.getNestedPath(widget.viewParent, widget.getWidget().name);
            return parsedStateInfo[this.WIDGET_STATE_KEY][stateKey];
        }
        return;
    }

    public computeMode(widgetStateHandler) {
        if (!widgetStateHandler) {
            return 'url';
        } else if (widgetStateHandler && widgetStateHandler.toLowerCase() === 'none') {
            return;
        } else {
            return widgetStateHandler.toLowerCase();
        }
    }

    /**
     * Sets the passed value to the state information by using the passed widget instance
     * @param widget
     * @param value
     * @param mode : optional parameter if the widget uses a state handling mode(url, local storage, session storage)
     * other than the project level mode
     */
    public setWidgetState(widget, value, mode?) {
        const stateKey = this.getNestedPath(widget.viewParent, widget.getWidget().name);
        mode = mode || this.computeMode(widget.statehandler);
        if (!mode) {
            return;
        }
        this.setStateParams(this.WIDGET_STATE_KEY, stateKey, value, mode, widget);
    }

    /**
     * Removes the passed widget’s state information from the State Object. If a key is passed, then only that
     * particular entry will be removed, not any other entries for that widget.
     * @param widget
     * @param key
     * @param mode : optional parameter if the widget uses a state handling mode(url, local storage, session storage)
     * other than the project level mode
     */
    public removeWidgetState(widget, key?, mode?) {
        mode = mode || this.computeMode(widget.statehandler);
        if (!mode) {
            return;
        }
        const stateKey = this.getNestedPath(widget.viewParent, widget.getWidget().name);
        this.removeStateParam(this.WIDGET_STATE_KEY, stateKey, key, mode, widget);
    }

    /**
     * Sets the passed value to the state information by using the passed variable name as key
     * @param variableName
     * @param value
     * @param mode : optional parameter if the variable uses a state handling mode(url, local storage, session storage)
     * other than the project level mode
     */
    public setStateVariable(variableName, value, mode?) {
        mode = mode || this.computeMode(mode);
        if (!mode) {
            return;
        }
        this.setStateParams('', variableName, value, mode);
    }

    /**
     * Checks if the passed variable name has any state information available in the url or not
     * @param variableName
     * @param mode : optional parameter if the variable uses a state handling mode(url, local storage, session storage)
     * other than the project level mode
     */
    public getStateVariable(variableName: string, mode?) {
        mode = mode || this.computeMode(mode);
        if (!mode) {
            return;
        }
        const parsedStateInfo = this.getStateInformation(mode);
        if (parsedStateInfo) {
            return parsedStateInfo[variableName];
        }
        return;
    }

    /**
     * Removes the passed variable’s state information from the URL.
     * @param variableName
     * @param mode : optional parameter if the widget uses a state handling mode(url, local storage, session storage)
     * other than the project level mode
     */
    public removeStateVariable(variableName, mode?) {
        mode = mode || this.computeMode(mode);
        if (!mode) {
            return;
        }
        this.removeStateParam('', variableName, null, mode);
    }

    /**
     * Sets the passed state information in the url by parsing the passed value and checking
     * its type. If its an array type, then the passed values will be pushed into an array and then set in the state
     * E.g.
     * Current state information is like :
     {
       "widget_state": {
           "Table1": {
               "selectedItem": [
                 {
                   "page": "1",
                   "index": "1"
                 }
               ],
           "pagination": "1"
         }
         }
     }
     * Input value will be like:
     {
       "selectedItem": [
         {
           "page": "1",
           "index": "2"
         }
       ]
     }

     * This parsing logic will convert it to the following
     {
       "widget_state": {
           "Table1": {
               "selectedItem": [
                 {
                   "page": "1",
                   "index": "1"
                 },
                 {
                   "page": "1",
                   "index": "2"
                 }
               ],
           "pagination": "1"
         }
         }
     }
     * Based on how the HISTORY_HANDLER is configured, the updated url will either replace the existing url or
     * push a new state in the url so that back button may track each update to the state.
     * @param stateParam
     * @param key
     * @param val
     * @param mode : optional parameter if the widget/variable uses a state handling mode(url, local storage, session storage)
     * other than the project level mode
     */
    public setStateParams(stateParam: string, key: string, val: any, mode?, widget?) {
        let url = '', parsedObj;
        const stateObj = this.getStateInformation(mode);
        if (widget && stateObj && widget.getAppInstance().activePageName && (mode.toLowerCase() === 'localstorage' || mode.toLowerCase() === 'sessionstorage')) {
            parsedObj = stateObj[widget.getAppInstance().activePageName];
        } else {
            parsedObj = clone(stateObj);
        }
        if (stateParam) {
            if (parsedObj && !parsedObj[stateParam]) {
                parsedObj[stateParam] = {};
            } else if (!parsedObj) {
                parsedObj = {[stateParam]: {}};
            }
            if (isObject(val) && !isArray(val)) {
                parsedObj[stateParam][key] = parsedObj[stateParam][key] || {};
                merge(parsedObj[stateParam][key], val);
            } else {
                parsedObj[stateParam][key] = val;
            }
        } else {
            if (parsedObj && !parsedObj[key]) {
                parsedObj[key] = {};
            } else if (!parsedObj) {
                parsedObj = {[key]: {}};
            }
            if (isObject(val) && !isArray(val)) {
                parsedObj[key] = parsedObj[key] || {};
                merge(parsedObj[key], val);
            } else {
                parsedObj[key] = val;
            }
        }
        // for Local and Session Storage, wrap state object inside page name so that widget name conflicts don't arise between pages.
        if (widget && widget.getAppInstance().activePageName && (mode.toLowerCase() === 'localstorage' || mode.toLowerCase() === 'sessionstorage')) {
            if (stateObj) {
                stateObj[widget.getAppInstance().activePageName] = parsedObj;
                parsedObj = stateObj;
            } else {
                parsedObj = {[widget.getAppInstance().activePageName]: parsedObj};
            }

        }


        let decodedURI = decodeURIComponent(window.location.href);
        if (decodedURI.indexOf('?') < 0) {
            decodedURI = decodedURI + '?wm_state=';
        } else if (decodedURI.indexOf('wm_state') < 0) {
            decodedURI = decodedURI + '&wm_state=';
        }
        url = decodedURI.replace(/(wm_state=).*?(&|$)/ ,'$1' + this.jsonToUri(parsedObj) + '$2');

        if (mode.toLowerCase() === 'localstorage') {
            localStorage.setItem(window.location.pathname.replace(/\//g, '') + '_wm_state', JSON.stringify(parsedObj));
            return;
        } else if (mode.toLowerCase() === 'sessionstorage') {
            sessionStorage.setItem(window.location.pathname.replace(/\//g, '') + '_wm_state', JSON.stringify(parsedObj));
            return;
        }

        if (decodeURIComponent(window.location.href) === decodeURIComponent(url)) {
            return;
        }
        if (this.HISTORY_HANDLER === 'push') {
            window.history.pushState({ path: url }, '', url);
        } else if (this.HISTORY_HANDLER === 'replace') {
            window.history.replaceState({ path: url }, '', url);
        }
    }

    /**
     * Removes the passed state information from the url
     * E.g.
     * Current state information is like :
     {
       "widget_state": {
           "Table1": {
               "selectedItem": [
                 {
                   "page": "1",
                   "index": "1"
                 },
                 {
                 "page": "2",
                 "index": "1"
                 }
               ],
           "pagination": "1"
         }
         }
     }
     * Input values will be like:
     subParam : 'selectedItem'

     * This method will convert it to the following
     {
       "widget_state": {
           "Table1": {
             "pagination": "1"
            }
         }
     }
     * @param stateParam
     * @param key
     * @param subParam
     * @param mode : optional parameter if the widget/variable uses a state handling mode(url, local storage, session storage)
     * other than the project level mode
     */
    public removeStateParam(stateParam, key, subParam?, mode?, widget?) {
        let url = '', parsedObj;
        const stateObj = this.getStateInformation(mode);
        if (widget && stateObj && widget.getAppInstance().activePageName && (mode.toLowerCase() === 'localstorage' || mode.toLowerCase() === 'sessionstorage')) {
            parsedObj = stateObj[widget.getAppInstance().activePageName];
        } else {
            parsedObj = clone(stateObj);
        }
        if (!get(parsedObj, [stateParam]) && !get(parsedObj, key)) {
            return;
        }
        // Fix for [WMS-24698]: when table is inside a prefab, state persistence key is like "TestLabel_11.TestLabel_1.staticVariable1Table1"
        // get(parsedObj, stateParam + '.' + key) is undefined so using (parsedObj && parsedObj[stateParam] && parsedObj[stateParam][key]) condition.
        if (get(parsedObj, stateParam + '.' + key) || (parsedObj && parsedObj[stateParam] && parsedObj[stateParam][key])) {
            if (subParam) {
                delete parsedObj[stateParam][key][subParam];
            } else {
                delete parsedObj[stateParam][key];
            }
            if (isEmpty(parsedObj[stateParam][key])) {
                delete parsedObj[stateParam][key];
            }
            if (isEmpty(parsedObj[stateParam])) {
                delete parsedObj[stateParam];
            }
        } else if (!stateParam && get(parsedObj, key)) {
            delete parsedObj[key];
        }

        // for Local and Session Storage, wrap state object inside page name so that widget name conflicts don't arise between pages.
        if (widget && widget.getAppInstance().activePageName && (mode.toLowerCase() === 'localstorage' || mode.toLowerCase() === 'sessionstorage')) {
            if (stateObj) {
                stateObj[widget.getAppInstance().activePageName] = parsedObj;
                parsedObj = stateObj;
            } else {
                parsedObj = {[widget.getAppInstance().activePageName]: parsedObj};
            }

        }
        if (mode.toLowerCase() === 'localstorage') {
            localStorage.setItem(window.location.pathname.replace(/\//g, '') + '_wm_state', JSON.stringify(parsedObj));
            return;
        } else if (mode.toLowerCase() === 'sessionstorage') {
            sessionStorage.setItem(window.location.pathname.replace(/\//g, '') + '_wm_state', JSON.stringify(parsedObj));
            return;
        }

        const decodedURI = decodeURIComponent(window.location.href);
        if (isEmpty(parsedObj)) {
            url = decodedURI.replace(/(wm_state=).*?(&|$)/ ,'' + '$2');
            if (includes(['&', '?'], url.charAt(url.length - 1))) {
                url = url.replace(url.charAt(url.length - 1), '');
            }
        } else {
            url = decodedURI.replace(/(wm_state=).*?(&|$)/ ,'$1' + this.jsonToUri(parsedObj) + '$2');
        }

        window.history.replaceState({ path: url }, '', url);
    }

    /**
     * Converts the State Information object into an encoded object when state handling mode is URL
     * so that a meaningful URL can be formed and the user can make changes easily to the URL.
     * E.g.
     * state information input will be like :
     {
         "widget-state": {
             "Table1": {
             "pagination": "3",
             "search":[
                        {
                            "field":"state",
                            "value":"NY",
                            "matchMode":"anywhereignorecase",
                            "type":"string"
                        }
                      ]
             }
         }
     },
     "CustomVariableSelectedItems": ["2", "3"]
     }


     * This method will convert it to the following
     ('widget-state'~('Table1'~('pagination'~'3'_'search'~!('field'~'state'_'value'~'NY'_'matchMode'~'anywhereignorecase'_'type'~'string')*))_'CustomVariableSelectedItems'~!'2'_'3'*)
     * @param jsonObj
     */
    private jsonToUri(jsonObj) {
        return encodeURIComponent(
            JSON.stringify(jsonObj)
                .replace(/[()'~_!*]/g, function(c) {
                    // Replace ()'~_!* with \u0000 escape sequences
                    return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4)
                })
                .replace(/\{/g, '(')    //    { -> (
                .replace(/\}/g, ')')    //    } -> )
                .replace(/"/g,  "'")    //    " -> '
                .replace(/\:/g, '~')    //    : -> ~
                .replace(/,/g,  '_')    //    , -> _
                .replace(/\[/g, '!')    //    [ -> !
                .replace(/\]/g, '*')    //    ] -> *
        );
    }

    /**
     * Decodes the encoded State Information object into a JSON object when state handling mode is URL
     * so that state information can be parsed and applied to the widgets.
     * E.g.
     * encoded state information input will be like :
     ('widget-state'~('Table1'~('pagination'~'3'_'search'~!('field'~'state'_'value'~'NY'_'matchMode'~'anywhereignorecase'_'type'~'string')*))_'CustomVariableSelectedItems'~!'2'_'3'*)


     * This method will convert it to the following
     {
         "widget-state": {
             "Table1": {
             "pagination": "3",
             "search":[
                        {
                            "field":"state",
                            "value":"NY",
                            "matchMode":"anywhereignorecase",
                            "type":"string"
                        }
                      ]
             }
         }
     },
     "CustomVariableSelectedItems": ["2", "3"]
     }
     * @param encodedObj
     */
    private uriToJson(encodedObj) {
        let response: any;
        try {
            response = JSON.parse(
                decodeURIComponent(encodedObj)
                    .replace(/\(/g, '{')    //    ( -> {
                    .replace(/\)/g, '}')    //    ) -> }
                    .replace(/'/g,  '"')    //    ' -> "
                    .replace(/~/g,  ':')    //    ~ -> :
                    .replace(/_/g,  ',')    //    _ -> ,
                    .replace(/\!/g, '[')    //    ! -> [
                    .replace(/\*/g, ']')    //    * -> ]
            );
        } catch (e) {
            console.warn(e);
        }
        return response;
    }
}

