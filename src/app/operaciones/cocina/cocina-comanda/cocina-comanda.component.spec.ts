import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CocinaComandaComponent } from './cocina-comanda.component';

describe('CocinaComandaComponent', () => {
  let component: CocinaComandaComponent;
  let fixture: ComponentFixture<CocinaComandaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CocinaComandaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CocinaComandaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
