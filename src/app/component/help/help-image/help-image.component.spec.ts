import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpImageComponent } from './help-image.component';

describe('HelpImageComponent', () => {
  let component: HelpImageComponent;
  let fixture: ComponentFixture<HelpImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
