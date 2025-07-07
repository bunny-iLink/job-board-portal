import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http'; // Modern replacement for HttpClientTestingModule
import { AppliedJobsComponent } from './applied-jobs';

describe('AppliedJobs', () => {
  let component: AppliedJobsComponent;
  let fixture: ComponentFixture<AppliedJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppliedJobsComponent],
      providers: [provideHttpClient()] // ✅ modern replacement for HttpClientTestingModule
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppliedJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
