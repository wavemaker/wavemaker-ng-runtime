import { waitForAsync, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import {CarouselDirective} from "./carousel.directive";
import {CarouselTemplateDirective} from "./carousel-template/carousel-template.directive";
import { PipeProvider } from '../../../../../runtime-base/src/services/pipe-provider.service';
import {App, setPipeProvider, $parseExpr, AbstractI18nService} from '@wm/core';
import { BasicModule } from '@wm/components/basic';
import { WmComponentsModule } from '@wm/components/base';
import { MockAbstractI18nService } from 'projects/components/base/src/test/util/date-test-util';
import 'libraries/scripts/swipey/swipey.jquery.plugin.js';

const mockI18 = {
    getwidgetLocale() {

    }
}
//SwipeAnimation.expressionEvaluator = $parseExpr;

const mockApp = {
    subscribe: () => { return () => {}}
};

const markup = `
        <div class="app-carousel carousel">
            <carousel wmCarousel #wm_carousel_ref="wmCarousel"
                height="480" animation="none"
                type="dynamic" name="carousel1"
                change.event="onChangeCB(widget, newIndex, oldIndex)"
                interval="0" [ngClass]="wm_carousel_ref.navigationClass">
                <div *ngIf="!wm_carousel_ref.fieldDefs">{{wm_carousel_ref.nodatamessage}}</div>
                    <slide wmCarouselTemplate   horizontalalign="center" name="carousel_template1" *ngFor="let item of wm_carousel_ref.fieldDefs; let i = index;">
                        <ng-container [ngTemplateOutlet]="tempRef" [ngTemplateOutletContext]="{item:item, index:i}"></ng-container>
                    </slide>
                    <ng-template #tempRef let-item="item" let-index="index">
                    <label wmLabel  name="label1" class="h1" caption="'Label' + index" paddingright="0.5em" paddingleft="0.5em"></label>
                </ng-template>
            </carousel>
        </div>
    `;
@Component({
    template: markup
})
class CarouselSpec {
    @ViewChild('wm_carousel_ref', /* TODO: add static flag */ {static: true}) carousel: CarouselDirective;
    public testdata: any = [{name: 'Peter', age: 21}, {name: 'Tony', age: 42}];

    onChangeCB(widget, newIndex, oldIndex) {
        console.log('testing carousel slide: index changed from', oldIndex, 'to', newIndex);
    }
    constructor(_pipeProvider: PipeProvider) {
        setPipeProvider(_pipeProvider);
    }
}

describe('wm-carousel: Widget specific test cases', () => {
    let fixture: ComponentFixture<CarouselSpec>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [CarouselModule, BasicModule, WmComponentsModule.forRoot()],
            declarations: [CarouselSpec, CarouselDirective, CarouselTemplateDirective],
            providers: [
                {provide: App, useValue: mockApp},
                {provide: AbstractI18nService, useClass: MockAbstractI18nService}
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(CarouselSpec);
        fixture.componentInstance.carousel.onPropertyChange('dataset', fixture.componentInstance.testdata);
        // doing this so that wm styles can reflect
        $('body').addClass('wm-app');
        fixture.detectChanges();
    }));

    it('should create carousel widget', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should initialize currentslide with first object', () => {
        const testData = fixture.componentInstance.testdata;
        fixture.detectChanges();
        expect(fixture.componentInstance.carousel.currentslide).toEqual(testData[0]);
    });

    xit('Left and Right controls on carousel should navigate to previous and next slides respectively', waitForAsync(() => {
        const testData = fixture.componentInstance.testdata;
        // not working without this
        fixture.detectChanges();
        // required as carousel is rendered after animation
        fixture.whenRenderingDone().then(() => {
            // click on next arrow to go to next slide
            fixture.nativeElement.querySelector('.carousel-control-next').click();
            // slide will render after an animation, so wait for rendering to be done
            fixture.whenRenderingDone().then(() => {
                expect(fixture.componentInstance.carousel.previousslide).toEqual(testData[0]);
                expect(fixture.componentInstance.carousel.currentslide).toEqual(testData[1]);

                // click on prev arrow to go to previous slide
                fixture.nativeElement.querySelector('.carousel-control-prev').click();
                fixture.whenRenderingDone().then(() => {
                    expect(fixture.componentInstance.carousel.previousslide).toEqual(testData[1]);
                    expect(fixture.componentInstance.carousel.currentslide).toEqual(testData[0]);
                });
            });
        });
    }));

    xit('should update the animation interval dynamically', (done) => {
        let interval = 5;
        fixture.componentInstance.carousel.setProperty('animation', 'auto');
        fixture.componentInstance.carousel.setProperty('animationinterval', interval);
        fixture.detectChanges();
        // setTimeout is used because animator is initialized after 50 seconds
        setTimeout(() => {
            expect((fixture.componentInstance.carousel as any).animator.interval).toEqual(interval * 1000);
            interval = 10;
            fixture.componentInstance.carousel.setProperty('animationinterval', interval);
            fixture.detectChanges();
            expect((fixture.componentInstance.carousel as any).animator.interval).toEqual(interval * 1000);
            done();
        }, 50);
    });
});
