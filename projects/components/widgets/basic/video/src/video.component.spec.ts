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
    declarations: [TestComponent],
    imports: [FormsModule, VideoComponent],
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
// TestBase.verifyPropsInitialization();   /* to be fixed for src, poster property issue */
TestBase.verifyCommonProperties();
TestBase.verifyStyles();

describe("Video Component", () => {
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

    describe('onPropertyChange function', () => {
        it('should update mp4format and transform file URI', () => {
            const newMp4Format = 'new-video.mp4';
            wmComponent.onPropertyChange('mp4format', newMp4Format);
            expect(wmComponent.mp4format).toBe(newMp4Format);
        });

        it('should update webmformat and transform file URI', () => {
            const newWebmFormat = 'video.webm';
            wmComponent.onPropertyChange('webmformat', newWebmFormat);
            expect(wmComponent.webmformat).toBe(newWebmFormat);
        });

        it('should update oggformat and transform file URI', () => {
            const newOggFormat = 'video.ogg';
            wmComponent.onPropertyChange('oggformat', newOggFormat);
            expect(wmComponent.oggformat).toBe(newOggFormat);
        });

        it('should attempt to add track element when subtitlesource is set', () => {
            const subtitleSource = 'subtitle.vtt';
            const appendNodeSpy = jest.spyOn(require('@wm/core'), 'appendNode');
            const createElementSpy = jest.spyOn(require('@wm/core'), 'createElement');
            const trustAsPipeSpy = jest.spyOn(wmComponent['trustAsPipe'], 'transform').mockReturnValue(subtitleSource);

            wmComponent.onPropertyChange('subtitlesource', subtitleSource);
            fixture.detectChanges();

            expect(createElementSpy).toHaveBeenCalledWith('track', {
                kind: 'subtitles',
                label: wmComponent.subtitlelang,
                srclang: wmComponent.subtitlelang,
                src: subtitleSource,
                default: ''
            }, true);

            expect(appendNodeSpy).toHaveBeenCalled();
            const track = fixture.nativeElement.querySelector('track');
            if (track) {
                expect(track.getAttribute('src')).toBe(subtitleSource);
                expect(track.getAttribute('kind')).toBe('subtitles');
                expect(track.getAttribute('label')).toBe(wmComponent.subtitlelang);
                expect(track.getAttribute('srclang')).toBe(wmComponent.subtitlelang);
            }

            appendNodeSpy.mockRestore();
            createElementSpy.mockRestore();
            trustAsPipeSpy.mockRestore();
        });

        it('should attempt to update track element when subtitlesource changes', () => {
            const initialSubtitleSource = 'initial-subtitle.vtt';
            const updatedSubtitleSource = 'updated-subtitle.vtt';
            const removeNodeSpy = jest.spyOn(require('@wm/core'), 'removeNode');
            const appendNodeSpy = jest.spyOn(require('@wm/core'), 'appendNode');
            const createElementSpy = jest.spyOn(require('@wm/core'), 'createElement');
            const trustAsPipeSpy = jest.spyOn(wmComponent['trustAsPipe'], 'transform')
                .mockReturnValueOnce(initialSubtitleSource)
                .mockReturnValueOnce(updatedSubtitleSource);

            wmComponent.onPropertyChange('subtitlesource', initialSubtitleSource);
            fixture.detectChanges();

            wmComponent.onPropertyChange('subtitlesource', updatedSubtitleSource);
            fixture.detectChanges();

            expect(createElementSpy).toHaveBeenCalledTimes(2);
            expect(appendNodeSpy).toHaveBeenCalledTimes(2);

            const track = fixture.nativeElement.querySelector('track');
            if (track) {
                expect(track.getAttribute('src')).toBe(updatedSubtitleSource);
            }
            removeNodeSpy.mockRestore();
            appendNodeSpy.mockRestore();
            createElementSpy.mockRestore();
            trustAsPipeSpy.mockRestore();
        });

        it('should remove existing track and create new one when subtitlesource changes and track exists', () => {
            const subtitleSource = 'subtitle.vtt';
            const mockTrackElement = document.createElement('track');
            const querySelectorSpy = jest.spyOn(wmComponent.nativeElement, 'querySelector')
                .mockReturnValueOnce(mockTrackElement)  // First call returns existing track
                .mockReturnValue(document.createElement('video'));  // Subsequent calls return video element
            const removeNodeSpy = jest.spyOn(require('@wm/core'), 'removeNode');
            const appendNodeSpy = jest.spyOn(require('@wm/core'), 'appendNode');
            const createElementSpy = jest.spyOn(require('@wm/core'), 'createElement');
            const trustAsPipeSpy = jest.spyOn(wmComponent['trustAsPipe'], 'transform')
                .mockReturnValue(subtitleSource);

            wmComponent.onPropertyChange('subtitlesource', subtitleSource);

            expect(querySelectorSpy).toHaveBeenCalledWith('track');
            expect(removeNodeSpy).toHaveBeenCalledWith(mockTrackElement, true);
            expect(createElementSpy).toHaveBeenCalledTimes(1);
            expect(createElementSpy).toHaveBeenCalledWith('track', {
                kind: 'subtitles',
                label: wmComponent.subtitlelang,
                srclang: wmComponent.subtitlelang,
                src: subtitleSource,
                default: ''
            }, true);
            expect(appendNodeSpy).toHaveBeenCalledTimes(1);
            expect(appendNodeSpy.mock.calls[0][1]).toBe(wmComponent.nativeElement.querySelector('video'));

            querySelectorSpy.mockRestore();
            removeNodeSpy.mockRestore();
            appendNodeSpy.mockRestore();
            createElementSpy.mockRestore();
            trustAsPipeSpy.mockRestore();
        });

        it('should create new track when subtitlesource changes and no track exists', () => {
            const subtitleSource = 'subtitle.vtt';
            const querySelectorSpy = jest.spyOn(wmComponent.nativeElement, 'querySelector')
                .mockReturnValueOnce(null)  // First call returns null (no existing track)
                .mockReturnValue(document.createElement('video'));  // Subsequent calls return video element
            const removeNodeSpy = jest.spyOn(require('@wm/core'), 'removeNode');
            const appendNodeSpy = jest.spyOn(require('@wm/core'), 'appendNode');
            const createElementSpy = jest.spyOn(require('@wm/core'), 'createElement');
            const trustAsPipeSpy = jest.spyOn(wmComponent['trustAsPipe'], 'transform')
                .mockReturnValue(subtitleSource);

            wmComponent.onPropertyChange('subtitlesource', subtitleSource);

            expect(querySelectorSpy).toHaveBeenCalledWith('track');
            expect(removeNodeSpy).not.toHaveBeenCalled();
            expect(createElementSpy).toHaveBeenCalledTimes(1);
            expect(createElementSpy).toHaveBeenCalledWith('track', {
                kind: 'subtitles',
                label: wmComponent.subtitlelang,
                srclang: wmComponent.subtitlelang,
                src: subtitleSource,
                default: ''
            }, true);
            expect(appendNodeSpy).toHaveBeenCalledTimes(1);
            expect(appendNodeSpy.mock.calls[0][1]).toBe(wmComponent.nativeElement.querySelector('video'));

            querySelectorSpy.mockRestore();
            removeNodeSpy.mockRestore();
            appendNodeSpy.mockRestore();
            createElementSpy.mockRestore();
            trustAsPipeSpy.mockRestore();
        });
    });
});