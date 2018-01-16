import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxsetDemoComponent } from './checkboxset-demo.component';

describe('CheckboxsetDemoComponent', () => {
  let component: CheckboxsetDemoComponent;
  let fixture: ComponentFixture<CheckboxsetDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckboxsetDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxsetDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
