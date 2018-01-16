import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtongroupDemoComponent } from './buttongroup-demo.component';

describe('ButtongroupDemoComponent', () => {
  let component: ButtongroupDemoComponent;
  let fixture: ComponentFixture<ButtongroupDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtongroupDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtongroupDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
