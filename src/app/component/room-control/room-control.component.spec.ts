import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomControlComponent } from './room-control.component';

describe('RoomControlComponent', () => {
  let component: RoomControlComponent;
  let fixture: ComponentFixture<RoomControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoomControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
