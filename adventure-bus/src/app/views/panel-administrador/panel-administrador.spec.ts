import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelAdministrador } from './panel-administrador.component';

describe('PanelAdministrador', () => {
  let component: PanelAdministrador;
  let fixture: ComponentFixture<PanelAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelAdministrador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelAdministrador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
