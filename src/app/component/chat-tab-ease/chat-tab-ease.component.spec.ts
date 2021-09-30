import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatTabEaseComponent } from './chat-tab-ease.component';

describe('ChatTabEaseComponent', () => {
  let component: ChatTabEaseComponent;
  let fixture: ComponentFixture<ChatTabEaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatTabEaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatTabEaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
