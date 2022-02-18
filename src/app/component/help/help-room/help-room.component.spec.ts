import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpRoomComponent } from './help-room.component';

describe('HelpRoomComponent', () => {
  let component: HelpRoomComponent;
  let fixture: ComponentFixture<HelpRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpRoomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
