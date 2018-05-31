import { SwipeAnimation } from '@swipey';

import { AnimationType, LeftPanelDirective } from './left-panel.directive';

export class LeftPanelAnimator extends SwipeAnimation {
    private _$animatedElements;
    private _expanded: boolean;
    private _leftPanelWidth: number;
    private _maxX: number;
    private _pageContainerWidth: number;
    private _width: number;

    constructor(private leftPanel: LeftPanelDirective) {
        super();
        this.init(this.leftPanel.$ele, this.leftPanel.isGesturesEnabled());
    }

    public bindEvents(): string[] {
        return this.leftPanel.gestures === 'off' ? [] : undefined;
    }

    public bounds(): {} {
        let offset = 0;
        if (!this._width) {
            this._pageContainerWidth = this.leftPanel.$page.width();
            this._leftPanelWidth = this.leftPanel.$ele.width();
            this._maxX = this._leftPanelWidth / this._pageContainerWidth * 100;
            this._width = this.leftPanel.animation === AnimationType.SLIDE_IN ? this._pageContainerWidth : this._leftPanelWidth;
        }
        this._expanded = this.leftPanel.expanded;

        if (this._expanded) {
            return {
                'center': this._leftPanelWidth,
                'lower': -(this._leftPanelWidth - offset)
            };
        }
        if (this.leftPanel.isTabletApplicationType) {
            offset = 53.32;
        }
        return {
            'center': 0,
            'upper': this._leftPanelWidth - offset
        };
    }

    public context() {
        return {
            'w': this._width,
            'pageW': this._pageContainerWidth,
            'leftW': this._leftPanelWidth,
            'maxX': this._maxX,
            'limit': (min: number, v: number, max: number) => {
                if (v < min) {
                    return min;
                }
                if (v > max) {
                    return max;
                }
                return v;
            }
        };
    }

    public animation() {
        this._$animatedElements = this.leftPanel.$ele;
        if (this.leftPanel.animation === AnimationType.SLIDE_IN) {
            this._$animatedElements = this._$animatedElements.add(this.leftPanel.$page);
            if (this.leftPanel.isTabletApplicationType) {
                return [
                    {
                        'target': this.leftPanel.$ele,
                        'css': {
                            'transform': 'translate3d(${{ limit(-100, -($d * 100 / leftW), 0) + \'%\' }}, 0, 0)'
                        }
                    },
                    {
                        'target': this.leftPanel.$page,
                        'css': {
                            'transform': 'translate3d(${{ (($d) * 100 / pageW) + \'%\' }}, 0, 0)',
                            'width': '${{ (pageW - $d) + \'px\' }}',
                            'z-index': 101
                        }
                    }
                ];
            }
            return [
                {
                    'target': this.leftPanel.$ele,
                    'css': {
                        'transform': 'translate3d(-100%, 0, 0)',
                        'opacity': 1,
                        'z-index': 101
                    }
                },
                {
                    'target': this.leftPanel.$page,
                    'css': {
                        'transform': 'translate3d(${{ limit( 0, ((($D + $d) * 100 / w)), maxX ) + \'%\' }}, 0, 0)',
                        'opacity': 1,
                        'z-index': 101
                    }
                }];
        } else {
            return {
                'transform': 'translate3d(${{ limit( -100, ((($D + $d) * 100 / w) - 100), 0 ) + \'%\'}}, 0, 0)',
                'opacity': 1,
                'z-index': 101
            };
        }
    }

    public onLower(): void {
        this._expanded = false;
        this.leftPanel.collapse();
        this.resetTransition();
    }

    public onUpper(): void {
        this._expanded = true;
        this.leftPanel.expand();
        this.resetTransition();
    }

    private resetTransition() {
        if (this._$animatedElements) {
            /*
             * This timeout is for preventing UI flicker at the end of animation.
             */
            setTimeout(() => {
                this._$animatedElements.css({
                    'transform': '',
                    'opacity': '',
                    'z-index': '',
                    'width': ''
                });
            }, 100);
        }
    }
}