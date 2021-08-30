import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterInventoryComponent } from './counter-inventory.component';

describe('CounterInventoryComponent', () => {
  let component: CounterInventoryComponent;
  let fixture: ComponentFixture<CounterInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CounterInventoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CounterInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
