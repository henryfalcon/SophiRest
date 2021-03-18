import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuestoAddComponent } from './puesto-add.component';

describe('PuestoAddComponent', () => {
  let component: PuestoAddComponent;
  let fixture: ComponentFixture<PuestoAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PuestoAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PuestoAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
