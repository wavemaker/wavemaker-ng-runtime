import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridcolumnDemoComponent } from './gridcolumn-demo.component';

describe('GridcolumnDemoComponent', () => {
  let component: GridcolumnDemoComponent;
  let fixture: ComponentFixture<GridcolumnDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridcolumnDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridcolumnDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
