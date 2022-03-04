import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiceSymbolFlatComponent } from './dice-symbol-flat.component';

describe('DiceSymbolFlatComponent', () => {
  let component: DiceSymbolFlatComponent;
  let fixture: ComponentFixture<DiceSymbolFlatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiceSymbolFlatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiceSymbolFlatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
