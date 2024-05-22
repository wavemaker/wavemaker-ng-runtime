import { NgZone } from '@angular/core';
import 'libraries/scripts/swipey/swipey.jquery.plugin.js';

import { SwipeAnimation } from '@swipey';

import { CarouselDirective } from './carousel.directive';

declare const $;
declare const _;

export class CarouselAnimator extends SwipeAnimation {

    private _$el;
    private _activeIndex = 0;
    private _animationPaused = false;
    private _indicators;
    private _items;
    private _intervalId;
    private _pauseCaroselTill = 0;
    private _swiping;
    private _width;
    private _oldIndex = 0;

    public constructor(private carousel: CarouselDirective, private interval: number, private ngZone: NgZone) {
        super();
        const self = this;
        this._$el = $(this.carousel.getNativeElement()).find('>.carousel');
        this.init(this._$el.find('>.carousel-inner'));
        this._items = this._$el.find('>.carousel-inner >.carousel-item');
        this._indicators = this._$el.find('>.carousel-indicators');
        this._indicators.find('li').each(function (i) {
            $(this).on('click', () => {
                self._activeIndex = i;
                self.setActiveItem();
                // WMS-17583: Triggering onChange event
                self.carousel.onChangeCB(self._activeIndex, self._oldIndex);
                self._oldIndex = self._activeIndex;
            });
        });
        this._$el.find('>.left.carousel-control').on('click', () => {
            // WMS-22278, If a swipe is already in process do not process other events
            if (this._swiping) {
                return;
            }
            this._pauseCaroselTill = Date.now() + this.interval;
            this.goToUpper();
        });
        this._$el.find('>.right.carousel-control').on('click', () => {
            // WMS-22278, If a swipe is already in process do not process other events
            if (this._swiping) {
                return;
            }
            this._pauseCaroselTill = Date.now() + this.interval;
            this.goToLower();
        });
        this.setActiveItem();
        if (this.interval) {
            this.start();
        }
        this._$el.find('>.left.carousel-control').append('<span class="sr-only">Previous</span>');
    }

    public bounds() {
        this._width = this._items.width();
        this._swiping = true;
        return {
            'lower': -this._width,
            'center': 0,
            'upper': this._width
        };
    }

    public context() {
        return {
            'w': this._width
        };
    }


    public animation() {
        return [{
            'target': this.getTarget.bind(this),
            'css': {
                'transform': 'translate3d(${{ (($D + $d) / w) * 100 + \'%\'}}, 0, 0)',
                '-webkit-transform': 'translate3d(${{ (($D + $d) / w) * 100 + \'%\'}}, 0, 0)'
            }
        }];
    }

    public onUpper() {
        this.resetTransition();
        this._activeIndex -= 1;
        this.setActiveItem();
        this._swiping = false;
    }

    public onLower() {
        this.resetTransition();
        this._activeIndex += 1;
        this.setActiveItem();
        this._swiping = false;
    }

    public onAnimation() {
        const newIndex = (this._items.length + this._activeIndex) % this._items.length;
        this.carousel.onChangeCB(newIndex, this._oldIndex);
        this._oldIndex = newIndex;
        const activeElementIndex = _.findIndex(this._items, this._$el.find('>.carousel-inner >.carousel-item.active')[0]);
        this._$el.find('>.left.carousel-control').attr('aria-label', (activeElementIndex === 0 ? this._items.length : activeElementIndex) + ' of ' + this._items.length);
        this._$el.find('>.right.carousel-control').attr('aria-label', (activeElementIndex === this._items.length - 1 ? 1 : activeElementIndex + 2) + ' of ' + this._items.length);
    }

    public start() {
        this.ngZone.runOutsideAngular(() => {
            this._intervalId = setInterval(() => {
                if (!this._swiping && this._pauseCaroselTill < Date.now()) {
                    this.goToLower(600);
                }
            }, this.interval);
        });
    }

    public pause() {
        this._animationPaused = true;
        if (!this._intervalId) {
            this.start();
        }
    }

    public resume() {
        this._animationPaused = false;
    }

    public stop() {
        if (this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = 0;
        }
    }

    public threshold() {
        return 5;
    }

    // Returns multiple elements as single jQuery element.
    private getTarget() {
        const noOfItems = this._items.length,
            activeItem = this._items.eq((noOfItems + this._activeIndex) % noOfItems),
            leftItem = this._items.eq((noOfItems + this._activeIndex - 1) % noOfItems),
            rightItem = this._items.eq((noOfItems + this._activeIndex + 1) % noOfItems);
        return activeItem.add(rightItem).add(leftItem);
    }

    private resetTransition() {
        this.getTarget().css({
            '-webkit-transition': 'none',
            '-webkit-transform': '',
            'transition': 'none',
            'transform': ''
        });
    }

    // Sets active item, leftItem, rightItem by removing / adding respective classes.
    private setActiveItem() {
        const items = this._items,
            left = this._activeIndex - 1,
            right = this._activeIndex + 1;
        // if there is only one carousel-item then there won't be any right or left-item.
        if (items.length === 1) {
            items.eq(0).removeClass('left-item right-item');
            return;
        }

        this._indicators.find('>.active').removeClass('active');
        this._indicators.find('> li').eq((items.length + this._activeIndex) % items.length).addClass('active');


        items.filter('.active').removeClass('active');
        items.addClass('left-item');
        items.eq((items.length + left) % items.length).addClass('left-item').removeClass('right-item');
        items.eq((items.length + this._activeIndex) % items.length).removeClass('left-item right-item').addClass('active');
        items.eq((items.length + right) % items.length).addClass('right-item').removeClass('left-item');
    }
}
