import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelarComandaComponent } from './cancelar-comanda.component';

describe('CancelarComandaComponent', () => {
  let component: CancelarComandaComponent;
  let fixture: ComponentFixture<CancelarComandaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelarComandaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelarComandaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
