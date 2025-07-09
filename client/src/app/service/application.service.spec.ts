import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApplicationService } from './application.service';
import { environment } from '../environments/environment';

const API_URL = environment.apiUrl;

describe('ApplicationService', () => {
  let service: ApplicationService;
  let httpMock: HttpTestingController;
  const token = 'test-token';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApplicationService],
    });
    service = TestBed.inject(ApplicationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call applyForJob with correct data and headers', () => {
    const mockData = { jobId: '123', userId: '456' };
    service.applyForJob(mockData, token).subscribe();
    const req = httpMock.expectOne(`${API_URL}/applyForJob`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockData);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({});
  });

  it('should call updateStatus with correct data and headers', () => {
    const applicationId = 'app-1';
    const status = 'Accepted';
    service.updateStatus(applicationId, token, status).subscribe();
    const req = httpMock.expectOne(`${API_URL}/${applicationId}/status`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ status });
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({});
  });

  it('should call revokeApplication with correct headers', () => {
    const applicationId = 'app-2';
    service.revokeApplication(applicationId, token).subscribe();
    const req = httpMock.expectOne(`${API_URL}/revokeApplication/${applicationId}`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({});
  });
});
