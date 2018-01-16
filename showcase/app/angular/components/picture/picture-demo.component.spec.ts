import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureDemoComponent } from './picture-demo.component';

describe('PictureDemoComponent', () => {
  let component: PictureDemoComponent;
  let fixture: ComponentFixture<PictureDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PictureDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PictureDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
