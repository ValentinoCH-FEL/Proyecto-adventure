import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroPasajero } from './registro-pasajero';

describe('RegistroPasajero', () => {
  let component: RegistroPasajero;
  let fixture: ComponentFixture<RegistroPasajero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroPasajero]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroPasajero);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
