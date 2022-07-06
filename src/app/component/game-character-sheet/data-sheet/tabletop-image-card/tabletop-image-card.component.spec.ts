import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabletopImageCardComponent } from './tabletop-image-card.component';

describe('TabletopImageCardComponent', () => {
  let component: TabletopImageCardComponent;
  let fixture: ComponentFixture<TabletopImageCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabletopImageCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabletopImageCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
