import { Component, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';
import { isNumber } from '@wm/core';

import { registerProps } from './segmented-control.props';
import { SegmentContentComponent } from './segment-content/segment-content.component';

registerProps();

const DEFAULT_CLS = 'app-segmented-control';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-segmented-control', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmSegmentedControl]',
    templateUrl: './segmented-control.component.html',
    providers: [
        provideAsWidgetRef(SegmentedControlComponent)
    ]
})
export class SegmentedControlComponent extends StylableComponent {

    public contents: SegmentContentComponent[] = [];
    public currentSelectedIndex = 0;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        this.showContent(0);
    }

    public addContent(content: SegmentContentComponent) {
        this.contents.push(content);
    }

    public goToNext() {
        this.showContent(this.currentSelectedIndex + 1);
    }

    public goToPrev() {
        this.showContent(this.currentSelectedIndex - 1);
    }

    public onPropertyChange(key, nv, ov?) {
        if (key === 'tabindex') {
            return;
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    public removeContent(content: SegmentContentComponent) {
        const index = this.contents.findIndex(c => {
            return c === content;
        });
        if (index >= 0) {
            this.contents.splice(index, 1);
            if (index < this.contents.length) {
                this.showContent(index);
            } else if (this.contents.length > 0) {
                this.showContent(0);
            }
        }
    }

    public showContent(content: number | SegmentContentComponent , $event?: any) {
        let index: number;
        if (isNumber(content)) {
            index = content as number;
        } else {
            index = this.contents.findIndex(c => {
                return c === content;
            });
        }
        if (index < 0 || index >= this.contents.length) {
            return;
        }
        if ($event) {
            $event.stopPropagation();
        }
        const eventData = {
                $old : this.currentSelectedIndex,
                $new : index
            },
            $segmentsCtr = this.$element.find('>.app-segments-container');

        this.currentSelectedIndex = index;
        this.invokeEventCallback('beforesegmentchange', eventData);
        $segmentsCtr.animate(
            { scrollLeft: index * $segmentsCtr.width()},
            { duration: 'fast' }
        );
        this.invokeEventCallback('segmentchange', eventData);
    }

}
