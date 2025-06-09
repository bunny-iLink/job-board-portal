import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDetails } from './job-details';

describe('JobDetails', () => {
  let component: JobDetails;
  let fixture: ComponentFixture<JobDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
