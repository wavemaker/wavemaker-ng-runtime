import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlDemoComponent } from './html-demo.component';

describe('HtmlDemoComponent', () => {
  let component: HtmlDemoComponent;
  let fixture: ComponentFixture<HtmlDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HtmlDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmlDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
