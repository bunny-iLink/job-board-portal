import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../environments/environment';

const API_URL = environment.apiUrl;

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let platformId: Object;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, { provide: PLATFORM_ID, useValue: 'browser' }],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    platformId = TestBed.inject(PLATFORM_ID);
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get/set token and user in localStorage', () => {
    localStorage.setItem('token', 'abc123');
    localStorage.setItem('user', JSON.stringify({ _id: '1', name: 'Test', role: 'user' }));
    expect(service.getToken()).toBe('abc123');
    expect(service.getUser()).toEqual({ _id: '1', name: 'Test', role: 'user' });
    expect(service.getUserId()).toBe('1');
    expect(service.getUserName()).toBe('Test');
    expect(service.getUserRole()).toBe('user');
  });

  it('should remove token and user on logout', () => {
    localStorage.setItem('token', 'abc123');
    localStorage.setItem('user', JSON.stringify({ _id: '1', name: 'Test' }));
    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should call login and store token/user in localStorage', () => {
    const loginData = { email: 'test@test.com', password: 'pass' };
    const mockResponse = { token: 'jwt-token', user: { _id: '1', name: 'Test', role: 'user' } };
    service.login(loginData).subscribe(res => {
      expect(res).toEqual(mockResponse);
      expect(localStorage.getItem('token')).toBe('jwt-token');
      expect(JSON.parse(localStorage.getItem('user')!)).toEqual(mockResponse.user);
    });
    const req = httpMock.expectOne(`${API_URL}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginData);
    req.flush(mockResponse);
  });
});
