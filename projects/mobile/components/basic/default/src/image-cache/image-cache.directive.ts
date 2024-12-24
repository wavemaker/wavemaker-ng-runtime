import { Directive, DoCheck, Inject, Input, Self } from '@angular/core';

import { File } from '@awesome-cordova-plugins/file/ngx';

import { WidgetRef } from '@wm/components/base';
import { hasCordova, noop, transformFileURI } from '@wm/core';
import { DeviceFileCacheService } from '@wm/mobile/core';
import {isString} from "lodash-es";

const DEFAULT_IMAGE =  'resources/images/imagelists/default-image.png';

@Directive({
    selector: '[wmImageCache]',
    standalone: false
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
        if (isString(this.componentInstance.imgSource)
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
