import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CerrarComandasComponent } from './cerrar-comandas.component';

describe('CerrarComandasComponent', () => {
  let component: CerrarComandasComponent;
  let fixture: ComponentFixture<CerrarComandasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CerrarComandasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CerrarComandasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
