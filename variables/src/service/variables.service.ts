import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AbstractHttpService, AbstractDialogService, AbstractToasterService } from '@wm/core';
import { OAuthService } from '@wm/oAuth';
import { SecurityService } from '@wm/security';

import { VariableFactory } from '../factory/variable.factory';
import { BaseAction } from '../model/base-action';
import { setDependency } from '../util/variable/variables.utils';
import { MetadataService } from './metadata-service/metadata.service';

declare const _;

@Injectable()
export class VariablesService {

    constructor(
        private httpService: AbstractHttpService,
        private metadataService: MetadataService,
        private routerService: Router,
        private toasterService: AbstractToasterService,
        private oAuthService: OAuthService,
        private securityService: SecurityService,
        private dialogService: AbstractDialogService
    ) {
        // set external dependencies, to be used across variable classes, managers and utils
        setDependency('http', this.httpService);
        setDependency('metadata', this.metadataService);
        setDependency('router', this.routerService);
        setDependency('toaster', this.toasterService);
        setDependency('oAuth', this.oAuthService);
        setDependency('security', this.securityService);
        setDependency('dialog', this.dialogService);
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
        Object.keys(collection).forEach(name => {
            const variable = collection[name];
            if (variable.startUpdate) {
                variable.invoke();
            }
        });
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
            varInstance = VariableFactory.create(variablesJson[variableName], scope);
            varInstance.init();
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
    }
}
