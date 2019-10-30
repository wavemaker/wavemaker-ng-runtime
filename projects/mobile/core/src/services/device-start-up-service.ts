export interface IDeviceStartUpService {
    start: () => Promise<any>;
    getServiceName: () => string;
}
