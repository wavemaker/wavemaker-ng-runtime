import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelDemoComponent } from './label-demo.component';

describe('LabelDemoComponent', () => {
  let component: LabelDemoComponent;
  let fixture: ComponentFixture<LabelDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
