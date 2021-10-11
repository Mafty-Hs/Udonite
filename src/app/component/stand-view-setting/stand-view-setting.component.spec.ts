import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandViewSettingComponent } from './stand-view-setting.component';

describe('StandViewSettingComponent', () => {
  let component: StandViewSettingComponent;
  let fixture: ComponentFixture<StandViewSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StandViewSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StandViewSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
