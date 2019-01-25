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

@Component({
    selector: '[wmAudio]',
    templateUrl: './audio.component.html',
    providers: [
        provideAsWidgetRef(AudioComponent)
    ]
})
export class AudioComponent extends StylableComponent {
    static initializeProps = registerProps();

    public mp3format: string;
    public muted: boolean;
    public controls: boolean;
    public loop: boolean;
    public audiopreload: any;
    public audiosupportmessage: any;
    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
    }
}
