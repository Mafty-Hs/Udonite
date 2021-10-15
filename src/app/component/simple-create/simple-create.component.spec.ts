import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleCreateComponent } from './simple-create.component';

describe('SimpleCreateComponent', () => {
  let component: SimpleCreateComponent;
  let fixture: ComponentFixture<SimpleCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
