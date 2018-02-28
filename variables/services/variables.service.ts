import { Injectable } from '@angular/core';
import { StaticVariable } from './static-variable/static-variable';
import { ServiceVariable } from './service-variable/service-variable';
import { LiveVariable } from './live-variable/live-variable';
import { NavigationVariable } from './navigation-variable/navigation-variable';
import { ServiceVariableService } from './service-variable/service-variable.service';
import { NavigationVariableService } from './navigation-variable/navigation-variable.service';
import { NotificationVariable } from './notification-variable/notification-variable';
import { $watch } from '@utils/watcher';
// import { HttpService } from '@http-service/http.service';
import { HttpService } from './../../http-service/http.service';
// import { setDependency } from '@variables/utils/variables.utils';
import { setDependency } from './../utils/variables.utils';

@Injectable()
export class VariablesService {

    variablesMap = {};
    metadataMap = {};

    constructor(private serviceVariableService: ServiceVariableService, private navigationVariableService: NavigationVariableService, private httpService: HttpService) {
        // set external dependencies
        setDependency('http', this.httpService);
    }

    processBinding(variable: any, $scope: any) {
        const dataBinding = variable.dataBinding;
        variable.dataBinding = {};
        for (const bindingObj of dataBinding) {
            const target = bindingObj.target;
            const value = bindingObj.value;
            if (value.startsWith('bind:')) {
                const bindExpr = value.replace('bind:', '');
                $watch(bindExpr, $scope, {}, function (nv, ov) {
                    variable.dataBinding[target] = nv;
                });
            } else {
                variable.dataBinding[target] = value;
            }
        }
    }

    invokeVariable(variable: any, $scope: any) {
        variable.invoke();
    }

    instantiateVariables(variables: any, scope: any) {
        // Variable instantiation for each class here.
        // Each variable is extended with its properties and methods.
        const instanceVariables = {},
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
                    variableInstance.scope = scope;
                    this.processBinding(variableInstance, scope);
                    if (variableInstance.startUpdate) {
                        this.invokeVariable(variableInstance, scope);
                    }
                    break;
                case 'wm.LiveVariable':
                    variableInstance = new LiveVariable(variable);
                    variableInstance.scope = scope;
                    console.log('Live Variable Initialized', variableInstance);
                    if (variableInstance.startUpdate) {
                        this.invokeVariable(variableInstance, scope);
                    }
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
