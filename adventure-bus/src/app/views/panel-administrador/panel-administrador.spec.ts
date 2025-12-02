import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelAdministradorComponent } from './panel-administrador';

describe('PanelAdministrador', () => {
  let component: PanelAdministradorComponent;
  let fixture: ComponentFixture<PanelAdministradorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelAdministradorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelAdministradorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
