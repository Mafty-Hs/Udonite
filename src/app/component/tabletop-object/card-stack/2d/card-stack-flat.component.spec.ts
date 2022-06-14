import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardStackFlatComponent } from './card-stack-flat.component';

describe('CardStackFlatComponent', () => {
  let component: CardStackFlatComponent;
  let fixture: ComponentFixture<CardStackFlatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardStackFlatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardStackFlatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
