import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Autogestion } from './autogestion';

describe('Autogestion', () => {
  let component: Autogestion;
  let fixture: ComponentFixture<Autogestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Autogestion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Autogestion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
