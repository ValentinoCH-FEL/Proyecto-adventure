import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeleccionAsientoComponent } from "./seleccion-asiento";

describe('SeleccionAsientoComponent', () => {
  let component: SeleccionAsientoComponent;
  let fixture: ComponentFixture<SeleccionAsientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionAsientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionAsientoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
