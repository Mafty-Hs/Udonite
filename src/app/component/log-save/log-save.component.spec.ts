import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogSaveComponent } from './log-save.component';

describe('LogSaveComponent', () => {
  let component: LogSaveComponent;
  let fixture: ComponentFixture<LogSaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogSaveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogSaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
