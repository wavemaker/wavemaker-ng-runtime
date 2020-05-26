import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class CustomPipeManager {
    private customPipes: any = new Map();

    public setCustomPipe(key: string, value: any) {
        this.customPipes.set(key, value);
    }

    public getCustomPipe(key: string) {
        return this.customPipes.get(key);
    }

    public hasCustomPipe(key: string): boolean {
        return this.customPipes.has(key);
    }


}

