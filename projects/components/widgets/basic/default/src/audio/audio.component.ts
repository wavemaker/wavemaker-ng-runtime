import { Component, Injector } from '@angular/core';

import { DISPLAY_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './audio.props';


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
    public autoplay: boolean;
    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
    }
}
