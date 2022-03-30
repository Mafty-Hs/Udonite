import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleInventoryComponent } from './simple-inventory.component';

describe('SimpleInventoryComponent', () => {
  let component: SimpleInventoryComponent;
  let fixture: ComponentFixture<SimpleInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleInventoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
