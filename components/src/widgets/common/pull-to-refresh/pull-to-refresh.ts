import { App, isIos, setCSS } from '@wm/core';
import { SwipeAnimation } from '@swipey';

declare const  $;

export class PullToRefresh extends SwipeAnimation {
    private infoContainer: JQuery<HTMLElement>;
    private runAnimation: boolean;
    private count: number = 0;
    private spinner: Spinner;
    public cancelSubscription: Function;

    constructor(private $el: JQuery<HTMLElement>, private app: App, private onPullToRefresh: () => void) {
        super();
        const template = '<div class="refresh-container"></div>';
        this.$el.prepend(template);
        this.infoContainer = this.$el.find('.refresh-container');

        if (isIos()) {
            this.infoContainer.addClass('ios-refresh-container');
        }

        this.init(this.$el);
    }

    public threshold() {
        return 10;
    }

    public direction() {
        return $.fn.swipey.DIRECTIONS.VERTICAL;
    }

    private subscribe() {
        // Subscribing for variable updates, wait till the response and stop the animation.
        this.cancelSubscription = this.app.subscribe('toggle-variable-state', (data) => {
            // data.active is true means the variable update has just started whereas false means update has ended.
            if (data.active) {
                this.count++;
                this.wait();
            } else {
                this.count--;
            }
            if (!this.count) {
                this.stopAnimation();
            }
        });
    }

    public bounds() {
        if (!this.spinner) {
            this.spinner = isIos() ? new IOSSpinner(this.infoContainer) : new AndroidSpinner(this.infoContainer);
            this.subscribe();
        }

        return {
            lower: 0,
            center: 0,
            upper: isIos() ? 0 : 150,
            strict: !isIos()
        };
    }

    public context(): Object {
        this.infoContainer.show();
        if (isIos()) {
            this.infoContainer.addClass('entry');
        }
        return {
            spin: $d => {
                this.spinner.setRotation($d * 2);
            }
        };
    }

    public animation() {
        if (isIos()) {
            return {
                css: {
                    transform: 'translate3d(0, ${{$D + $d}}px, 0)',
                    spin: '${{spin($d)}}'
                }
            };
        }
        return {
            target: this.infoContainer,
            css: {
                transform: 'translate3d(0, ${{$D + $d}}px, 0)',
                spin: '${{spin($d)}}',
                opacity: '${{min(($D + $d) / 100, 1)}}'
            }
        };
    }

    // Start the spinner animation and invokes the pulltorefresh event. Stops the animation after the wait time.
    public onAnimation() {
        this.spinner.start();
        if (this.onPullToRefresh) {
            this.onPullToRefresh();
        }

        setTimeout(() => {
            // if listenToAnimation is set, then wait for stopAnimation to be invoked. Otherwise call stopAnimation manually.
            if (this.runAnimation) {
                return;
            }
            this.stopAnimation();
        });
    }

    public stopAnimation() {
        setTimeout(() => {
            this.runAnimation = false;
            this.spinner.stop();
            this.infoContainer.hide();
            setCSS(this.infoContainer[0], 'transform', 'none');
            if (!isIos()) {
                setCSS(this.infoContainer[0], 'opacity', 0);
            }
            this.infoContainer.removeClass('entry');
        }, 800);
    }

    public wait() {
        this.runAnimation = true;
    }
}

// Interface for Spinner
interface Spinner {
    start();
    stop();
    setRotation(d: number);
}

// Android Spinner implementation
class AndroidSpinner implements Spinner {
    private options: Object;
    private initialized: any;
    private cx: number;
    private cy: number;
    private r: number;
    private path: any;
    private intervalId;
    private container: any;

    constructor(private $el: JQuery<HTMLElement>, options?: any) {
        this.options = options || {};
    }


    private polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number): any {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    private describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {

        const start = this.polarToCartesian(x, y, radius, endAngle);
        const end = this.polarToCartesian(x, y, radius, startAngle);

        const arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

        return [
            'M', start.x, start.y,
            'A', radius, radius, 0, arcSweep, 0, end.x, end.y,
            'L', end.x, end.y
        ].join(' ');
    }

    public init(): void {
        if (this.initialized) {
            return;
        }
        // append the svg to the element on which spinner has to be shown.
        const androidTemplate = $('<svg><path id="arc1"/></svg>');
        const container = $('<div class="android-spinner"></div>');
        container.append(androidTemplate);
        this.$el.append(container);
        this.cx = container.outerWidth() / 2;
        this.cy = container.outerHeight() / 2;
        this.r = this.cx * 0.6;
        this.path = container.find('path');
        this.initialized = true;
        this.container = container;
    }

    // sets rotation to the path
    public setRotation(deg) {
        this.init();
        this.path.attr('d', this.describeArc(this.cx, this.cy, this.r, 0, deg));
    }

    // animate the path to rotate continuously with some interval
    public start() {
        this.init();
        const self = this,
            totalTime = (this.options as any).time || 1800,
            degressToTraverse = 10;
        let i = 0;
        this.container.addClass('spin');
        this.intervalId = setInterval(() => {
            let deg;
            i = i + degressToTraverse;
            if (i > 720) {
                deg = i = 0;
            } else if (i > 360) {
                deg = 720 - i;
            } else {
                deg = i;
            }
            self.path.attr('d', this.describeArc(self.cx, self.cy, self.r, 0, deg));
        }, (totalTime * degressToTraverse / 360));
    }

    // Removes the animation by clearing the intervals
    public stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = 0;
        }
        this.container.removeClass('spin');
    }
}

// iOS spinner implementation
class IOSSpinner implements Spinner {
    private svg: any;
    private intervalId: any;

    constructor(private $el) {}

    // create the iOS spinner using svg
    private init() {
        if (this.svg) {
            return;
        }
        const container = $('<div class="ios-spinner"><svg></svg></div>');
        const svg = container.find('svg');
        this.$el.append(container);
        const d = container.width();
        for (let i = 0; i < 12; i++) {
            svg[0].innerHTML += `<line y1="${0.15 * d}" y2="${0.3 * d}"
                                    transform="translate(${0.5 * d}, ${0.5 * d}) rotate(${i * 30})">
                                </line>`;
        }
        container.append(svg);
        this.svg = svg;
    }

    // Sets the svg to rotate depending on "d" value
    public setRotation(d: number): void {
        this.init();
        this.svg.css('transform', `rotateZ( ${Math.round(d / 30) * 30}deg)`);
    }

    // Triggers the rotation with some interval
    public start() {
        this.init();
        let i = 0;
        this.intervalId = setInterval(() => {
            i += 10;
            this.setRotation(i);
        }, 20);
    }

    // Removes the animation by clearing the intervals
    public stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = 0;
        }
    }
}