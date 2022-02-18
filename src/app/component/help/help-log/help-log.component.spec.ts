import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpLogComponent } from './help-log.component';

describe('HelpLogComponent', () => {
  let component: HelpLogComponent;
  let fixture: ComponentFixture<HelpLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
