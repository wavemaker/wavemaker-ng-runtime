import { Component, Inject, Injector, Optional } from '@angular/core';
import { DISPLAY_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler, WmComponentsModule } from '@wm/components/base';
import { registerProps } from './audio.props';
import { CommonModule } from '@angular/common';

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
    ],
    standalone: true,
    imports: [CommonModule, WmComponentsModule]
})
export class AudioComponent extends StylableComponent {
    static initializeProps = registerProps();

    public mp3format: string;
    public muted: boolean;
    public controls: boolean;
    public loop: boolean;
    public audiopreload;
    public audiosupportmessage;
    public autoplay: boolean;
    public hint: string;
    public arialabel: string;
    public tabindex: string;

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext) {
        super(inj, WIDGET_CONFIG, explicitContext);

        styler(this.nativeElement, this);
    }

    onPropertyChange(key, nv, ov) {
        if (key === 'tabindex') {
            return
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
