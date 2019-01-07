import { Component, Injector } from '@angular/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { DISPLAY_TYPE } from '../../framework/constants';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './audio.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';


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
        provideAsWidgetRef(AudioComponent)
    ]
})
export class AudioComponent extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
    }
}
