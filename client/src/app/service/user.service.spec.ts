import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { environment } from '../environments/environment';

const API_URL = environment.apiUrl;

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const token = 'test-token';
  const userId = 'user-1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get user data', () => {
    service.getUserData(userId).subscribe();
    const req = httpMock.expectOne(`${API_URL}/getUserData/${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should update user data with correct headers', () => {
    const data = { name: 'Test' };
    service.updateUserData(userId, data, token).subscribe();
    const req = httpMock.expectOne(`${API_URL}/updateUser/${userId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(data);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({});
  });

  it('should delete user with correct headers', () => {
    service.deleteUser(userId, token).subscribe();
    const req = httpMock.expectOne(`${API_URL}/deleteUser/${userId}`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({});
  });

  it('should get user status summary with correct headers', () => {
    service.getUserStatusSummary(userId, token).subscribe();
    const req = httpMock.expectOne(`${API_URL}/user/${userId}/status-summary`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({});
  });

  it('should get domain summary with correct headers', () => {
    service.getDomainSummary(userId, token).subscribe();
    const req = httpMock.expectOne(`${API_URL}/user/${userId}/applications-by-domain`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush([]);
  });
});
