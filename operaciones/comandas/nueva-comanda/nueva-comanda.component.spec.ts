import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaComandaComponent } from './nueva-comanda.component';

describe('NuevaComandaComponent', () => {
  let component: NuevaComandaComponent;
  let fixture: ComponentFixture<NuevaComandaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NuevaComandaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevaComandaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
