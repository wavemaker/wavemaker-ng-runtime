import { ComponentFixture } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { ToDatePipe, TrustAsPipe } from '@wm/components/base';
import { VideoComponent } from './video.component';
import { compileTestComponent, mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { AbstractI18nService, App, AppDefaults } from '@wm/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ITestModuleDef, ITestComponentDef, ComponentTestBase } from 'projects/components/base/src/test/common-widget.specs';
import { ComponentsTestModule } from 'projects/components/base/src/test/components.test.module';
import { MockAbstractI18nService } from 'projects/components/base/src/test/util/date-test-util';

const markup = `<video wmVideo
       src="new-video.mp4"
       muted
       name="video1"
       hint="video hint"
       tabindex="0"
       poster="videoposter | image"
       controls="true"
       loop="loop"
       autoplay="true">
</video>`;

@Component({
    template: markup
})
class TestComponent {
    @ViewChild(VideoComponent, { static: true }) wmComponent: VideoComponent;
}

const testModuleDef: ITestModuleDef = {
    declarations: [VideoComponent, TestComponent],
    imports: [FormsModule, ComponentsTestModule],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: AbstractI18nService, useClass: MockAbstractI18nService },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: TrustAsPipe, useClass: TrustAsPipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AppDefaults, useClass: AppDefaults }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: "wm-video",
    widgetSelector: `[wmVideo]`,
    testModuleDef,
    testComponent: TestComponent
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();

describe("wm-video: Component Specific tests", () => {
    let wmComponent: VideoComponent;
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, TestComponent);
        fixture.detectChanges();
        wmComponent = fixture.componentInstance.wmComponent;
    });

    it("should create the component", () => {
        expect(fixture.componentInstance).toBeTruthy();
        expect(wmComponent).toBeTruthy();
    });

    it("should set the mp4format property", () => {
        const newFormat = 'new-video.mp4';
        wmComponent.onPropertyChange('mp4format', newFormat);
        fixture.detectChanges();
        expect(wmComponent.mp4format).toBe(newFormat);
        const videoElement = fixture.debugElement.query(By.css('video'));
        expect(videoElement.nativeElement.src).toContain(newFormat);
    });

    it("should add and remove track element on subtitlesource change", () => {
        const newSource = 'subtitles.vtt';
        wmComponent.onPropertyChange('subtitlesource', newSource);
        fixture.detectChanges();
        const track = fixture.nativeElement.querySelector('track');
        expect(track).toBeTruthy();
        expect(track.getAttribute('src')).toBe(newSource);
        expect(track.getAttribute('label')).toBe(wmComponent.subtitlelang);

        const newSource2 = 'new-subtitles.vtt';
        wmComponent.onPropertyChange('subtitlesource', newSource2);
        fixture.detectChanges();
        const updatedTrack = fixture.nativeElement.querySelector('track');
        expect(updatedTrack).toBeTruthy();
        expect(updatedTrack.getAttribute('src')).toBe(newSource2);
    });

    it("should reflect component properties in the template", () => {
        wmComponent.controls = true;
        wmComponent.autoplay = true;
        fixture.detectChanges();

        const videoElement = fixture.nativeElement.querySelector('video');
        expect(videoElement.controls).toBe(true);
        expect(videoElement.autoplay).toBe(true);
    });

    it("should display videosupportmessage if provided", () => {
        wmComponent.videosupportmessage = 'Your browser does not support the video tag.';
        fixture.detectChanges();

        const videoElement = fixture.nativeElement.querySelector('video');
        expect(videoElement.textContent).toContain('Your browser does not support the video tag.');
    });
});