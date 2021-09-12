import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuestoEditComponent } from './puesto-edit.component';

describe('PuestoEditComponent', () => {
  let component: PuestoEditComponent;
  let fixture: ComponentFixture<PuestoEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PuestoEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PuestoEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
