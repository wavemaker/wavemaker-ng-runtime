import { Component, forwardRef, Injector } from '@angular/core';

import { styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './audio.props';


const DEFAULT_CLS = 'app-audio';
const WIDGET_CONFIG = {widgetType: 'wm-audio', hostClass: DEFAULT_CLS};

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
