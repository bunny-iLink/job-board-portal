import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobDetailsComponent } from './job-details';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthService } from '../../../service/auth.service';
import { JobService } from '../../../service/job.service';
import { ApplicationService } from '../../../service/application.service';

// Create mock services
class MockAuthService {
  getToken() {
    return 'mock-token';
  }
}

class MockJobService {
  getJobById(jobId: string, token: string) {
    return of({
      job: { title: 'Mock Job' },
      applicants: []
    });
  }
}

class MockApplicationService {
  updateStatus(applicationId: string, token: string, newStatus: string) {
    return of({}); // Simulate successful update
  }
}

describe('JobDetailsComponent', () => {
  let component: JobDetailsComponent;
  let fixture: ComponentFixture<JobDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobDetailsComponent], // standalone component
      providers: [
        provideHttpClient(),
        { provide: AuthService, useClass: MockAuthService },
        { provide: JobService, useClass: MockJobService },
        { provide: ApplicationService, useClass: MockApplicationService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ id: 'mock-job-id' })),
            snapshot: {
              queryParamMap: convertToParamMap({ id: 'mock-job-id' })
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JobDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load job details on init', () => {
    expect(component.jobId).toBe('mock-job-id');
    expect(component.job).toEqual({ title: 'Mock Job' });
    expect(component.applicants).toEqual([]);
  });
});
