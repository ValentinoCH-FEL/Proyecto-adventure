import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionAsiento } from './seleccion-asiento';

describe('SeleccionAsiento', () => {
  let component: SeleccionAsiento;
  let fixture: ComponentFixture<SeleccionAsiento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionAsiento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionAsiento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
