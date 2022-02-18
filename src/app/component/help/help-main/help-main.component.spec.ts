import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpMainComponent } from './help-main.component';

describe('HelpMainComponent', () => {
  let component: HelpMainComponent;
  let fixture: ComponentFixture<HelpMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpMainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
