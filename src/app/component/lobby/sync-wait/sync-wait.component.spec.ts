import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncWaitComponent } from './sync-wait.component';

describe('SyncWaitComponent', () => {
  let component: SyncWaitComponent;
  let fixture: ComponentFixture<SyncWaitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SyncWaitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncWaitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
