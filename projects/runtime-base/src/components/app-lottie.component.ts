import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';

@Component({
    selector: 'app-lottie',
    styles: `
    .lottie-spinner {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;    
        flex-direction: column; 
        justify-content: center; 
        align-items: center; 
        z-index: 9999;
        background-color: rgba(255, 255, 255, 0.7); 
    }

    .spinner-messages {
        margin-top: 20px;
        font-size: 1rem;
        color: #333;
    }
`,
    template: ` 
        <div class="lottie-spinner" *ngIf="show">
            <ng-lottie
                [options]="options"
                width="250px"
                height="250px"
                (animationCreated)="animationCreated($event)"
            ></ng-lottie>
            <div class="spinner-messages">
                <p *ngIf="!this.spinnermessages[0]">Loading...</p>
                <p *ngFor="let value of spinnermessages" [textContent]="value"></p>
            </div>
        </div>
    `,
    standalone: true,
    imports: [LottieComponent, NgIf],
})
export class LottieAnimationComponent {
    private animationItem: AnimationItem | undefined;

    @Input() show = false;
    @Input() spinnermessages: Array<string> = [];
    @Input() classname = '';
    @Input() arialabel = '';

    options: AnimationOptions = {
        loop: true,
        autoplay: false,
        animationData: {
            "v": "5.5.7",
            "fr": 29.9700012207031,
            "ip": 0,
            "op": 90.0000036657751,
            "w": 500,
            "h": 500,
            "nm": "Spinner Loader",
            "ddd": 0,
            "assets": [],
            "layers": [
                {
                    "ddd": 0,
                    "ind": 1,
                    "ty": 4,
                    "nm": "Spinner",
                    "sr": 1,
                    "ks": {
                        "o": {
                            "a": 0,
                            "k": 100,
                            "ix": 11
                        },
                        "r": {
                            "a": 1,
                            "k": [
                                {
                                    "i": {
                                        "x": [0.667],
                                        "y": [1]
                                    },
                                    "o": {
                                        "x": [0.333],
                                        "y": [0]
                                    },
                                    "t": 0,
                                    "s": [0]
                                },
                                {
                                    "t": 90.0000036657751,
                                    "s": [360]
                                }
                            ],
                            "ix": 10
                        },
                        "p": {
                            "a": 0,
                            "k": [250, 250, 0],
                            "ix": 2
                        },
                        "a": {
                            "a": 0,
                            "k": [0, 0, 0],
                            "ix": 1
                        },
                        "s": {
                            "a": 0,
                            "k": [100, 100, 100],
                            "ix": 6
                        }
                    },
                    "ao": 0,
                    "shapes": [
                        {
                            "ty": "gr",
                            "it": [
                                {
                                    "ty": "rc",
                                    "d": 1,
                                    "s": {
                                        "a": 0,
                                        "k": [200, 20],
                                        "ix": 2
                                    },
                                    "p": {
                                        "a": 0,
                                        "k": [0, 0],
                                        "ix": 3
                                    },
                                    "r": {
                                        "a": 0,
                                        "k": 10,
                                        "ix": 4
                                    },
                                    "nm": "Rectangle Path 1",
                                    "mn": "ADBE Vector Shape - Rect",
                                    "hd": false
                                },
                                {
                                    "ty": "fl",
                                    "c": {
                                        "a": 0,
                                        "k": [0.2, 0.4, 0.8, 1],
                                        "ix": 4
                                    },
                                    "o": {
                                        "a": 0,
                                        "k": 100,
                                        "ix": 5
                                    },
                                    "r": 1,
                                    "bm": 0,
                                    "nm": "Fill 1",
                                    "mn": "ADBE Vector Graphic - Fill",
                                    "hd": false
                                },
                                {
                                    "ty": "tr",
                                    "p": {
                                        "a": 0,
                                        "k": [0, 0],
                                        "ix": 2
                                    },
                                    "a": {
                                        "a": 0,
                                        "k": [0, 0],
                                        "ix": 1
                                    },
                                    "s": {
                                        "a": 0,
                                        "k": [100, 100],
                                        "ix": 3
                                    },
                                    "r": {
                                        "a": 0,
                                        "k": 0,
                                        "ix": 6
                                    },
                                    "o": {
                                        "a": 0,
                                        "k": 100,
                                        "ix": 7
                                    },
                                    "sk": {
                                        "a": 0,
                                        "k": 0,
                                        "ix": 4
                                    },
                                    "sa": {
                                        "a": 0,
                                        "k": 0,
                                        "ix": 5
                                    },
                                    "nm": "Transform"
                                }
                            ],
                            "nm": "Rectangle 1",
                            "np": 3,
                            "cix": 2,
                            "bm": 0,
                            "ix": 1,
                            "mn": "ADBE Vector Group",
                            "hd": false
                        }
                    ],
                    "ip": 0,
                    "op": 90.0000036657751,
                    "st": 0,
                    "bm": 0
                }
            ],
            "markers": []
        },
    };

    animationCreated(animationItem: AnimationItem): void {
        this.animationItem = animationItem;
        this.animationItem.play();
    }

    play(): void {
        if (this.animationItem) {
            this.animationItem.play();
        }
    }

    stop(): void {
        if (this.animationItem) {
            this.animationItem.stop();
        }
    }
}