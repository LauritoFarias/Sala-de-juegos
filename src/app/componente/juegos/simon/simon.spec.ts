import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Simon } from './simon';

describe('Simon', () => {
  let component: Simon;
  let fixture: ComponentFixture<Simon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Simon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Simon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
