import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpObjectComponent } from './help-object.component';

describe('HelpObjectComponent', () => {
  let component: HelpObjectComponent;
  let fixture: ComponentFixture<HelpObjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpObjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
