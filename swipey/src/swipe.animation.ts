
declare const  $;

export abstract class SwipeAnimation {

    private _$ele;

    public abstract animation(): [{}] | {};
    public bindEvents() { return ['touch']; }
    public bounds() { return {}; }
    public context() { return {}; }
    public direction() { return $.fn.swipey.DIRECTIONS.HORIZONTAL; }
    public goToLower() {
        this._$ele.swipeAnimation('gotoLower');
    }
    public goToUpper() {
        this._$ele.swipeAnimation('gotoUpper');
    }
    public onAnimation() {}
    public onUpper() {}
    public onLower() {}
    public threshold() { return 30; }

    public constructor() {

    }

    public init($ele, gestures = true) {
        this._$ele = $ele;
        $ele.swipeAnimation({
            animation: this.animation(),
            bounds: this.bounds.bind(this),
            bindEvents: this.bindEvents(),
            context: this.context.bind(this),
            direction: this.direction(),
            onAnimation: this.onAnimation.bind(this),
            onLower: this.onLower.bind(this),
            onUpper: this.onUpper.bind(this),
            threshold: this.threshold()
        });
    }
}