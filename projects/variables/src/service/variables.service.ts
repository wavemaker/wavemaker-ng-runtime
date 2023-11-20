import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import {
    $watch,
    $parseEvent,
    AbstractDialogService,
    AbstractHttpService,
    AbstractNavigationService,
    AbstractToasterService, processFilterExpBindNode, $invokeWatchers, getClonedObject
} from '@wm/core';
import { OAuthService } from '@wm/oAuth';
import { SecurityService } from '@wm/security';

import { VariableFactory } from '../factory/variable.factory';
import { wmSetDependency, BaseAction, getTarget, setValueToNode, getTargetNodeKey, internalBoundNodeMap } from '@wavemaker/variables';
import {setDependency, simulateFileDownload} from '../util/variable/variables.utils';
import { MetadataService } from './metadata-service/metadata.service';
import { VARIABLE_CONSTANTS } from '../constants/variables.constants';
import {appManager} from '../util/variable/variables.utils';
import { DateFormatter } from '@wavemaker/variables';

export class Formatter implements DateFormatter {
    format(value, format) {
        return  appManager.getPipe('date').transform(value, format);
    }
}

declare const _;

@Injectable()
export class VariablesService {

    constructor(
        private httpService: AbstractHttpService,
        private metadataService: MetadataService,
        private navigationService: AbstractNavigationService,
        private routerService: Router,
        private toasterService: AbstractToasterService,
        private oAuthService: OAuthService,
        private securityService: SecurityService,
        private dialogService: AbstractDialogService
    ) {
        // set external dependencies, to be used across variable classes, managers and utils
        setDependency('http', this.httpService);
        setDependency('metadata', this.metadataService);
        setDependency('navigationService', this.navigationService);
        setDependency('router', this.routerService);
        setDependency('toaster', this.toasterService);
        setDependency('oAuth', this.oAuthService);
        setDependency('security', this.securityService);
        setDependency('dialog', this.dialogService);
        wmSetDependency('oAuth', this.oAuthService);
        wmSetDependency('security', this.securityService);
        wmSetDependency('metadata', this.metadataService);
        wmSetDependency('http', this.httpService);
    }

    /**
     * loop through a collection of variables/actions
     * trigger cancel on each (of exists)
     * @param collection
     */
    bulkCancel(collection) {
        Object.keys(collection).forEach(name => {
            const variable = collection[name];
            if (_.isFunction(variable.cancel)) {
                variable.cancel();
            }
        });
    }

    /**
     * loops over the variable/actions collection and trigger invoke on it if startUpdate on it is true
     * @param collection
     */
    triggerStartUpdate(collection) {
        return Promise.all(
            Object.keys(collection)
                .map(name => collection[name])
                .filter( variable => variable?.startUpdate && variable.invoke)
                .map(variable => variable.invoke())
            );
    }

    processBindExp(d: any, scope: any, variable) {
        const root = getTarget(variable),
            targetNodeKey = getTargetNodeKey(d.target),
            runMode = true;
        let v = _.isArray(d.value) ? d.value[0] : d.value;
        if (v) {
            if (v.startsWith && v.startsWith('bind:')) {
                const watchExpression = $watch(v.replace('bind:', ''), scope, {}, variable.invokeOnParamChange.bind(variable, d), undefined, undefined, d, () => variable.isMuted);
                v = scope.registerDestroyListener ? scope.registerDestroyListener(watchExpression) : watchExpression;
            } else if (!_.isUndefined(d.value)) {
                setValueToNode(d.target, d, root, variable, d.value, true);
                if (runMode && root !== targetNodeKey) {
                    if (!internalBoundNodeMap.has(variable)) {
                        internalBoundNodeMap.set(variable, {});
                    }
                    _.set(internalBoundNodeMap.get(variable), [ variable.name, root, d.target ], d.value);
                }
            }
        }
        return {
            name: d.target,
            value: v
        };
    }

