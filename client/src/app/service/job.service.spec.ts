import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JobService } from './job.service';
import { environment } from '../environments/environment';

describe('JobService', () => {
  let service: JobService;
  let httpMock: HttpTestingController;
  const token = 'test-token';
  const employerId = 'emp-1';
  const jobId = 'job-1';
  const API_URL = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [JobService],
    });
    service = TestBed.inject(JobService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a job with correct headers', () => {
    const data = { title: 'Test Job' };
    service.addJob(data, token).subscribe();
    const req = httpMock.expectOne(`${API_URL}/addJob`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({});
  });

  it('should get job summaries with correct headers', () => {
    service.getJobSummaries(employerId, token).subscribe();
    const req = httpMock.expectOne(`${API_URL}/employer/${employerId}/jobs-summary`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush([]);
  });

  it('should get job by id with correct headers', () => {
    service.getJobById(jobId, token).subscribe();
    const req = httpMock.expectOne(`${API_URL}/getJobById/${jobId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({});
  });

  it('should get jobs with correct headers', () => {
    service.getJobs(employerId, token).subscribe();
    const req = httpMock.expectOne(`${API_URL}/getJobs/${employerId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush([]);
  });

  it('should update job with correct headers', () => {
    const payload = { title: 'Updated Job' };
    service.updateJob(jobId, payload, token).subscribe();
    const req = httpMock.expectOne(`${API_URL}/updateJob/${jobId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({});
  });

  it('should delete job with correct headers', () => {
    service.deleteJob(jobId, token).subscribe();
    const req = httpMock.expectOne(`${API_URL}/deleteJob/${jobId}`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({});
  });
});
