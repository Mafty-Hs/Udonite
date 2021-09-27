import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatInputSendfromComponent } from './chat-input-sendfrom.component';

describe('ChatInputSendfromComponent', () => {
  let component: ChatInputSendfromComponent;
  let fixture: ComponentFixture<ChatInputSendfromComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatInputSendfromComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatInputSendfromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
