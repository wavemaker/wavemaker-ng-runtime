/**
 * Proxy Provider - Creates a JS proxy for the given object
 */
export class ProxyProvider {
    public static create(instance: any, proxyHandler: any) {
        const revocable = Proxy.revocable(this as any, proxyHandler);
        if (instance.registerDestroyListener) {
            instance.registerDestroyListener(() => revocable.revoke());
        }
        return revocable.proxy;
    }
}

