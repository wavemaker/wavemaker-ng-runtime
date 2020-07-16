import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { CarouselModule } from 'ngx-bootstrap';
import {CarouselDirective} from "./carousel.directive";
import {CarouselTemplateDirective} from "./carousel-template/carousel-template.directive";
import { PipeProvider } from '../../../../../runtime-base/src/services/pipe-provider.service';
import {App, setPipeProvider, $parseExpr} from '@wm/core';
import { BasicModule } from '@wm/components/basic';
import { WmComponentsModule } from '@wm/components/base';

// this is required by swipey
($.fn as any).swipeAnimation.expressionEvaluator = $parseExpr;

const mockApp = {
    subscribe: ()=>{}
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

    beforeEach(async(()=>{
        TestBed.configureTestingModule({
            imports: [CarouselModule, BasicModule, WmComponentsModule.forRoot()],
            declarations: [CarouselSpec, CarouselDirective, CarouselTemplateDirective],
            providers: [
                {provide: App, useValue: mockApp}
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

    it('Left and Right controls on carousel should navigate to previous and next slides respectively', async(() => {
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
});
