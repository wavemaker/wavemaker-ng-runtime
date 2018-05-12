
declare const  $;

export abstract class SwipeAnimation {
    public abstract animation(): [{}] | {};

    public abstract bindEvents?(): string[];

    public abstract bounds?(): {};

    public abstract context?(): {};

    public direction(): string {
        return $.fn.swipey.DIRECTIONS.HORIZONTAL;
    }

    public abstract onUpper?(): void;

    public abstract onLower?(): void;

    public threshold?(): number {
        return 30;
    }

    public constructor() {

    }

    public init($ele, gestures: boolean) {
        const settings = {
            animation: this.animation()
        };
        if (this.bindEvents) {
            settings['bindEvents'] = this.bindEvents() || ['touch'];
        }
        if (this.bounds) {
            settings['bounds'] = this.bounds.bind(this);
        }
        if (this.context) {
            settings['context'] = this.context.bind(this);
        }
        if (this.direction) {
            settings['direction'] = this.direction();
        }
        if (this.onUpper) {
            settings['onUpper'] = this.onUpper.bind(this);
        }
        if (this.onLower) {
            settings['onLower'] = this.onLower.bind(this);
        }
        if (this.threshold) {
            settings['threshold'] = this.threshold();
        }
        $ele.swipeAnimation(settings);
    }
}