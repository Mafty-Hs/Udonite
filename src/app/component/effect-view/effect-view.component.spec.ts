import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EffectViewComponent } from './effect-view.component';

describe('EffectViewComponent', () => {
  let component: EffectViewComponent;
  let fixture: ComponentFixture<EffectViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EffectViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EffectViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
