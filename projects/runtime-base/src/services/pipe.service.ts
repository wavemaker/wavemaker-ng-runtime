import { Injectable } from "@angular/core";
import { PipeProvider } from "./pipe-provider.service";
import { App, setPipeProvider } from "@wm/core";

@Injectable({ providedIn: 'root' })
export class PipeService {
    constructor(private pipeProvider: PipeProvider,
                private $app: App) {
                    // setting pipe provider, to be used for variables watcher in expression parser
        setPipeProvider(pipeProvider);
        if(this.$app.isApplicationType) {
            this.supportedPipes.push('custom');
        }
    }

    private supportedPipes = [ "toDate", "toCurrency", "prefix", "suffix", "numberToString", "stringToNumber", "timeFromNow", "trustAs", "sanitize"];

    public getPipe(name: string) {
        if(this.supportedPipes.includes(name)) {
            return this.pipeProvider.getInstance(name);
        } else {
            throw Error(`The pipe '${name}' could not be found`);
        }
    }
}
