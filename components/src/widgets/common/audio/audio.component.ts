import { Component, forwardRef, Injector } from '@angular/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig, WidgetRef } from '../../framework/types';
import { DISPLAY_TYPE } from '../../framework/constants';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './audio.props';


const DEFAULT_CLS = 'app-audio';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-audio',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};

registerProps();

@Component({
    selector: '[wmAudio]',
    templateUrl: './audio.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => AudioComponent)}
    ]
})
export class AudioComponent extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
    }
}
