import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespuestasEncuesta } from './respuestas-encuesta';

describe('RespuestasEncuesta', () => {
  let component: RespuestasEncuesta;
  let fixture: ComponentFixture<RespuestasEncuesta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RespuestasEncuesta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RespuestasEncuesta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
