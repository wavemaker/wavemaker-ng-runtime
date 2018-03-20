import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { StaticVariable } from './static-variable/static-variable';
import { ServiceVariable } from './service-variable/service-variable';
import { LiveVariable } from './live-variable/live-variable';
import { NavigationVariable } from './navigation-variable/navigation-variable';
import { NotificationVariable } from './notification-variable/notification-variable';

import { $watch } from '@utils/watcher';
import { HttpService } from './../../http-service/http.service';
import { setDependency, processBinding } from './../utils/variables.utils';
import { MetadataService } from './metadata-service/metadata.service';

@Injectable()
export class VariablesService {

    variablesMap = {};
    metadataMap = {};

    constructor(private httpService: HttpService,
                private metadataService: MetadataService,
                private routerService: Router) {
        // set external dependencies
        setDependency('http', this.httpService);
        setDependency('metadata', this.metadataService);
        setDependency('router', this.routerService);
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
                    processBinding(variableInstance, scope, 'dataBinding', 'dataSet');
                    break;
                case 'wm.ServiceVariable':
                    variableInstance = new ServiceVariable(variable, scope);
                    variableInstance.scope = scope;
                    processBinding(variableInstance, scope);
                    if (variableInstance.startUpdate) {
                        this.invokeVariable(variableInstance, scope);
                    }
                    break;
                case 'wm.LiveVariable':
                    variableInstance = new LiveVariable(variable);
                    variableInstance.scope = scope;
                    processBinding(variableInstance, scope);
                    if (variableInstance.startUpdate) {
                        this.invokeVariable(variableInstance, scope);
                    }
                    break;
                case 'wm.NavigationVariable':
                    actionInstance = new NavigationVariable(variable);
                    processBinding(actionInstance, scope, 'dataSet', 'dataSet');
                    processBinding(actionInstance, scope, 'dataBinding', 'dataBinding');
                    break;
                case 'wm.NotificationVariable':
                    actionInstance = new NotificationVariable(variable);
                    processBinding(actionInstance, scope);
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
