import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DespacharComandaComponent } from './despachar-comanda.component';

describe('DespacharComandaComponent', () => {
  let component: DespacharComandaComponent;
  let fixture: ComponentFixture<DespacharComandaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DespacharComandaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DespacharComandaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
