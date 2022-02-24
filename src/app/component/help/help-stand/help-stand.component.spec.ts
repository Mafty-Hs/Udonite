import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpStandComponent } from './help-stand.component';

describe('HelpStandComponent', () => {
  let component: HelpStandComponent;
  let fixture: ComponentFixture<HelpStandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpStandComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpStandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
