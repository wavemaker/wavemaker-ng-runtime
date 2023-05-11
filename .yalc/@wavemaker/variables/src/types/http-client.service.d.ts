export interface HttpClientService {
    send: (options: any, variable: any) => void;
    sendCallAsObservable?: (options: any) => void;
    getLocale?: () => void;
    sendCall: (options: any, variable: any) => void;
    cancel: (variable: any, $file?: any) => void;
    uploadFile: (url: any, data: any, variable: any, options?: any) => void;
}
