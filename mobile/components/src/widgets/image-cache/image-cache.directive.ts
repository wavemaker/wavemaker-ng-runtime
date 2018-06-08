import { Directive, DoCheck, Inject, Input, Self } from '@angular/core';

import { WidgetRef } from '@wm/components';
import { hasCordova, noop } from '@wm/core';
import { DeviceFileCacheService } from '@wm/mobile/core';

@Directive({
    selector: '[wmImageCache]'
})
export class ImageCacheDirective implements DoCheck {

    private _cacheUrl;
    private _isEnabled = false;
    private _lastUrl = '';

    constructor(
        @Self() @Inject(WidgetRef) private componentInstance,
        private deviceFileCacheService: DeviceFileCacheService
    ) {}

    public ngDoCheck() {
        if (this._isEnabled && this.componentInstance.imgSource) {
            if (this._lastUrl !== this.componentInstance.imgSource) {
                this._lastUrl = this.componentInstance.imgSource;
                this.getLocalPath(this._lastUrl).then((localPath) => {
                    this._cacheUrl = localPath;
                    this.componentInstance.imgSource = this._cacheUrl;
                });
            } else {
                this.componentInstance.imgSource = this._cacheUrl;
            }
        }
    }

    @Input()
    set wmImageCache(val: string) {
        this._isEnabled = (hasCordova() && val === 'true');
    }

    private getLocalPath(val: string) {
        if (hasCordova() && val && val.indexOf('{{') < 0  && val.startsWith('http')) {
            return this.deviceFileCacheService.getLocalPath(val, true, true)
                .catch(noop);
        }
        return Promise.resolve(val);
    }

}