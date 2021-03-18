import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatilloEditComponent } from './platillo-edit.component';

describe('PlatilloEditComponent', () => {
  let component: PlatilloEditComponent;
  let fixture: ComponentFixture<PlatilloEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlatilloEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlatilloEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
