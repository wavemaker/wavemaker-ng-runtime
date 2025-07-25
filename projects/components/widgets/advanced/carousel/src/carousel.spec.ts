import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {CarouselModule} from 'ngx-bootstrap/carousel';
import {CarouselDirective} from "./carousel.directive";
import {PipeProvider} from '../../../../../runtime-base/src/services/pipe-provider.service';
import {AbstractI18nService, App, setPipeProvider} from '@wm/core';
import {LabelDirective} from '@wm/components/basic/label';
import {MockAbstractI18nService} from 'projects/components/base/src/test/util/date-test-util';
import 'libraries/scripts/swipey/swipey.jquery.plugin.js';
import {mockApp} from 'projects/components/base/src/test/util/component-test-util';
import {Subject} from 'rxjs';
import {SanitizePipe} from '@wm/components/base';

const markup = `
    <div class="app-carousel carousel">
        <carousel wmCarousel #wm_carousel_ref="wmCarousel"
            height="480" animation="none"
            type="dynamic" name="carousel1"
            change.event="onChangeCB(widget, newIndex, oldIndex)"
            interval="0" [ngClass]="wm_carousel_ref.navigationClass">
            @if(!wm_carousel_ref.fieldDefs){<div>{{wm_carousel_ref.nodatamessage}}</div>}
            @for (item of wm_carousel_ref.fieldDefs; track item; let i = $index) {
                <slide wmCarouselTemplate horizontalalign="center" name="carousel_template1">
                <ng-container [ngTemplateOutlet]="tempRef" [ngTemplateOutletContext]="{item:item, index:i}"></ng-container>
                </slide>
            }
            <ng-template #tempRef let-item="item" let-index="index">
                <label wmLabel name="label1" class="h1" caption="'Label' + index" paddingright="0.5em" paddingleft="0.5em"></label>
            </ng-template>
        </carousel>
    </div>
`;

@Component({
    template: markup
})
class CarouselSpec {
    @ViewChild('wm_carousel_ref', { static: true }) carousel: CarouselDirective;
    public testdata: any = [{ name: 'Peter', age: 21 }, { name: 'Tony', age: 42 }];

    onChangeCB(widget, newIndex, oldIndex) { }

    constructor(_pipeProvider: PipeProvider) {
        setPipeProvider(_pipeProvider);
    }
}

describe('wm-carousel: Widget specific test cases', () => {
    let fixture: ComponentFixture<CarouselSpec>;
    let component: CarouselSpec;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [CarouselModule, LabelDirective, CarouselDirective],
            declarations: [CarouselSpec],
            providers: [
                { provide: App, useValue: mockApp },
                { provide: AbstractI18nService, useClass: MockAbstractI18nService },
                SanitizePipe
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(CarouselSpec);
        component = fixture.componentInstance;
        component.carousel.onPropertyChange('dataset', component.testdata);
        $('body').addClass('wm-app');
        fixture.detectChanges();
    }));

    it('should create carousel widget', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize currentslide with first object', () => {
        const testData = component.testdata;
        fixture.detectChanges();
        expect(component.carousel.currentslide).toEqual(testData[0]);
    });

    it('should have the correct number of slides', () => {
        const slides = fixture.nativeElement.querySelectorAll('.carousel-item');
        expect(slides.length).toBe(component.testdata.length);
    });

    it('should resume carousel on mouseleave', (done) => {
        fixture.whenRenderingDone().then(() => {
            const carouselElement = fixture.nativeElement.querySelector('.carousel');
            carouselElement.dispatchEvent(new Event('mouseleave'));
            fixture.detectChanges();
            expect((component.carousel as any).animator._animationPaused).toBeFalsy();
            done();
        });
    });

    it('should update the animation interval dynamically', (done) => {
        let interval = 5;
        component.carousel.setProperty('animation', 'auto');
        component.carousel.setProperty('animationinterval', interval);
        fixture.detectChanges();
        setTimeout(() => {
            expect((component.carousel as any).animator.interval).toEqual(interval * 1000);
            interval = 10;
            component.carousel.setProperty('animationinterval', interval);
            fixture.detectChanges();
            expect((component.carousel as any).animator.interval).toEqual(interval * 1000);
            done();
        }, 50);
    });

    it('should call setupHandlers and subscribe to slides changes', () => {
        const setupHandlersSpy = jest.spyOn(component.carousel as any, 'setupHandlers');
        const subscribespy = jest.spyOn(component.carousel.slides.changes, 'subscribe');

        component.carousel.ngAfterContentInit();

        expect(setupHandlersSpy).toHaveBeenCalled();
        expect(subscribespy).toHaveBeenCalled();
    });

    it('should trigger animation when slides change', () => {
        const triggerAnimationSpy = jest.spyOn(component.carousel as any, 'triggerAnimation');
        const changesSubject = new Subject<any>();

        jest.spyOn(component.carousel.slides, 'changes', 'get').mockReturnValue(changesSubject);

        component.carousel.ngAfterContentInit();

        // Simulate slides change
        changesSubject.next(component.carousel.slides);

        expect(triggerAnimationSpy).toHaveBeenCalledWith(component.carousel.slides);
    });

    it('should call onChangeCB with correct parameters', () => {
        const onChangeSpy = jest.spyOn(component.carousel as any, 'invokeEventCallback');
        const newIndex = 1;
        const oldIndex = 0;

        component.carousel.onChangeCB(newIndex, oldIndex);

        expect(onChangeSpy).toHaveBeenCalledWith('change', { newIndex, oldIndex });
    });

    it('should update currentslide and previousslide on change', () => {
        const newIndex = 1;
        const oldIndex = 0;

        component.carousel.onChangeCB(newIndex, oldIndex);

        expect(component.carousel.currentslide).toEqual(component.testdata[newIndex]);
        expect(component.carousel.previousslide).toEqual(component.testdata[oldIndex]);
    });

    it('should call triggerAnimation with slides in the subscription callback', () => {
        const triggerAnimationSpy = jest.spyOn(component.carousel as any, 'triggerAnimation');
        const mockSlides = ['slide1', 'slide2'];
        const changesSubject = new Subject<any>();

        jest.spyOn(component.carousel.slides, 'changes', 'get').mockReturnValue(changesSubject);

        component.carousel.ngAfterContentInit();

        // Simulate slides change with mock slides
        changesSubject.next(mockSlides);

        expect(triggerAnimationSpy).toHaveBeenCalledWith(mockSlides);
    });
});
