import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppliedJobs } from './applied-jobs';

describe('AppliedJobs', () => {
  let component: AppliedJobs;
  let fixture: ComponentFixture<AppliedJobs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppliedJobs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppliedJobs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
