import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from './../../http-service/http.service';
import { setDependency, processBinding } from './../utils/variables.utils';
import { MetadataService } from './metadata-service/metadata.service';
import { ToastrService } from 'ngx-toastr';
import { VariableFactory } from './../factory/variable.factory';

@Injectable()
export class VariablesService {

    variablesMap = {};
    metadataMap = {};

    constructor(private httpService: HttpService,
                private metadataService: MetadataService,
                private routerService: Router,
                private toasterService: ToastrService) {
        // set external dependencies
        setDependency('http', this.httpService);
        setDependency('metadata', this.metadataService);
        setDependency('router', this.routerService);
        setDependency('toaster', this.toasterService);
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
            if (varInstance.isAction()) {
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
