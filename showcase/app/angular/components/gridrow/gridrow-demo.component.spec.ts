import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridrowDemoComponent } from './gridrow-demo.component';

describe('GridrowDemoComponent', () => {
  let component: GridrowDemoComponent;
  let fixture: ComponentFixture<GridrowDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridrowDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridrowDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
