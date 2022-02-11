import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerrainFlatComponent } from './terrain-flat.component';

describe('TerrainFlatComponent', () => {
  let component: TerrainFlatComponent;
  let fixture: ComponentFixture<TerrainFlatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TerrainFlatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TerrainFlatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
