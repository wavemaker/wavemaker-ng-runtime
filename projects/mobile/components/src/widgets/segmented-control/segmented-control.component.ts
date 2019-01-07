import { AfterViewInit, Component, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';
import { isNumber, setCSS, setCSSFromObj } from '@wm/core';

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
export class SegmentedControlComponent extends StylableComponent implements AfterViewInit {

    private _$container;

    public contents: SegmentContentComponent[] = [];
    public currentSelectedIndex = 0;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
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

    public ngAfterViewInit() {
        this._$container = this.$element.find('>.app-segments-container');
        const childEls = this._$container.find('>.list-inline >li');
        const maxWidth = `${this.contents.length * 100}%`;
        setCSSFromObj(this._$container[0], {
            maxWidth: maxWidth,
            width: maxWidth,
            'white-space': 'nowrap',
            transition: 'transform 0.2s linear'
        });
        const width = `${100 / this.contents.length}%`;
        for (const child of Array.from(childEls)) {
            setCSS(child as HTMLElement, 'width', width);
        }
        this.showContent(0, undefined, true);
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

    public showContent(content: number | SegmentContentComponent , $event?: any, defaultLoad?: boolean) {
        let index: number;
        let selectedContent: SegmentContentComponent;
        if (isNumber(content)) {
            index = content as number;
            if (this.contents.length) {
                selectedContent = this.contents[index];
            }
        } else {
            selectedContent = content as SegmentContentComponent;
            index = this.contents.findIndex(c => {
                return c === content;
            });
        }

        if (selectedContent) {
            selectedContent.loadContent(defaultLoad);
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
            };

        this.currentSelectedIndex = index;
        this.invokeEventCallback('beforesegmentchange', eventData);
        setCSS(this._$container[0], 'transform', `translate3d(${-1 *  index / this.contents.length * 100}%, 0, 0)`);
        this.invokeEventCallback('segmentchange', eventData);
    }
}
