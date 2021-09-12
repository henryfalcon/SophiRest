import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CantObservComponent } from './cant-observ.component';

describe('CantObservComponent', () => {
  let component: CantObservComponent;
  let fixture: ComponentFixture<CantObservComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CantObservComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CantObservComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
