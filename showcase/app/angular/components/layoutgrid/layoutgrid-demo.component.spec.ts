import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutgridDemoComponent } from './layoutgrid-demo.component';

describe('LayoutgridDemoComponent', () => {
  let component: LayoutgridDemoComponent;
  let fixture: ComponentFixture<LayoutgridDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayoutgridDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutgridDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
