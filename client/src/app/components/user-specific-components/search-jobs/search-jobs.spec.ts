import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { SearchJobsComponent } from './search-jobs';

describe('SearchJobs', () => {
  let component: SearchJobsComponent;
  let fixture: ComponentFixture<SearchJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchJobsComponent],
      providers: [provideHttpClient()] // ✅ modern replacement for HttpClientTestingModule
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
