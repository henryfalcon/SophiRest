import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatilloAddComponent } from './platillo-add.component';

describe('PlatilloAddComponent', () => {
  let component: PlatilloAddComponent;
  let fixture: ComponentFixture<PlatilloAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlatilloAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlatilloAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
