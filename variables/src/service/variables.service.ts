import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '@wm/http';
import { setDependency } from '../util/variable/variables.utils';
import { MetadataService } from './metadata-service/metadata.service';
import { ToastrService } from 'ngx-toastr';
import { VariableFactory } from '../factory/variable.factory';
import { OAuthService } from '@wm/oAuth';
import { BaseAction } from '../model/base-action';
import { SecurityService } from '@wm/security';
import { DialogService } from '@wm/components';

@Injectable()
export class VariablesService {

    variablesMap = {};
    metadataMap = {};

    constructor(private httpService: HttpService,
                private metadataService: MetadataService,
                private routerService: Router,
                private toasterService: ToastrService,
                private oAuthService: OAuthService,
                private securityService: SecurityService,
                private dialogService: DialogService) {
        // set external dependencies
        setDependency('http', this.httpService);
        setDependency('metadata', this.metadataService);
        setDependency('router', this.routerService);
        setDependency('toaster', this.toasterService);
        setDependency('oAuth', this.oAuthService);
        setDependency('security', this.securityService);
        setDependency('dialog', this.dialogService);
    }

    register(page: string, variablesJson: any, scope: any) {
        const variableInstances = {
            Variables: {},
            Actions: {}
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

        return variableInstances;
    }

    destroy() {
    }

}
