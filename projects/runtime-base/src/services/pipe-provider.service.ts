import { Compiler, Injectable, Injector } from '@angular/core';
import { PipeUtilProvider } from '@wm/components/base/utils/pipe-provider-util';
// import { PipeUtilProvider } from '@wm/runtime/base';

// import {PipeUtilProvider} from '@wm/core';


@Injectable({
    providedIn: 'root'
})
export class PipeProvider {
    _pipeMeta;

    _pipeData;
    _pipeUtil
    // setPipeMeta(){
    //     this._pipeMeta = new Map();
    //     this._pipeData.forEach(v => {
    //         this._pipeMeta.set(v.name, v);
    //     });
    // }

    unknownPipe(name) {
        throw Error(`The pipe '${name}' could not be found`);
    }



    constructor(private compiler: Compiler, private injector: Injector) {
        this._pipeUtil = new PipeUtilProvider();
        this._pipeMeta =  this._pipeUtil.getPipeMeta();
    }

    meta(name) {
        const meta = this._pipeMeta.get(name);
        if (!meta) {
            this.unknownPipe(name);
        }
        return meta;
    }

    getPipeNameVsIsPureMap() {
        // const _map = new Map();
        // this._pipeMeta.forEach((v, k) => {
        //     _map.set(k, v.pure);
        // });
        // return _map;
      return  this._pipeUtil.getPipeNameVsIsPureMap();
    }

    resolveDep(dep) {
        return this.injector.get(dep.token.identifier.reference);
    }

    getInstance(name) {
        const {
            type: { reference: ref, diDeps: deps }
        } = this.meta(name);
        if (!ref) {
            this.unknownPipe(name);
        }

        if (!deps.length) {
            return new ref();
        } else {
            const args = [];
            for (const dep of deps) {
                args.push(dep);
            }
            return new ref(...args);
        }
    }
}
