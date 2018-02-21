import { Injectable } from '@angular/core';

const noop = () => {};

@Injectable()
export class App {
    onAppVariablesReady = noop;
    onSessionTimeout = noop;
    onPageReady = noop;
    onServiceError =  noop;
}