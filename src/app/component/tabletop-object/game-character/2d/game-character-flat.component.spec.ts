import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCharacterFlatComponent } from './game-character-flat.component';

describe('GameCharacterFlatComponent', () => {
  let component: GameCharacterFlatComponent;
  let fixture: ComponentFixture<GameCharacterFlatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameCharacterFlatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameCharacterFlatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
