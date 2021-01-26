import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerPaletteControlComponent } from './player-palette-control.component';

describe('PlayerPaletteControlComponent', () => {
  let component: PlayerPaletteControlComponent;
  let fixture: ComponentFixture<PlayerPaletteControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerPaletteControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerPaletteControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
