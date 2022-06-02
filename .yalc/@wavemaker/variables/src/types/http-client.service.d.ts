export interface HttpClientService {
    send: (options: any, variable: any) => void;
    sendCallAsObservable?: (options: any) => void;
    getErrMessage?: (err: any) => void;
    sendCall: (options: any, variable: any) => void;
}
