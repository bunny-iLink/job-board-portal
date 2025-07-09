import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmployerService } from './employer.service';
import { environment } from '../environments/environment';

describe('EmployerService', () => {
  let service: EmployerService;
  let httpMock: HttpTestingController;
  const token = 'test-token';
  const employerId = 'emp-1';
  const API_URL = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmployerService],
    });
    service = TestBed.inject(EmployerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get employer data with correct headers', () => {
    service.getEmployerData(employerId, token).subscribe();
    const req = httpMock.expectOne(`${API_URL}/getEmployerData/${employerId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({});
  });

  it('should update employer with correct headers', () => {
    const data = { name: 'Test Employer' };
    service.updateEmployer(employerId, data, token).subscribe();
    const req = httpMock.expectOne(`${API_URL}/updateEmployer/${employerId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(data);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({});
  });

  it('should delete employer with correct headers', () => {
    service.deleteEmployer(employerId, token).subscribe();
    const req = httpMock.expectOne(`${API_URL}/deleteEmployer/${employerId}`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({});
  });

  it('should get application status summary with correct headers', () => {
    service.getApplicationStatusSummary(employerId, token).subscribe();
    const req = httpMock.expectOne(`${API_URL}/echartStatus/${employerId}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({});
  });
});
