import { NgZone } from '@angular/core';

import { SwipeAnimation } from '@swipey';

import { CarouselDirective } from './carousel.directive';

declare const $;

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
            });
        });
        this._$el.find('>.left.carousel-control').on('click', () => {
            this._pauseCaroselTill = Date.now() + this.interval;
            this.goToUpper();
        });
        this._$el.find('>.right.carousel-control').on('click', () => {
            this._pauseCaroselTill = Date.now() + this.interval;
            this.goToLower();
        });
        this.setActiveItem();
        if (this.interval) {
            this.start();
        }
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
        this.carousel.invokeEventCallback('change', {newIndex: newIndex, oldIndex: this._oldIndex});
        this._oldIndex = newIndex;
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
