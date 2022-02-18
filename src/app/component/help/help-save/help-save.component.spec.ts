import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpSaveComponent } from './help-save.component';

describe('HelpSaveComponent', () => {
  let component: HelpSaveComponent;
  let fixture: ComponentFixture<HelpSaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpSaveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpSaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
