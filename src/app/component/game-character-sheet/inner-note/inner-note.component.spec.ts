import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InnerNoteComponent } from './inner-note.component';

describe('InnerNoteComponent', () => {
  let component: InnerNoteComponent;
  let fixture: ComponentFixture<InnerNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InnerNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InnerNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
