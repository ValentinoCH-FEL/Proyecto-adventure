import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroPasajeroComponent } from './registro-pasajero'; 

describe('RegistroPasajero', () => {
  let component: RegistroPasajeroComponent;
  let fixture: ComponentFixture<RegistroPasajeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroPasajeroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroPasajeroComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
