import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaletteEditComponent } from './palette-edit.component';

describe('PaletteEditComponent', () => {
  let component: PaletteEditComponent;
  let fixture: ComponentFixture<PaletteEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaletteEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaletteEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
