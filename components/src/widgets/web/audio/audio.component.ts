import { Component, Injector } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

import { isString } from '@wm/utils';

import { styler } from '../../framework/styler';
import { IStylableComponent } from '../../framework/types';

import { BaseComponent } from '../base/base.component';
import { registerProps } from './audio.props';


const DEFAULT_CLS = 'app-audio';
const WIDGET_CONFIG = {widgetType: 'wm-audio', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmAudio]',
    templateUrl: './audio.component.html'
})
export class AudioComponent extends BaseComponent {

    mp3audioUrl: SafeResourceUrl = '';

    onPropertyChange(key, newVal, oldVal) {
        if (key === 'mp3format') {
            if (newVal && isString(newVal)) {
                this.mp3audioUrl = newVal;
            }
        }
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this as IStylableComponent);
    }
}
