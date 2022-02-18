import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpCharacterComponent } from './help-character.component';

describe('HelpCharacterComponent', () => {
  let component: HelpCharacterComponent;
  let fixture: ComponentFixture<HelpCharacterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpCharacterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpCharacterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
