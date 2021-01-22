import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerPaletteComponent } from './player-palette.component';

describe('PlayerPaletteComponent', () => {
  let component: PlayerPaletteComponent;
  let fixture: ComponentFixture<PlayerPaletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerPaletteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerPaletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
