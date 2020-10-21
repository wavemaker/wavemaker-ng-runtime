import { Directive, DoCheck, Inject, Input, Self } from '@angular/core';

import { File } from '@ionic-native/file';

import { WidgetRef } from '@wm/components/base';
import { hasCordova, isSpotcues, noop, transformFileURI } from '@wm/core';
import { DeviceFileCacheService } from '@wm/mobile/core';

const DEFAULT_IMAGE =  'resources/images/imagelists/default-image.png';

@Directive({
    selector: '[wmImageCache]'
})
export class ImageCacheDirective implements DoCheck {

    private _cacheUrl;
    private _isEnabled = false;
    private _lastUrl = '';

    constructor(
        @Self() @Inject(WidgetRef) private componentInstance,
        private deviceFileCacheService: DeviceFileCacheService,
        private file: File

    ) {}

    public ngDoCheck() {
        if (!isSpotcues && this.componentInstance.imgSource
            && this.componentInstance.imgSource.startsWith('http')) {
            if (this._lastUrl !== this.componentInstance.imgSource) {
                this._lastUrl = this.componentInstance.imgSource;
                this.componentInstance.imgSource = DEFAULT_IMAGE;
                this.getLocalPath(this._lastUrl).then((localPath) => {
                    this._cacheUrl = transformFileURI(localPath);
                    this.componentInstance.imgSource = this._cacheUrl;
                });
            } else if (this._cacheUrl) {
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
            return this.deviceFileCacheService.getLocalPath(val, true, true, !this._isEnabled)
                .catch(noop);
        }
        return Promise.resolve(val);
    }
}
