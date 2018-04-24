import { Attribute, Directive, ElementRef, Inject } from '@angular/core';
import { addClass } from '@wm/core';

import { WidgetRef } from '../widgets/framework/types';
import { BaseComponent } from '../widgets/common/base/base.component';

@Directive({
    selector: '[showInDevice]'
})
export class ShowInDeviceDirective {

    constructor(
        elRef: ElementRef,
        @Attribute('showInDevice') showInDevice: string,
        @Inject(WidgetRef) widget: BaseComponent
    ) {
        const displayType = widget.getDisplayType();

        if (showInDevice) {
            showInDevice.split(',').forEach(deviceType => {
                addClass(elRef.nativeElement, `visible-${deviceType}-${displayType}`);
            });
        }
    }
}