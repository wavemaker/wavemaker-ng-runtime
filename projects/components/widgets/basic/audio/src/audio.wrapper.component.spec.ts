import {ComponentFixture, waitForAsync} from '@angular/core/testing';
import {Component, Pipe, PipeTransform, ViewChild} from '@angular/core';
import {AudioComponent} from './audio.component';
import {FormsModule} from '@angular/forms';
import {App} from '@wm/core';
import {provideAsWidgetRef} from '@wm/components/base';
import {By} from '@angular/platform-browser';
import {
    ComponentTestBase,
    ITestComponentDef,
    ITestModuleDef
} from 'projects/components/base/src/test/common-widget.specs';
import {compileTestComponent, mockApp} from 'projects/components/base/src/test/util/component-test-util';

@Pipe({ name: 'trustAs' })
class MockTrustAsPipe implements PipeTransform {
    transform(value: string, type: string): string {
        return value;
    }
}

const markup = `<div wmAudio name="audio" hint="audio" [attr.aria-label]="'audio'" tabindex="0"></div>`;

@Component({
    template: markup
})
class AudioWrapperComponent {
    @ViewChild(AudioComponent, { static: true }) wmComponent: AudioComponent;
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule, AudioComponent],
    declarations: [AudioWrapperComponent, MockTrustAsPipe],
    providers: [
        { provide: App, useValue: mockApp },
        provideAsWidgetRef(AudioComponent)
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-audio',
    widgetSelector: '[wmAudio]',
    testModuleDef: testModuleDef,
    testComponent: AudioWrapperComponent,
    inputElementSelector: 'audio'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();

describe('Audio component', () => {
    let wrapperComponent: AudioWrapperComponent;
    let audioComponent: AudioComponent;
    let fixture: ComponentFixture<AudioWrapperComponent>;

    beforeEach(waitForAsync(() => {
        fixture = compileTestComponent(testModuleDef, AudioWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        audioComponent = wrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create audio component', () => {
        expect(wrapperComponent).toBeTruthy();
    });

    it('should initialize with default properties', () => {
        expect(audioComponent.mp3format).toBeUndefined();
        expect(audioComponent.muted).toBeFalsy();
        expect(audioComponent.controls).toBeFalsy();
        expect(audioComponent.loop).toBeFalsy();
        expect(audioComponent.audiopreload).toBeDefined();
        expect(audioComponent.audiosupportmessage).toBeDefined();
        expect(audioComponent.autoplay).toBeFalsy();
    });

    it('should bind mp3format to audio source', () => {
        const mockMp3 = 'http://example.com/audio.mp3';
        audioComponent.mp3format = mockMp3;
        fixture.detectChanges();
        const audioElement: HTMLAudioElement = fixture.debugElement.query(By.css('audio')).nativeElement;
        expect(audioElement.src).toContain(mockMp3);
    });

    it('should reflect muted property', () => {
        audioComponent.muted = true;
        fixture.detectChanges();
        const audioElement: HTMLAudioElement = fixture.debugElement.query(By.css('audio')).nativeElement;
        expect(audioElement.muted).toBeTruthy();
    });

    it('should reflect controls property', () => {
        audioComponent.controls = true;
        fixture.detectChanges();
        const audioElement: HTMLAudioElement = fixture.debugElement.query(By.css('audio')).nativeElement;
        expect(audioElement.controls).toBeTruthy();
    });

    it('should reflect autoplay property', () => {
        audioComponent.autoplay = true;
        fixture.detectChanges();
        const audioElement: HTMLAudioElement = fixture.debugElement.query(By.css('audio')).nativeElement;
        expect(audioElement.autoplay).toBeTruthy();
    });

    it('should reflect loop property', () => {
        audioComponent.loop = true;
        fixture.detectChanges();
        const audioElement: HTMLAudioElement = fixture.debugElement.query(By.css('audio')).nativeElement;
        expect(audioElement.loop).toBeTruthy();
    });

    it('should set preload attribute', () => {
        audioComponent.audiopreload = 'auto';
        fixture.detectChanges();
        const audioElement: HTMLAudioElement = fixture.debugElement.query(By.css('audio')).nativeElement;
        expect(audioElement.preload).toBe('auto');
    });

    it('should display audiosupportmessage when audio is not supported', () => {
        audioComponent.audiosupportmessage = 'Your browser does not support the audio element.';
        fixture.detectChanges();
        const audioElement: HTMLAudioElement = fixture.debugElement.query(By.css('audio')).nativeElement;
        expect(audioElement.textContent).toContain('Your browser does not support the audio element.');
    });
});
