import { Pipe, PipeTransform } from '@angular/core';

import { getImageUrl } from '../utils/widget-utils';

@Pipe({
    name: 'image'
})
export class ImagePipe implements PipeTransform {
    transform(url: string, encode?: boolean, defaultImageUrl?: string) {
        return getImageUrl(url, encode, defaultImageUrl);
    }
}
