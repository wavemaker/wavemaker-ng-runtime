
// import initSwipeyJqueryPlugin from './swipey.jquery.plugin';

// initSwipeyJqueryPlugin();

declare const  $;

export abstract class SwipeAnimation {

    private _$ele;
    private _isGesturesEnabled = true;

    public abstract animation(): [{}] | {};
    public bindEvents() {
        if (window['PointerEvent']) {
            return ['pointer'];
        }
        return ['touch'];
    }
    public bounds(e?, $d?: number) { return {}; }
    public context() { return {}; }
    public direction() { return $.fn.swipey.DIRECTIONS.HORIZONTAL; }
    public setGesturesEnabled(enabled: boolean) { this._isGesturesEnabled = enabled; }
    public isGesturesEnabled() { return this._isGesturesEnabled; }
    public goToLower(time?) {
        this._$ele.swipeAnimation('gotoLower', time);
    }
    public goToUpper(time?) {
        this._$ele.swipeAnimation('gotoUpper', time);
    }
    public onAnimation(e, distanceMoved: number) {}
    public onUpper(event?) {}
    public onLower(event?) {}
    public threshold() { return 30; }

    public constructor() {

    }

    public init($ele, $swipeTargetEle?) {
        this._$ele = $ele;
        $ele.swipeAnimation({
            animation: this.animation(),
            target: $swipeTargetEle,
            bounds: this.bounds.bind(this),
            bindEvents: this.bindEvents(),
            context: this.context.bind(this),
            direction: this.direction(),
            enableGestures: this.isGesturesEnabled.bind(this),
            onAnimation: this.onAnimation.bind(this),
            onLower: this.onLower.bind(this),
            onUpper: this.onUpper.bind(this),
            threshold: this.threshold(),
            disableMouse: true
        });
    }
}
