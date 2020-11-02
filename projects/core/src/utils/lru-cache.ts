
declare const _;

interface CachedData<T> {
    instance: T;
    lastAccessedTime: number;
}

export class LRUCache<T> {
    private cache = new Map<string, CachedData<T>>();
    private evictQueue: [string] = [''];

    constructor(
        private maxSize = 100,
        private maxAge = 60,
        private onEvict?: ((key: string, value: T) => any)) {
            this.evictQueue.shift();
            if(this.maxAge > 0) {
                if (this.maxAge <= 30) {
                    console.warn(`Cache age ${this.maxAge}s is very less. Keep it atleast 30s.`);
                }
                this.maxAge = this.maxAge * 1000;
                setInterval(() => {
                    const max = Date.now() - this.maxAge;
                    const expiredData = this.evictQueue.filter(k => {
                        return this.cache.get(k).lastAccessedTime <= max;
                    });
                    this.evict(expiredData.length);
                }, this.maxAge);
            }
    }

    private addToEvictQueue(key: string) {
        const index = this.evictQueue.findIndex(k => (k === key));
        if (index >= 0) {
            this.evictQueue.splice(index, 1);
        }
        this.evictQueue.push(key);
    }

    private evict(count = 1): void {
        for (let i = 0; i < count; i++) {
            this.delete(this.evictQueue[0]);
        }
    }

    public set(key: string, dataToCache: T): void {
        const cachedData = {
            instance: dataToCache,
            lastAccessedTime: Date.now()
        };
        this.cache.set(key, cachedData);
        this.addToEvictQueue(key);
        this.evict(this.evictQueue.length - this.maxSize);
    }

    public get(key: string): T {
        const cachedData = this.cache.get(key);
        if (cachedData) {
            cachedData.lastAccessedTime = Date.now();
            this.addToEvictQueue(key);
            return cachedData.instance;
        }
        return null;
    }

    public delete(key: string) {
        if(key && this.cache.has(key)) {
            const cachedData = this.cache.get(key);
            this.cache.delete(key);
            this.onEvict && this.onEvict(key, cachedData.instance);
            const index = this.evictQueue.findIndex(k => (k === key));
            if (index >= 0) {
                this.evictQueue.splice(index, 1);
            }
        }
    }

    public has(key: string): boolean {
        return this.cache.has(key);
    }

    public size(): number {
        return this.evictQueue.length;
    }

    public clear() {
        this.evict(this.evictQueue.length);
    }
}
