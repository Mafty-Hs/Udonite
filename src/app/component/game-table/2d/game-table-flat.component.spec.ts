import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameTableFlatComponent } from './game-table-flat.component';

describe('GameTableFlatComponent', () => {
  let component: GameTableFlatComponent;
  let fixture: ComponentFixture<GameTableFlatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameTableFlatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameTableFlatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
