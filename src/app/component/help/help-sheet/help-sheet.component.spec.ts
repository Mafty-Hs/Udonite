import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpSheetComponent } from './help-sheet.component';

describe('HelpSheetComponent', () => {
  let component: HelpSheetComponent;
  let fixture: ComponentFixture<HelpSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpSheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
