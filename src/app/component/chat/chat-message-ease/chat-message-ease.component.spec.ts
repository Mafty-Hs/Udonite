import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMessageEaseComponent } from './chat-message-ease.component';

describe('ChatMessageEaseComponent', () => {
  let component: ChatMessageEaseComponent;
  let fixture: ComponentFixture<ChatMessageEaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatMessageEaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatMessageEaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
