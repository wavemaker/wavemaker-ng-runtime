import { Directive, DoCheck, Inject, Input, Self } from '@angular/core';

import { File } from '@ionic-native/file';

import { WidgetRef } from '@wm/components/base';
import { hasCordova, isSpotcues, noop } from '@wm/core';
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
        if (this.componentInstance.imgSource) {
            if (isSpotcues && this.componentInstance.imgSource.startsWith
                && this.componentInstance.imgSource.startsWith('file')
                && this._lastUrl !== this.componentInstance.imgSource) {

                this._lastUrl = this.componentInstance.imgSource;
                const lastSlash = this.componentInstance.imgSource.lastIndexOf('/');
                const path = this.componentInstance.imgSource.substring(0, lastSlash);
                const file = this.componentInstance.imgSource.substring(lastSlash+1);
                this.file.readAsDataURL(path, file).then((url) => {
                    this.componentInstance.imgSource = url;
                });
            } else if (this._isEnabled && this.componentInstance.imgSource.startsWith('http')) {
                if (this._lastUrl !== this.componentInstance.imgSource) {
                    this._lastUrl = this.componentInstance.imgSource;
                    this.componentInstance.imgSource = DEFAULT_IMAGE;
                    this.getLocalPath(this._lastUrl).then((localPath) => {
                        this._cacheUrl = localPath;
                        this.componentInstance.imgSource = this._cacheUrl;
                    });
                } else if (this._cacheUrl) {
                    this.componentInstance.imgSource = this._cacheUrl;
                }
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
