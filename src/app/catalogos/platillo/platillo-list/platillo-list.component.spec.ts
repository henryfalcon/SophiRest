import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatilloListComponent } from './platillo-list.component';

describe('PlatilloListComponent', () => {
  let component: PlatilloListComponent;
  let fixture: ComponentFixture<PlatilloListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlatilloListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlatilloListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
