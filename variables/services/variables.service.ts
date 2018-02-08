import { Injectable } from '@angular/core';
import {StaticVariable} from './staticvariable/staticvariable';
import {ServiceVariable} from './servicevariable/servicevariable';
import {LiveVariable} from './livevariable/livevariable';
import {NavigationVariable} from './navigationvariable/navigationvariable';
import {ServiceVariableService} from './servicevariable/servicevariable.service';
import {NavigationVariableService} from './navigationvariable/navigationvariable.service';
import {NotificationVariable} from './notificationvariable/notificationvariable';
import { $watch } from '@utils/watcher';

@Injectable()
export class VariablesService {

    variablesMap = {};
    metadataMap = {};
    constructor(private serviceVariableService: ServiceVariableService, private navigationVariableService: NavigationVariableService) {
    }

    processBinding(variable: any, $scope: any) {
        let dataBinding = variable.dataBinding;
        variable.dataBinding = {};
        for (let bindingObj of dataBinding) {
            let target = bindingObj.target;
            let value = bindingObj.value;
            if (value.startsWith('bind:')) {
                let bindExpr = value.replace('bind:', '');
                $watch(bindExpr, $scope, {}, function(nv, ov) {
                    variable.dataBinding[target] = nv;
                });
            } else {
                variable.dataBinding[target] = value;
            }
        }
    }

    instantiateVariables(variables: any, scope: any) {
        // Variable instantiation for each class here.
        // Each variable is extended with its properties and methods.
        let instanceVariables = {},
            instanceActions = {};
        for (const variableName in variables) {
            const variable = variables[variableName];
            let variableInstance, actionInstance;
            switch (variable.category) {
                case 'wm.Variable':
                    variableInstance = new StaticVariable(variable);
                    break;
                case 'wm.ServiceVariable':
                    variableInstance = new ServiceVariable(variable, this.serviceVariableService, scope);
                    this.processBinding(variableInstance, scope);
                    break;
                case 'wm.LiveVariable':
                    variableInstance = new LiveVariable(variable);
                    break;
                case 'wm.NavigationVariable':
                    actionInstance = new NavigationVariable(variable, this.navigationVariableService);
                    this.processBinding(actionInstance, scope);
                    break;
                case 'wm.NotificationVariable':
                    actionInstance = new NotificationVariable(variable);
                    this.processBinding(actionInstance, scope);
                    break;
            }

            if (variableInstance) {
                instanceVariables[variableName] = variableInstance;
            } else {
                instanceActions[variableName] = actionInstance;
            }
        }
        return {
            Variables: instanceVariables,
            Actions: instanceActions
        };
    }

    register(page: string, variables: any, scope: any) {
        this.variablesMap[page] = this.instantiateVariables(variables, scope);
        return this.variablesMap[page];
    }

    destroy() {
    }

}
