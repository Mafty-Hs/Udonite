import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatInputSettingComponent } from './chat-input-setting.component';

describe('ChatInputSettingComponent', () => {
  let component: ChatInputSettingComponent;
  let fixture: ComponentFixture<ChatInputSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatInputSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatInputSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