    processBinding(variable: any, context: any, bindSource?: string, bindTarget?: string) {
        bindSource = bindSource || 'dataBinding';
        bindTarget = bindTarget || 'dataBinding';

        const bindMap = variable[bindSource];
        variable[bindSource] = {};
        variable['_bind' + bindSource] = bindMap;
        if (!bindMap || !_.isArray(bindMap)) {
            return;
        }
        bindMap.forEach( (node) => {
            /* for static variable change the binding with target 'dataBinding' to 'dataSet', as the results have to reflect directly in the dataSet */
            if (variable.category === 'wm.Variable' && node.target === 'dataBinding') {
                node.target = 'dataSet';
            }
            this.processBindExp(node, context, variable);
        });
    }

    isVariableSeperated(variablesJson, variableName) {
        return variablesJson[variableName].category === 'wm.Variable' || variablesJson[variableName].category === 'wm.ServiceVariable' ||
            variablesJson[variableName].category === 'wm.LiveVariable' || variablesJson[variableName].category === 'wm.CrudVariable'
    }

    getBindSourceTarget(variable) {
        if (variable.category === 'wm.LiveVariable') {
            return variable.operation === 'read' ? 'filterFields' : 'inputFields';
        } else if (variable.category === 'wm.ModelVariable') {
            return 'dataSet';
        } else {
            return 'dataBinding';
        }
    }

    /**
     * Takes the raw variables and actions json as input
     * Initialize the variable and action instances through the factory
     * collect the variables and actions in separate maps and return the collection
     * @param {string} page
     * @param variablesJson
     * @param scope
     * @returns {Variables , Actions}
     */
    register(page: string, variablesJson: any, scope: any) {
        const variableInstances = {
            Variables: {},
            Actions: {},
            callback: this.triggerStartUpdate
        };
        let varInstance;

        for (const variableName in variablesJson) {
            const params: any = {};
            varInstance = VariableFactory.create(variablesJson[variableName], scope);
            varInstance.init();
           if (this.isVariableSeperated(variablesJson, variableName)) {
               this.processBinding(varInstance, scope, 'dataBinding', this.getBindSourceTarget(varInstance));
               varInstance.httpService = this.httpService;
               varInstance.dateFormatter = new Formatter();
               varInstance.subscribe('afterInvoke', () => $invokeWatchers(true));
               if (varInstance.category === 'wm.LiveVariable' && varInstance.operation === 'read') {
                   processFilterExpBindNode(varInstance._context, varInstance.filterExpressions, varInstance);
               }
               if (varInstance.category === 'wm.CrudVariable' || varInstance.category === 'wm.ServiceVariable') {
                   varInstance.simulateFileDownload = simulateFileDownload;
               }

           }

           if (this.isVariableSeperated(variablesJson, variableName) || variablesJson[variableName].category === 'wm.TimerVariable') {
               for (const e in VARIABLE_CONSTANTS.EVENT) {
                   if (varInstance[VARIABLE_CONSTANTS.EVENT[e]]) {
                       varInstance[VARIABLE_CONSTANTS.EVENT[e]] = $parseEvent(varInstance[VARIABLE_CONSTANTS.EVENT[e]]);
                   }
               }
           }


            // if action type, put it in Actions namespace
            if (varInstance instanceof BaseAction) {
                variableInstances.Actions[variableName] = varInstance;
            } else {
                variableInstances.Variables[variableName] = varInstance;
            }
        }

        // if the context has onDestroy listener, subscribe the event and trigger cancel on all varibales
        if (scope.registerDestroyListener) {
            scope.registerDestroyListener(() => {
                this.bulkCancel(variableInstances.Variables);
                this.bulkCancel(variableInstances.Actions);
            });
        }

        return variableInstances;
    }

    destroy() {
    }

    registerDependency(name, ref) {
        setDependency(name, ref);
        wmSetDependency(name, ref);
    }
}
