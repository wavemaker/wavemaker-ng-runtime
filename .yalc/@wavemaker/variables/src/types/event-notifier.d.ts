export declare class DefaultEventNotifier implements EventNotifier {
    private listeners;
    notify(event: string, args: any[]): void;
    subscribe(event: string, fn: Function): () => void;
}
export interface EventNotifier {
    notify: (event: string, args: any[]) => void;
    subscribe: (event: string, fn: Function) => Function;
}
