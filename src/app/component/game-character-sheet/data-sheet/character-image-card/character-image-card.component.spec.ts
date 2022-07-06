import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterImageCardComponent } from './character-image-card.component';

describe('CharacterImageCardComponent', () => {
  let component: CharacterImageCardComponent;
  let fixture: ComponentFixture<CharacterImageCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CharacterImageCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterImageCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
