import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesaMeseroComponent } from './mesa-mesero.component';

describe('MesaMeseroComponent', () => {
  let component: MesaMeseroComponent;
  let fixture: ComponentFixture<MesaMeseroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MesaMeseroComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MesaMeseroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
