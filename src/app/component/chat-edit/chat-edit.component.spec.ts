import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatEditComponent } from './chat-edit.component';

describe('ChatEditComponent', () => {
  let component: ChatEditComponent;
  let fixture: ComponentFixture<ChatEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
