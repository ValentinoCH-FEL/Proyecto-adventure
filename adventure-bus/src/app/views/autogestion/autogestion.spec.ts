import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutogestionComponent } from './autogestion';

describe('Autogestion', () => {
  let component: AutogestionComponent;
  let fixture: ComponentFixture<AutogestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutogestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutogestionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
