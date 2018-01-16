import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioDemoComponent } from './audio-demo.component';

describe('AudioDemoComponent', () => {
  let component: AudioDemoComponent;
  let fixture: ComponentFixture<AudioDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AudioDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
